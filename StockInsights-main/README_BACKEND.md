# StockInsights Backend & Auth Setup

Environment variables to set in your Vercel Project:
- CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- DATABASE_URL (PostgreSQL connection string)
- Optional: ALPHA_VANTAGE_API_KEY or FINNHUB_API_KEY

Prisma
- After setting DATABASE_URL, run: npx prisma generate
- Create your database schema: npx prisma db push (or use migrations)

Clerk
- In the Clerk dashboard, add your application and copy keys to env vars.
- Configure authorized redirect URLs (e.g., /sign-in, /sign-up, /dashboard).

Protected Routes
- middleware.ts protects /dashboard, /portfolio, /analysis, /predictions, and API routes (except stocks/predictions GET).
- All portfolio APIs verify the current session server-side.

APIs
- /api/auth (POST): Ensures a DB user exists for the current Clerk session.
- /api/portfolio (GET, POST)
- /api/portfolio/[id] (GET, PUT, DELETE)
- /api/portfolio/performance (GET)
- /api/stocks (GET ?symbol=)
- /api/predictions (GET ?symbol=, POST)

TradingView & Predictions
- components/ui/stock-chart.tsx embeds a live TradingView advanced chart.
- components/ui/prediction-chart.tsx draws an actual vs predicted overlay using lightweight-charts.

Notes
- This project uses Next.js App Router with typed API route handlers.
- Add <AuthSync /> in protected pages to eagerly sync the user to Prisma after login if desired.
