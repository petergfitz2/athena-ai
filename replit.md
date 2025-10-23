# Athena AI Investing

A luxury conversational investment platform powered by AI.

## Overview

Athena provides a conversational interface for investment advice and portfolio management, combining the ease of talking to a friend with the intelligence of a multi-billion dollar hedge fund.

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **AI**: OpenAI GPT-4 (via Replit AI Integrations)
- **Real-time**: WebSocket for live updates
- **Authentication**: Passport.js with sessions

## Features

### Phase 1 (Complete) ✅ - Three Adaptive Interface Modes
- ✅ User authentication (username/password)
- ✅ **Three Interface Modes:**
  - ✅ **Amanda Mode**: Full-screen conversational UI with photorealistic AI avatar (voice-first)
  - ✅ **Hybrid Mode**: Dashboard + floating mini Amanda (desktop trading)
  - ✅ **Terminal Mode**: Multi-panel institutional interface (professional analysis)
- ✅ Mode switching context with persistent user preference
- ✅ Voice integration (OpenAI Whisper + TTS):
  - ✅ Push-to-talk recording (Space key or Cmd/Ctrl+K)
  - ✅ Audio transcription via Whisper API
  - ✅ Voice synthesis from Amanda using TTS (nova voice)
  - ✅ Integrated with portfolio context
  - ✅ Voice authentication (credentials included in API calls)
- ✅ Conversational AI chat interface with portfolio context
- ✅ Portfolio view with holdings management
  - ✅ Add holding modal with validation
  - ✅ Edit/delete holdings functionality
- ✅ AI-powered trade suggestions with approval workflow
- ✅ Watchlist feature with add/remove capability
- ✅ Quick action buttons for common chat queries
- ✅ Real-time WebSocket support
- ✅ Luxury design system (pure black, purple accents, glassmorphism)
- ✅ Desktop-optimized responsive design
- ✅ Navigation improvements (keyboard shortcuts Cmd/Ctrl+1/2/3, mode switching via dropdown)
- ✅ Logout functionality via mode switcher menu
- ✅ E2E testing passed (registration, mode selection, chat, mode persistence, logout)

### Phase 1.5 (Complete) ✅ - Adaptive Intelligence System
- ✅ **Conversation Context Analysis**:
  - ✅ Real-time analysis of user conversation patterns (message length, technical terms, question depth, urgency keywords, response timing)
  - ✅ Weighted scoring system (hurried/analytical/conversational) with exponential decay favoring recent messages
  - ✅ Per-conversation tracking with database persistence
- ✅ **Adaptive AI Prompting**:
  - ✅ AI response depth automatically adjusts based on detected user context
  - ✅ Temperature and token limits adapt to user state
  - ✅ Hurried mode: concise, direct answers
  - ✅ Analytical mode: detailed, data-rich responses
  - ✅ Conversational mode: balanced, friendly tone
