import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Automatically create sessions table if needed
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  console.log('[UPSERT_USER] Starting with claims:', {
    sub: claims["sub"],
    email: claims["email"],
    first_name: claims["first_name"],
    last_name: claims["last_name"],
  });
  
  try {
    const userData = {
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    };
    
    console.log('[UPSERT_USER] Calling storage.upsertUser with data:', userData);
    const result = await storage.upsertUser(userData);
    console.log('[UPSERT_USER] Successfully saved user:', result.id);
    return result;
  } catch (error) {
    console.error('[UPSERT_USER] Failed to save user:', error);
    console.error('[UPSERT_USER] Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    console.log('[VERIFY] Function called with tokens');
    
    try {
      const user = {};
      
      console.log('[VERIFY] Calling updateUserSession...');
      updateUserSession(user, tokens);
      console.log('[VERIFY] updateUserSession completed successfully');
      
      const claims = tokens.claims();
      console.log('[VERIFY] User claims:', {
        sub: claims["sub"],
        email: claims["email"],
        first_name: claims["first_name"],
        last_name: claims["last_name"],
      });
      
      console.log('[VERIFY] Calling upsertUser...');
      await upsertUser(claims);
      console.log('[VERIFY] upsertUser completed successfully');
      
      console.log('[VERIFY] Calling verified() with user');
      verified(null, user);
      console.log('[VERIFY] Authentication successful!');
    } catch (error) {
      console.error('[VERIFY] Error during verification:', error);
      console.error('[VERIFY] Error details:', JSON.stringify(error, null, 2));
      verified(error as Error, false);
    }
  };

  // Register strategies for all REPLIT_DOMAINS
  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }
  
  // Also register for localhost (for development)
  // Use the actual Replit domain for callback even when accessed as localhost
  const localhostStrategy = new Strategy(
    {
      name: `replitauth:localhost`,
      config,
      scope: "openid email profile offline_access",
      callbackURL: `https://${process.env.REPLIT_DOMAINS}/api/callback`,
    },
    verify,
  );
  passport.use(localhostStrategy);

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Use the correct strategy based on environment
    const strategyName = req.hostname === 'localhost' 
      ? 'replitauth:localhost' 
      : `replitauth:${req.hostname}`;
    
    console.log('Login attempt with strategy:', strategyName, 'hostname:', req.hostname);
    
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    console.log('[CALLBACK] Handler started');
    console.log('[CALLBACK] Query params:', req.query);
    console.log('[CALLBACK] Headers host:', req.headers.host);
    
    // Check if request is coming from Replit domain
    const isReplitDomain = req.hostname.includes('replit.dev') || req.hostname.includes('replit.app');
    
    // Use the correct strategy based on the actual hostname
    const strategyName = (req.hostname === 'localhost' || req.hostname === '0.0.0.0')
      ? 'replitauth:localhost' 
      : `replitauth:${req.hostname}`;
    
    console.log('[CALLBACK] Using strategy:', strategyName, 'hostname:', req.hostname, 'isReplitDomain:', isReplitDomain);
    
    console.log('[CALLBACK] About to call passport.authenticate...');
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/dashboard",
      failureRedirect: "/",
    }, (err, user, info) => {
      console.log('[CALLBACK] Authenticate callback - err:', err);
      console.log('[CALLBACK] Authenticate callback - user:', user);
      console.log('[CALLBACK] Authenticate callback - info:', info);
      
      if (err) {
        console.error('[CALLBACK] Authentication error:', err);
        return res.redirect('/');
      }
      
      if (!user) {
        console.log('[CALLBACK] No user returned, redirecting to /');
        return res.redirect('/');
      }
      
      console.log('[CALLBACK] User authenticated, logging in...');
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('[CALLBACK] Login error:', loginErr);
          return res.redirect('/');
        }
        console.log('[CALLBACK] Login successful, redirecting to /dashboard');
        return res.redirect('/dashboard');
      });
    })(req, res, next);
    
    console.log('[CALLBACK] Handler completed');
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};