# Athena AI Investing

## Overview

Athena AI Investing is a luxury conversational investment platform that provides AI-powered investment advice and portfolio management. It aims to combine the accessibility of a conversational interface with sophisticated financial intelligence. The platform offers three adaptive interface modes—Amanda Mode (conversational AI avatar), Hybrid Mode (dashboard with mini-Amanda), and Terminal Mode (multi-panel institutional interface)—to cater to diverse user preferences and investment needs. Its core purpose is to make advanced investment capabilities available through an intuitive, conversational user experience, positioning itself as a revolutionary first-mover in AI-driven wealth management.

## Recent Changes

### October 23, 2025 - Critical UX Improvements & Bug Fixes
- **Session Persistence Fixed**: Mobile users now stay logged in for 30 days
  - Updated session configuration with proper cookie settings
  - sameSite: 'lax' for better mobile compatibility
  - No more unexpected logouts on mobile devices
- **FloatingAthenaOrb Added**: AI assistant now accessible from ALL pages
  - Persistent floating orb in bottom-right corner
  - Available on Dashboard, Watchlist, Trades, Analytics, Portfolio pages
  - Opens chat panel on click for instant AI assistance
- **Enhanced Onboarding Experience**: Clear demo mode indicators throughout
  - Prominent "DEMO MODE - Virtual Trading" banner
  - Welcome section explaining $100,000 virtual cash
  - "Demo Trade - No Real Money" badges in trade modals
  - Quick action buttons for new users: "Make Your First Trade" and "View Tutorials"
- **Market News Section**: Prominent news aggregation on Dashboard
  - 6 latest market news items with sentiment badges (Bullish/Bearish/Neutral)
  - Shows source, relevant tickers, and timestamps
  - Clickable for full article view in modal
- **Portfolio Mock Data Fixed**: Now showing realistic demo portfolio
  - Total value: $125,850 (was showing $0.00)
  - 8 realistic tech stock holdings (AAPL, MSFT, GOOGL, TSLA, NVDA, META, AMZN, JPM)
  - Proper sector allocations and performance metrics
  - Cash balance: $25,000 for demo trading

### October 23, 2025 - Payment Integration & Educational Content
- **Stripe Payment Integration**: Added real payment processing for account funding
  - Integrated Stripe for credit/debit cards, bank transfers (ACH)
  - Awaiting user's Stripe API keys (VITE_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY)
  - Replaces demo-only funding with production-ready payment flow
- **Educational Content Pages**: Added professional trading platform resources
  - **Tutorials Page**: Comprehensive learning paths from beginner to advanced
    - Getting Started lessons (First Trade, Portfolio Understanding, Voice Commands)
    - Investment Strategies (Diversification, Dollar-Cost Averaging, Market Indicators)
    - Risk Management (Stop-Loss Orders, Portfolio Hedging, Position Sizing)
    - Advanced Analytics (Correlation Analysis, Factor Exposure, Stress Testing)
  - **FAQ Page**: 30+ common questions across 6 categories
    - Account & Getting Started
    - Trading & Orders
    - Platform Features
    - Analytics & Research
    - Security & Privacy
    - Payments & Taxes
    - Searchable with accordion UI
  - **Help Center**: Central support hub with quick actions, resources, and contact options
    - Email, phone, and live chat support info
    - Links to tutorials, FAQ, and security resources
    - Popular articles and getting started guides

## User Preferences

- I prefer simple language.
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `Z`.
- Do not make changes to the file `Y`.

## System Architecture

Athena is built with a modern web stack. The frontend utilizes React, TypeScript, Tailwind CSS, and shadcn/ui to create a luxury design system featuring pure black backgrounds, purple accents, and glassmorphism with `rounded-[28px]` borders. Typography uses the Inter font with ultra-light weights for headlines and light weights for body text, optimized for desktop with responsive adjustments.

The backend is developed with Node.js and Express, written in TypeScript, managing API endpoints for authentication, portfolio management, watchlist, market data, trading, and AI chat. Core features include:

