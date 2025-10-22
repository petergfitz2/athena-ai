# Athena AI Investing - Design Guidelines

## Design Approach
**Selected Approach:** Custom luxury fintech aesthetic inspired by premium trading platforms with specific brand requirements.

**Core Principle:** Ultra-minimal luxury with maximum contrast - every pixel serves a purpose, every interaction feels premium.

---

## Color Palette

### Dark Mode (Primary)
- **Background:** `0 0% 0%` (Pure black #000000)
- **Text Primary:** `0 0% 96%` (#f5f5f7 near-white)
- **Text Secondary:** `0 0% 70%` (muted for supporting content)
- **Accent Primary:** `258 90% 66%` (#8B5CF6 purple)
- **Accent Hover:** `258 90% 56%` (darker purple for interactions)
- **Glass Effect:** `0 0% 100% / 0.05` (subtle white overlay for glassmorphism)
- **Border:** `0 0% 100% / 0.1` (subtle borders)

---

## Typography

### Font Family
- **Primary:** Inter (Google Fonts)
- **Fallback:** system-ui, -apple-system, sans-serif

### Font Weights & Usage
- **Headlines (H1-H2):** 200-300 weight (ultra-light, luxury feel)
- **Subheadings (H3-H4):** 400 weight (regular)
- **Body Text:** 400 weight
- **Buttons/CTAs:** 500-600 weight (medium to semi-bold)

### Type Scale
- **Hero Headlines:** text-6xl to text-7xl (ultra-light)
- **Section Headers:** text-4xl to text-5xl (light)
- **Card Titles:** text-xl to text-2xl (regular)
- **Body:** text-base
- **Small/Meta:** text-sm

---

## Layout System

### Spacing Primitives
Use Tailwind units: **4, 6, 8, 12, 16, 24, 32** for consistency
- **Component padding:** p-6 to p-8
- **Section spacing:** py-16 to py-24
- **Card gaps:** gap-6 to gap-8
- **Generous whitespace:** Never crowd elements

### Container Widths
- **Full dashboard:** max-w-7xl mx-auto
- **Chat interface:** max-w-4xl
- **Forms:** max-w-md

---

## Component Library

### Glassmorphism Cards
- **Border radius:** rounded-[28px] (exactly 28px)
- **Background:** bg-white/5 with backdrop-blur-xl
- **Border:** border border-white/10
- **Padding:** p-8 to p-12
- **Shadow:** Subtle glow with purple accent

### Buttons
- **Primary:** Purple (#8B5CF6) background, white text, 28px border radius
- **Secondary:** Glass effect with white/10 background, purple text
- **On images:** Blur background, outline variant with backdrop-blur-md

### Chat Interface
- **User messages:** Align right, purple background with glass effect
- **AI responses:** Align left, white/5 background with glass effect
- **Input field:** Full-width, glass effect, 28px border radius, purple focus ring
- **Typing indicator:** Animated purple dots

### Portfolio Cards
- **Holdings grid:** 2-3 columns on desktop, stacked on mobile
- **Performance metrics:** Large numbers, ultra-light weight
- **Trend indicators:** Purple for positive, red/pink for negative
- **Graph overlays:** Subtle gradients, purple accent lines

### Navigation
- **Top bar:** Sticky, glass effect, blur background
- **Logo:** Ultra-light typography
- **Menu items:** Minimal, adequate spacing
- **Active state:** Purple underline or background glow

### Forms (Authentication)
- **Input fields:** Glass effect, 28px border radius, purple focus state
- **Labels:** Small, near-white, positioned above inputs
- **Error states:** Subtle red/pink glow
- **Success states:** Purple glow

### Dashboard Layout
- **Sidebar:** Fixed left, glass effect, navigation items with hover states
- **Main content:** Grid layout for cards and widgets
- **Market data tiles:** Compact, real-time updates, minimal design
- **Trade suggestions:** Card-based, approval buttons prominent

---

## Animations

Use **sparingly** for luxury feel:
- **Page transitions:** Subtle fade-in (200-300ms)
- **Card hover:** Gentle scale (1.02) and glow enhancement
- **Button hover:** Brightness increase only
- **Chat messages:** Slide-in animation for new messages
- **Loading states:** Elegant purple pulse

---

## Images

### Hero Section
**Large hero image:** NO - Replace with ultra-minimal typographic hero
- Ultra-light headline (200 weight)
- Purple accent line or gradient element
- Glass effect card with key value proposition
- Generous vertical spacing (py-32)

### Dashboard/Portfolio
**Charts and graphs:** YES - Use for data visualization
- Purple gradient fills
- Clean, minimal axes
- Glass effect overlays

### Authentication Pages
**Background:** Subtle abstract gradient or pattern
- Very low opacity (5-10%)
- Purple undertones
- Pure black base

---

## Interaction Patterns

### Trade Approval Workflow
1. AI suggestion appears as glass card
2. Details expand on click
3. "Approve" button (purple, prominent)
4. "Decline" button (glass, subtle)
5. Confirmation modal with final review

### Real-time Updates
- Subtle pulse animation on data change
- Purple glow for new information
- No jarring transitions

### Responsive Behavior
- Mobile: Stack all multi-column layouts
- Tablet: 2-column grids maximum
- Desktop: Full 3-column layouts where appropriate
- Chat always full-width, centered max-w-4xl

---

## Accessibility

- Maintain 7:1 contrast ratio (pure black + near-white achieves this)
- Ensure purple accents have sufficient contrast for interactive elements
- All glass effects maintain text readability
- Focus states clearly visible with purple ring
- Keyboard navigation fully supported