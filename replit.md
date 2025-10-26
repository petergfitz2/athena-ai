# Athena AI Investing

## Overview
Athena AI Investing is a luxury AI-powered investment platform designed to be a personal investment advisor through a professional female trader avatar. The platform aims to make institutional-grade investing tools accessible, combining sophisticated analytics, social trading, gamification, and AI-driven insights for all user levels. It delivers an intuitive, adaptive interface that learns from user behavior, providing features like personalized AI daily briefings, deep portfolio analytics, and an investment simulator.

### Recent Improvements (Oct 26, 2025)

#### Market Ticker Enhancements
- **Enhanced Visibility**: Applied bright white text (90% opacity) with proper padding for better readability
- **Eliminated Flicker**: Fixed infinite re-render bug using React.memo and stable state management
- **Polished Styling**: Added gradient background (zinc-900 to zinc-800) with elegant divider lines
- **Layout Fix**: Corrected positioning to prevent header control overlay issues

#### AI Conversation Intelligence
- **Rich Portfolio Context**: AI now receives real-time P&L, top/worst performers, and total portfolio value
- **Performance Metrics**: Integrated detailed holdings with gain percentages for informed responses
- **Dynamic Context**: Portfolio metrics automatically update with each message for accurate advice

#### Market Sentiment Visual Upgrade
- **Animated Backgrounds**: Dynamic gradients based on bullish/bearish/neutral sentiment
- **Live Indicators**: Pulsing status dots and animated confidence progress bars
- **Enhanced Interactivity**: Hover effects with scale transformations and elevation changes
- **Real-time Updates**: Visual feedback for data refreshes with spin animations

#### Trade Execution Feedback System
- **TradeNotification Component**: Real-time visual notifications for trade execution
- **Multi-state Support**: Pending, success, error, and warning states with unique animations
- **Detailed Information**: Shows symbol, quantity, price, and total value with auto-dismiss
- **Smooth Animations**: Spring-based entrance/exit animations with glassmorphism effects

#### UI Polish & Glassmorphism
- **Enhanced CSS Utilities**: Added glass-ultra, glass-card, and glass-hover classes
- **Animated Gradients**: Gradient-shift animations for dynamic backgrounds
- **Glow Effects**: Purple and blue glow utilities for emphasis
- **Smooth Transitions**: Slide-in animations for panels and notifications
- **Pulse Animations**: Live indicator animations for real-time data

### Previous Improvements (Oct 25, 2025)

#### Authentication Fixes
- **Fixed Session Persistence**: Resolved critical bug where session cookies were always secure (HTTPS-only), blocking local development
- **Auto-create Sessions Table**: Enabled automatic creation of sessions table if missing
- **OAuth Support**: Full integration with Google, GitHub, Apple, and Email sign-in via Replit Auth

#### UX Enhancements
- **AI-Native Experience**: Chat sidebar now opens by default, making conversational trading the primary interface
- **Enhanced Chat Interface**: Expanded to 600px width with luxury gradients and improved visibility
- **Consolidated Controls**: Single "Talk to Athena" button replaces confusing dual Voice/Chat buttons
- **Improved Accessibility**: Better text contrast (white primary, white/60 secondary) throughout
- **Luxury Spacing**: All cards use 28px rounded corners with 8px gaps between sections
- **Consistent Glassmorphism**: Gradient backgrounds (from-white/5 to-white/[0.02]) with backdrop-blur-2xl
- **Clear Auth Instructions**: Added warning about Replit preview limitations with right-click solution

#### Testing & Verification
- **Market Data API**: Verified working with Yahoo Finance integration
- **Portfolio Features**: Confirmed $125,850 demo portfolio with realistic holdings
- **Trading System**: Tested order types and trade execution flow
- **UI Modes**: Validated Amanda, Hybrid, and Terminal mode switching
- **Comprehensive Documentation**: Created detailed USER_GUIDE.md for end users

## User Preferences
- I prefer simple language.
- I want iterative development.
- Ask before making major changes.
- I prefer detailed explanations.
- Do not make changes to the folder `Z`.
- Do not make changes to the file `Y`.

## System Architecture
Athena is built on a modern web stack featuring a React, TypeScript, Tailwind CSS, and shadcn/ui frontend. The UI boasts a luxury design system with pure black backgrounds, purple accents (hsl(280 100% 70%)), glassmorphism effects, and `rounded-[28px]` borders. Typography utilizes the Inter font with ultra-light weights for headlines. The backend is a Node.js and Express application, written in TypeScript, managing APIs for authentication, portfolio management, market data, trading, and AI chat.

Core architectural decisions and features include:
- **Adaptive Interface**: Three distinct UI modes (Amanda, Hybrid, Terminal) with seamless switching and persistent user preferences.
- **Voice Integration**: OpenAI Whisper for transcription and OpenAI TTS (nova voice) integrated across all modes with portfolio context.
- **Conversational AI**: AI-powered chat offering investment advice, enriched with portfolio context and custom avatar personalities. Personality descriptions directly shape AI responses and communication style.
- **Adaptive Intelligence System**: Dynamically adjusts AI responses based on real-time analysis of user conversation patterns, offering intelligent mode suggestions.
- **AI Trade Suggestions**: One-click generation of AI trade recommendations with reasoning and confidence levels.
- **Portfolio Management**: Comprehensive holdings management, KPIs, performance charts, sector allocation, and watchlist.
- **Trading System**: Full trade execution with multiple order types (Market, Limit, Stop, Stop-Limit) and time-in-force options.
- **Analytics**: Institutional-grade analytics including correlation analysis, factor exposure, market regime tracking, and stress testing.
- **Authentication**: Secure user authentication using Passport.js with PostgreSQL-persisted sessions.
- **Cache Management**: TanStack Query v5 for server state management with proper cache invalidation for real-time UI updates.
- **Custom Avatar System**: Allows avatar creation with image uploads and personality descriptions that generate AI behavior, trading styles, and catchphrases.
- **Smart Contextual Ticker Detection**: Intelligently distinguishes stock tickers from conversational text, requiring explicit intent for short tickers (e.g., `$F`).
- **Clickable Stock Tickers**: Universal clickable stock tickers throughout the platform, opening comprehensive `StockDetailModal` views with live quotes, interactive charts, and quick buy/sell actions.

## External Dependencies
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.
- **AI**: OpenAI GPT-4 (via Replit AI Integrations) for conversational AI, Whisper (speech-to-text), and TTS (nova voice).
- **Market Data**: Yahoo Finance for live stock data. Alpha Vantage (backend integration ready, awaiting API key) for potential future real-time streaming via WebSockets.
- **Payments**: Stripe for payment processing (credit/debit cards, ACH bank transfers) - integration implemented and ready, awaiting user API keys.
- **Frontend State Management**: TanStack Query v5.