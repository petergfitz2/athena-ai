import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, pgEnum, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Avatar definitions
export const avatars = pgTable("avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  personaKey: varchar("persona_key", { length: 50 }).unique(),
  imageUrl: text("image_url").notNull(),
  personalityProfile: jsonb("personality_profile").$type<{
    traits: string[];
    tradingStyle: 'aggressive' | 'conservative' | 'analytical' | 'balanced';
    tone: 'professional' | 'casual' | 'mentor' | 'peer';
    backstory?: string;
  }>().notNull(),
  voiceStyle: varchar("voice_style", { length: 50 }),
  isPreset: boolean("is_preset").default(false).notNull(),
  generationParams: jsonb("generation_params").$type<{
    prompt?: string;
    style?: string;
    mood?: string;
  }>(),
});

// User avatar selections and custom creations
export const userAvatars = pgTable("user_avatars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  avatarId: varchar("avatar_id").references(() => avatars.id),
  customPrompt: text("custom_prompt"),
  tradingStyle: varchar("trading_style", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  accountBalance: decimal("account_balance", { precision: 18, scale: 2 }).notNull().default('0'),
  profileImageUrl: text("profile_image_url"),
  phoneNumber: text("phone_number"),
  preferredMode: text("preferred_mode").default('amanda'),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  activeAvatarId: varchar("active_avatar_id").references(() => avatars.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export const updateUserProfileSchema = z.object({
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  preferredMode: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;

// Avatar schemas and types
export const insertAvatarSchema = createInsertSchema(avatars).omit({
  id: true,
});

export const insertUserAvatarSchema = createInsertSchema(userAvatars).omit({
  id: true,
  createdAt: true,
});

export type InsertAvatar = z.infer<typeof insertAvatarSchema>;
export type Avatar = typeof avatars.$inferSelect;
export type InsertUserAvatar = z.infer<typeof insertUserAvatarSchema>;
export type UserAvatar = typeof userAvatars.$inferSelect;

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Account transactions (deposits, withdrawals)
export const accountTransactions = pgTable("account_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'trade_buy', 'trade_sell'
  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'failed'
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAccountTransactionSchema = createInsertSchema(accountTransactions).omit({
  id: true,
  createdAt: true,
});

export type InsertAccountTransaction = z.infer<typeof insertAccountTransactionSchema>;
export type AccountTransaction = typeof accountTransactions.$inferSelect;

// Portfolio holdings
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  averageCost: decimal("average_cost", { precision: 18, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertHoldingSchema = createInsertSchema(holdings).omit({
  id: true,
  updatedAt: true,
});

export type InsertHolding = z.infer<typeof insertHoldingSchema>;
export type Holding = typeof holdings.$inferSelect;

// Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  startedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Message role enum
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  audioUrl: text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Trade status and type enums
export const tradeTypeEnum = pgEnum("trade_type", ["buy", "sell"]);
export const tradeStatusEnum = pgEnum("trade_status", ["pending", "approved", "executed", "rejected"]);

// Trades
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  type: tradeTypeEnum("type").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  price: decimal("price", { precision: 18, scale: 2 }).notNull(),
  status: tradeStatusEnum("status").notNull().default('pending'),
  reasoning: text("reasoning"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

// Watchlist
export const watchlist = pgTable("watchlist", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  addedAt: true,
});

export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlist.$inferSelect;

// Question depth enum
export const questionDepthEnum = pgEnum("question_depth", ["none", "simple", "moderate", "deep"]);

// Interface mode enum
export const interfaceModeEnum = pgEnum("interface_mode", ["athena", "hybrid", "terminal"]);

// Message metrics (per-message analysis)
export const messageMetrics = pgTable("message_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id, { onDelete: 'cascade' }),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  wordCount: integer("word_count").notNull(),
  characterCount: integer("character_count").notNull(),
  hasQuestion: boolean("has_question").notNull().default(false),
  questionDepth: questionDepthEnum("question_depth").notNull().default('none'),
  technicalTermCount: integer("technical_term_count").notNull().default(0),
  urgencySignals: text("urgency_signals").array(),
  responseTimeSeconds: integer("response_time_seconds"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageMetricsSchema = createInsertSchema(messageMetrics).omit({
  id: true,
  createdAt: true,
});

export type InsertMessageMetrics = z.infer<typeof insertMessageMetricsSchema>;
export type MessageMetrics = typeof messageMetrics.$inferSelect;

// Conversation analysis (aggregate scores)
export const conversationAnalysis = pgTable("conversation_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: 'cascade' }).unique(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  hurriedScore: decimal("hurried_score", { precision: 5, scale: 2 }).notNull().default('0'),
  analyticalScore: decimal("analytical_score", { precision: 5, scale: 2 }).notNull().default('0'),
  conversationalScore: decimal("conversational_score", { precision: 5, scale: 2 }).notNull().default('0'),
  recommendedMode: interfaceModeEnum("recommended_mode"),
  messageCount: integer("message_count").notNull().default(0),
  avgResponseTimeSeconds: integer("avg_response_time_seconds"),
  lastAnalyzedAt: timestamp("last_analyzed_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertConversationAnalysisSchema = createInsertSchema(conversationAnalysis).omit({
  id: true,
  lastAnalyzedAt: true,
  updatedAt: true,
});

export type InsertConversationAnalysis = z.infer<typeof insertConversationAnalysisSchema>;
export type ConversationAnalysis = typeof conversationAnalysis.$inferSelect;

// Market quote data (for real-time pricing)
export const MarketQuoteSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number().optional(),
  marketCap: z.number().optional(),
  pe: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  open: z.number().optional(),
  previousClose: z.number().optional(),
  timestamp: z.number(),
});

export type MarketQuote = z.infer<typeof MarketQuoteSchema>;

// Market index data
export const MarketIndexSchema = z.object({
  symbol: z.string(), // "^GSPC", "^IXIC", "^DJI"
  name: z.string(), // "S&P 500", "NASDAQ", "Dow Jones"
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  timestamp: z.number(),
});

export type MarketIndex = z.infer<typeof MarketIndexSchema>;

// News article data
export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  url: z.string(),
  source: z.string(),
  publishedAt: z.string(),
  imageUrl: z.string().optional(),
  tickers: z.array(z.string()).optional(),
  sentimentScore: z.number().optional(),
  sentimentLabel: z.string().optional(),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;

// Historical price data for charts
export const HistoricalDataPointSchema = z.object({
  date: z.string(), // ISO date string
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export type HistoricalDataPoint = z.infer<typeof HistoricalDataPointSchema>;

export const HistoricalDataSchema = z.object({
  symbol: z.string(),
  period: z.enum(['1D', '5D', '1M', '3M', '6M', '1Y', 'YTD', '5Y']),
  data: z.array(HistoricalDataPointSchema),
});

export type HistoricalData = z.infer<typeof HistoricalDataSchema>;

// Portfolio summary (calculated aggregates)
export const PortfolioSummarySchema = z.object({
  totalValue: z.number(),
  totalCost: z.number(),
  totalGain: z.number(),
  totalGainPercent: z.number(),
  dayGain: z.number().optional(),
  dayGainPercent: z.number().optional(),
  cashBalance: z.number(),
  holdingsCount: z.number(),
  topHoldings: z.array(z.object({
    symbol: z.string(),
    value: z.number(),
    percentOfPortfolio: z.number(),
  })).optional(),
  sectorAllocation: z.record(z.number()).optional(),
});

export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
