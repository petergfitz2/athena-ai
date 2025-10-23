# Athena AI Investing

## Overview

Athena AI Investing is a luxury conversational investment platform that provides AI-powered investment advice and portfolio management. It aims to combine the accessibility of a conversational interface with sophisticated financial intelligence. The platform offers three adaptive interface modes—Amanda Mode (conversational AI avatar), Hybrid Mode (dashboard with mini-Amanda), and Terminal Mode (multi-panel institutional interface)—to cater to diverse user preferences and investment needs. Its core purpose is to make advanced investment capabilities available through an intuitive, conversational user experience, positioning itself as a revolutionary first-mover in AI-driven wealth management.

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
- **Payments**: ℹ️ Stripe integration planned but not yet required. Account funding currently works via manual balance adjustment in Settings page.
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

### Pending Features (⚠️)
1. **WebSocket Real-time Market Data**: Server infrastructure ready, awaiting Alpha Vantage API key to enable live streaming
2. **Real Market Data**: Currently using mock data until ALPHA_VANTAGE_API_KEY is provided

### Planned Features (ℹ️)
1. Stripe payment integration for account funding (manual funding works currently)