- ✅ **Intelligent Mode Suggestions**:
  - ✅ System detects when user would benefit from different interface mode
  - ✅ Non-intrusive bottom-right suggestion cards with explanatory reasoning
  - ✅ One-click mode switching with smooth transitions
  - ✅ Toast notifications for mode change feedback
  - ✅ Per-conversation dismissal state (suggestions don't repeat)
- ✅ **Cross-Mode Integration**:
  - ✅ All three modes (Amanda/Hybrid/Terminal) track conversation context
  - ✅ Mode suggestions appear dynamically based on usage patterns
  - ✅ Consistent UX across all interface modes

### Phase 2 (In Progress) 🔄
- ✅ Dashboard page with portfolio KPIs and holdings table
- ✅ Global navigation (dashboard button in all mode headers)
- ✅ Interactive News/Intelligence system with clickable articles
- ✅ Watchlist page with add/remove stocks and real-time quotes
- ✅ Sophisticated Amanda avatar (black & white portrait style)
- 🔄 Real-time market data integration (Alpha Vantage ready, awaiting API key)
- ⏳ Trade execution workflow (buy/sell orders, approval system)
- ⏳ Account settings page (profile, password, add funds via Stripe)
- ⏳ Advanced analytics (Sharpe ratio, beta, volatility calculations)
- ⏳ Performance charts (portfolio value over time)
- ⏳ Enhanced voice features (OpenAI Realtime API for <800ms latency)

## Database Schema

- `users`: User accounts
- `holdings`: Portfolio holdings (symbol, quantity, average cost)
- `conversations`: Chat conversation sessions
- `messages`: Individual chat messages
- `trades`: Trade history and pending suggestions
- `watchlist`: Watched stocks
- `conversation_analysis`: Aggregated conversation metrics and scores (hurried/analytical/conversational)
- `message_metrics`: Per-message analysis metrics (length, technical terms, question depth, urgency signals, response time)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Portfolio
- `GET /api/holdings` - Get user holdings
- `POST /api/holdings` - Create holding
- `PATCH /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding
- `GET /api/portfolio/summary` - Get portfolio summary with KPIs

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/:id` - Remove from watchlist

### Market Data
- `GET /api/market/indices` - Get major market indices (S&P 500, NASDAQ, Dow)
- `GET /api/market/quote/:symbol` - Get quote for single symbol
- `GET /api/market/quotes` - Get quotes for user's holdings
- `GET /api/market/quotes-batch?symbols=` - Get quotes for multiple symbols
- `GET /api/market/news` - Get market news with AI sentiment analysis

### Trading
- `GET /api/trades` - Get all trades
- `GET /api/trades/pending` - Get pending trade suggestions
- `POST /api/trades` - Create trade
- `PATCH /api/trades/:id/status` - Approve/reject trade

### AI Chat
- `POST /api/chat` - Send message and get AI response
- `POST /api/voice/chat` - Process voice input (transcription + AI response + TTS)
- `GET /api/ai/trade-suggestions` - Generate AI trade suggestions

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get conversation messages
- `GET /api/context/:id` - Get conversation analysis (scores, metrics)
- `GET /api/context/:id/suggestion` - Get mode suggestion based on conversation context

## Recent Changes (October 23, 2025)

### Latest Updates: Enhanced Functionality & UX ✨
1. **Amanda Avatar - Professional Businesswoman**:
   - AI-generated professional corporate portrait
   - Black & white aesthetic matching reference design
   - Professional businesswoman in black blazer over white blouse
   - Portrait-style (3:4 aspect ratio) with luxury borders (rounded-[28px])
   - Grayscale filter, elegant delicate jewelry, center-parted hair
   - Sophisticated, modern corporate headshot style
   - Minimal voice indicators during listening/speaking states

2. **Interactive News/Intelligence System**:
   - Created NewsDetailModal component with full article details
   - Terminal Mode news panel now clickable
   - Shows sentiment analysis (bullish/bearish/neutral)
   - Displays related tickers, timestamps, article images
   - "Read Full Article" external link button
   - Mock data service ready for Alpha Vantage integration

3. **Watchlist Page** (`/watchlist`):
   - Add/remove stocks functionality
   - Real-time quotes with 1-minute refresh
   - Price change indicators (green/red)
   - Quick actions: Buy, View Details
   - Empty state with call-to-action
   - Responsive grid layout

4. **Dashboard Navigation**:
   - Added dashboard icon button to all mode headers (Amanda, Hybrid, Terminal)
   - Consistent LayoutDashboard icon with proper data-testids
   - One-click navigation from any interface mode

5. **API Enhancements**:
   - Added `/api/market/quotes-batch` for multi-symbol quotes
   - Enhanced `/api/market/news` with sentiment analysis
   - Created `newsService.ts` with caching (ready for Alpha Vantage)

## Recent Changes (October 23, 2025) - Phase 1

### Phase 1 Completion: Three Interface Modes ✅
1. **ModeContext & ModeSelector**: Context provider for managing interface mode (Amanda/Hybrid/Terminal) with localStorage persistence
2. **Amanda Mode** (`/amanda`): Full-screen conversational interface
   - Photorealistic AI avatar (top third) with listening/speaking animations
   - Chat messages (middle section)
   - Voice + text input (bottom)
   - Push-to-talk with Space or Cmd/Ctrl+K
3. **Hybrid Mode** (`/hybrid`): Dashboard + floating mini Amanda
   - Main dashboard area with portfolio/watchlist views
   - Floating Amanda avatar (bottom-right corner)
   - Expandable chat panel (slides from right)
   - Best of both worlds for desktop trading
4. **Terminal Mode** (`/terminal`): Multi-panel professional interface
   - 4-panel grid layout (markets, portfolio, analysis, intelligence)
   - Institutional-grade analytics display
   - Voice available via keyboard shortcut
5. **Voice Integration** (all modes):
   - `useVoice` hook for push-to-talk functionality
   - OpenAI Whisper API for transcription
   - OpenAI TTS API for Amanda's voice (nova model)
   - Backend `/api/voice/chat` endpoint with credential authentication
   - Integrated with portfolio context for personalized responses
6. **Updated Navigation**: App.tsx restructured with ModeProvider, route updates to `/amanda`, `/hybrid`, `/terminal`
7. **Auth Flow**: Redirects to `/select-mode` after login/register for mode selection
8. **Bug Fixes**:
   - Fixed voice API authentication (credentials now included)
   - Fixed post-auth redirect (now goes to `/select-mode` instead of `/dashboard`)
   - Added logout button to ModeSwitcherMenu
9. **E2E Testing**: Comprehensive test passed covering registration, mode selection, chat functionality, mode switching (via menu and keyboard shortcuts), mode persistence, and logout

### Phase 1.5 Completion: Adaptive Intelligence System ✅ (October 23, 2025)
1. **Conversation Context Analyzer** (`server/conversationAnalyzer.ts`):
   - Real-time analysis engine for conversation patterns
   - Tracks message length, technical terms, question depth, urgency keywords, response timing
   - Exponential decay weighting (recent messages weighted 4x higher)
   - Calculates hurried/analytical/conversational scores
   - Database persistence via `conversation_analysis` and `message_metrics` tables
   
2. **Adaptive AI Prompting** (`server/openai.ts`):
   - AI responses automatically adjust based on detected context
   - Hurried mode: Concise responses, higher temperature (0.8), reduced tokens (300)
   - Analytical mode: Detailed responses, lower temperature (0.4), expanded tokens (800)
   - Conversational mode: Balanced responses, moderate temperature (0.7), standard tokens (500)
   
3. **Intelligent Mode Suggestions**:
   - Backend API (`/api/context/:id/suggestion`) recommends optimal interface mode
   - Frontend hooks (`useConversationContext`, `useModeSuggestion`) manage state and polling
   - `ModeSuggestion` component: Bottom-right glassmorphism card with explanation
   - Smooth mode transitions with toast notifications
   - Per-conversation dismissal prevents repeated prompts
   
4. **Cross-Mode Integration**:
   - All three modes (Amanda/Hybrid/Terminal) create dedicated conversations on mount
   - ConversationId and lastMessageTime sent with each chat message
   - Mode suggestions appear dynamically across all modes
   - Consistent UX pattern across the platform

## Design System

### Colors
- Background: Pure black (#000000)
- Text: Near-white (#f5f5f7)
- Accent: Purple (#8B5CF6)
- Border radius: 28px for all cards

### Typography (Responsive)
- Font: Inter
- Headlines: `text-5xl md:text-6xl lg:text-7xl font-extralight` (ultra-light 200-300 weight)
- Section headings: `text-4xl font-extralight`
- Body: `font-light` (400-500 weight)

### Layout (Desktop-First with Responsive)
- **Desktop Optimization**:
  - Dashboard/Portfolio: `max-w-[1600px]` container
  - Chat: `max-w-[1400px]` container
  - Padding: `px-6 sm:px-10 lg:px-16 py-8 lg:py-12`
  - Spacing: `gap-8`, `space-y-12 lg:space-y-16`
  - Card padding: `p-8 md:p-12 lg:p-16`
- **Responsive Grids**:
  - Market tiles: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
  - Portfolio holdings: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Trade suggestions: `grid-cols-1 lg:grid-cols-2`

### Components
- Glassmorphism cards (`.glass` class) with backdrop blur
- 28px border radius (`rounded-[28px]`) throughout
- Purple gradient accents
- Generous spacing (especially at desktop breakpoint)
- Luxury minimal aesthetic with ultra-light typography

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption secret
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (via Replit integration)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI base URL (via Replit integration)

## Development

```bash
# Start development server
npm run dev

# Push database schema changes
npm run db:push

# Type check
npm run check
```

## Architecture Notes

- Frontend uses TanStack Query for server state management
- All routes prefixed with `/api` for backend
- Protected routes use `ProtectedRoute` wrapper
- Authentication context provides user state across app
- WebSocket server at `/ws` path for real-time updates
- AI responses include portfolio context for personalized advice

## Brand Positioning

"Investing as easy as talking to a friend. Capabilities as vast as a multi-billion hedge fund."

- Revolutionary first-mover: Everything through conversation
- Full spectrum: Basic questions AND complex analysis
- Casual convenience: Get updates while driving, deep analysis from desk
- Intelligence vs access: AI that understands markets, not just data access
