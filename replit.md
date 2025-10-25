# Athena AI Investing

## Overview
Athena AI Investing is a luxury AI-powered investment platform designed to be a personal investment advisor through a professional female trader avatar. The platform aims to make institutional-grade investing tools accessible, combining sophisticated analytics, social trading, gamification, and AI-driven insights for all user levels. It delivers an intuitive, adaptive interface that learns from user behavior, providing features like personalized AI daily briefings, deep portfolio analytics, and an investment simulator.

### Recent UX Improvements (Oct 25, 2025)
- **AI-Native Experience**: Chat sidebar now opens by default, making conversational trading the primary interface
- **Enhanced Chat Interface**: Expanded to 600px width with luxury gradients and improved visibility
- **Consolidated Controls**: Single "Talk to Athena" button replaces confusing dual Voice/Chat buttons
- **Improved Accessibility**: Better text contrast (white primary, white/60 secondary) throughout
- **Luxury Spacing**: All cards use 28px rounded corners with 8px gaps between sections
- **Consistent Glassmorphism**: Gradient backgrounds (from-white/5 to-white/[0.02]) with backdrop-blur-2xl

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