- **Adaptive Interface Modes**: ✅ Three distinct UI modes (Amanda, Hybrid, Terminal) with seamless switching and persistent user preferences. Mode switching works via Navigation header and mode selector.
- **Voice Integration**: ✅ OpenAI Whisper for transcription and OpenAI TTS (nova voice) integrated across all modes with portfolio context. Voice input/output components implemented in all three modes.
- **Conversational AI**: ✅ AI-powered chat interface providing investment advice enriched with portfolio context. Uses OpenAI GPT-4 via Replit AI Integrations.
- **Adaptive Intelligence System**: ✅ Real-time analysis of user conversation patterns (message length, technical terms, question depth, urgency, response timing) dynamically adjusts AI responses. Intelligent mode suggestions appear via ModeSuggestion component based on user interaction patterns.
- **AI Trade Suggestions**: ✅ Users can generate AI trade recommendations with one click from Dashboard or Trades page. Suggestions display reasoning, confidence levels, and approve/reject actions. Backend endpoint: /api/ai/trade-suggestions
- **Portfolio Management**: ✅ Complete holdings management, portfolio summary with KPIs, performance charts, sector allocation, and watchlist with quote refreshing.
- **Trading System**: ✅ Full trade execution with multiple order types (Market, Limit, Stop, Stop-Limit), time-in-force options, balance validation, and ExecuteTradeModal for buy/sell operations.
- **Analytics**: ✅ Institutional-grade analytics including correlation analysis, factor exposure, market regime tracking, stress testing, and comprehensive risk metrics.
- **Real-time Updates**: ⚠️ WebSocket server configured (server/routes.ts:1336) but not actively streaming market data. Awaiting Alpha Vantage API key to enable live market data broadcasts. Currently uses HTTP polling for quote updates.
- **Authentication**: ✅ Secure user authentication using Passport.js with PostgreSQL-persisted sessions (connect-pg-simple) preventing logout on server restart. JSON error responses, proper session cleanup.
- **Cache Management**: ✅ All mutations (trades, deposits, watchlist operations) properly invalidate TanStack Query caches for real-time UI updates without page refresh.
- **UI/UX Implementation**: ✅ Luxury minimal aesthetic with pure black backgrounds, purple accents (hsl(280 100% 70%)), glassmorphism effects, rounded-[28px] borders, and generous spacing throughout.

## External Dependencies

- **Database**: ✅ PostgreSQL (Neon serverless) with Drizzle ORM - Fully configured and operational.
- **AI**: ✅ OpenAI GPT-4 (via Replit AI Integrations) - Configured with API keys for conversational AI, Whisper speech-to-text, and TTS (nova voice) text-to-speech.
- **Market Data**: ⚠️ Alpha Vantage - Backend integration code ready (server/services/marketService.ts), awaiting ALPHA_VANTAGE_API_KEY from user. Currently using mock data for quotes, indices, and news.
- **Payments**: ⏳ Stripe integration implemented and ready. Awaiting VITE_STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY from user to enable real payment processing (credit/debit cards, ACH bank transfers).
- **Frontend State Management**: ✅ TanStack Query v5 for server state management with proper cache invalidation across all mutations.

## Implementation Status

### Completed Features (✅)
1. Three adaptive interface modes with seamless switching
2. Voice integration (Whisper + TTS) across all modes  
3. Conversational AI with portfolio context
4. Adaptive Intelligence System with mode suggestions
5. AI trade suggestions with UI buttons (Dashboard & Trades pages)
6. Complete portfolio management (holdings, watchlist, KPIs, charts)
7. Full trading system with multiple order types
8. Institutional-grade analytics suite
9. Authentication with PostgreSQL session persistence
10. Luxury design system matching landing page vision
11. Comprehensive cache invalidation for real-time UI updates
12. Educational content (Tutorials, FAQ, Help Center)
13. Stripe payment integration (ready for API keys)

### Pending Features (⚠️)
1. **WebSocket Real-time Market Data**: Server infrastructure ready, awaiting Alpha Vantage API key to enable live streaming
2. **Real Market Data**: Currently using mock data until ALPHA_VANTAGE_API_KEY is provided

### Planned Features (ℹ️)
1. Stripe payment integration for account funding (manual funding works currently)