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

- **Adaptive Interface Modes**: Three distinct UI modes (Amanda, Hybrid, Terminal) with seamless switching and persistent user preferences.
- **Voice Integration**: Utilizes OpenAI Whisper for transcription and OpenAI TTS (nova voice) for Amanda's responses, integrated across all modes with portfolio context.
- **Conversational AI**: An AI-powered chat interface that provides investment advice and trade suggestions, enriched with portfolio context.
- **Adaptive Intelligence System**: Real-time analysis of user conversation patterns (message length, technical terms, question depth, urgency, response timing) to dynamically adjust AI response depth, temperature, and token limits. It also provides intelligent, non-intrusive mode suggestions based on user interaction patterns.
- **Portfolio Management**: Features for managing holdings, viewing portfolio summaries, and a watchlist with real-time quotes.
- **Real-time Updates**: WebSocket integration for live market data and other dynamic content.
- **Authentication**: Secure user authentication using Passport.js with sessions.
- **UI/UX Decisions**: Focus on a luxury minimal aesthetic, generous spacing, desktop-first design with responsive grids, and reusable glassmorphism components.

## External Dependencies

- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM.
- **AI**: OpenAI GPT-4 (via Replit AI Integrations) for conversational AI, Whisper API for speech-to-text, and TTS API for text-to-speech.
- **Market Data**: Alpha Vantage (integration pending API key) for real-time market data, indices, quotes, and news.
- **Payments**: Stripe (integration planned) for account funding.
- **Frontend State Management**: TanStack Query for server state.