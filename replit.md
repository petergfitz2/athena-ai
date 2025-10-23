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

### Phase 1 (Current) - Luxury Hybrid MVP ✅ COMPLETE
- ✅ User authentication (username/password)
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

### Phase 2 (Planned)
- Voice input/output (OpenAI Realtime API)
- Real-time market data integration
- SEC filing analysis (13F, Form 4)
- Advanced analytics (Sharpe ratio, correlation, risk metrics)
- Trade execution via brokerage API

## Database Schema

- `users`: User accounts
- `holdings`: Portfolio holdings (symbol, quantity, average cost)
- `conversations`: Chat conversation sessions
- `messages`: Individual chat messages
- `trades`: Trade history and pending suggestions
- `watchlist`: Watched stocks

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

### Trading
- `GET /api/trades` - Get all trades
- `GET /api/trades/pending` - Get pending trade suggestions
- `POST /api/trades` - Create trade
- `PATCH /api/trades/:id/status` - Approve/reject trade

### AI Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/ai/trade-suggestions` - Generate AI trade suggestions

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id/messages` - Get conversation messages

## Recent Changes (October 23, 2025)

### Phase 1 MVP Features Completed
1. **AddHoldingModal Component**: Users can add stocks to portfolio with symbol, quantity, and average cost
2. **WatchlistCard Component**: Dashboard watchlist with real-time price updates and add/remove functionality
3. **QuickActionButtons Component**: Chat quick actions for common queries (portfolio, market, returns, trades)
4. **Bug Fix**: Fixed ChatPage new conversation flow that was disabling input after clicking "+ New Chat"

All features tested end-to-end with Playwright and confirmed working in production.

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
