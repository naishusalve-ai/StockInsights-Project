# StockInsight - Production-Ready Stock Market Analytics Platform

A modern, full-featured stock market analytics and portfolio management SaaS platform built with Next.js 14, featuring real stock data, 50+ technical indicators, AI predictions, backtesting, and monetization.

![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## 🌟 Features

### 📈 Real Stock Market Data
- **Yahoo Finance Integration** - Primary data source for global markets
- **Alpha Vantage Fallback** - Secondary data provider
- **Finnhub Support** - Additional market data
- **Indian Market Support** - NSE (.NS) and BSE (.BO) suffix support
- **Multi-level Caching** - In-memory + database caching with TTL
- **Rate Limiting** - Per-provider rate limit management

### 💼 Portfolio Management
- **Transaction Tracking** - BUY/SELL with average price calculation
- **Real-time P&L** - Unrealized and realized profit/loss
- **Day P&L Tracking** - Daily performance metrics
- **XIRR Calculation** - Extended Internal Rate of Return
- **CAGR Calculation** - Compound Annual Growth Rate
- **Allocation Analysis** - Portfolio diversification view

### 📊 Technical Analysis (50+ Indicators)

#### Trend Indicators
- SMA, EMA, WMA, DEMA, TEMA, VWMA
- MACD with Signal Line
- ADX (Average Directional Index)
- Aroon Oscillator
- Parabolic SAR
- Ichimoku Cloud

#### Momentum Indicators
- RSI (Relative Strength Index)
- Stochastic Oscillator
- Momentum & Rate of Change
- Williams %R
- CCI (Commodity Channel Index)
- Ultimate Oscillator
- TRIX

#### Volatility Indicators
- Bollinger Bands
- ATR (Average True Range)
- Keltner Channels
- Donchian Channels
- Standard Deviation

#### Volume Indicators
- OBV (On-Balance Volume)
- VWAP (Volume Weighted Average Price)
- MFI (Money Flow Index)
- CMF (Chaikin Money Flow)
- A/D Line (Accumulation/Distribution)
- Force Index
- Ease of Movement

### 🤖 AI Price Predictions
- **Linear Regression** - Trend-based forecasting
- **Holt-Winters** - Exponential smoothing
- **Moving Average Forecast** - Short-term predictions
- **Ensemble Predictions** - Combined model accuracy
- **Confidence Bands** - Upper/lower prediction ranges
- **Backtest Validation** - Historical accuracy metrics
- **SEBI-Compliant Disclaimers** - Legal compliance

### 🔬 Strategy Backtesting
- **RSI Oversold Strategy** - Buy when RSI < 30
- **MACD Crossover** - Signal line crossovers
- **SMA/EMA Crossover** - Moving average strategies
- **Bollinger Bounce** - Mean reversion strategy
- **Momentum Strategy** - Trend following
- **Performance Metrics** - Sharpe, Sortino, Max Drawdown
- **Equity Curves** - Visual performance tracking
- **Benchmark Comparison** - Alpha calculation

### 📰 Market Sentiment Analysis
- **News Sentiment** - Finnhub/Alpha Vantage news
- **Keyword Analysis** - Bullish/bearish word detection
- **Analyst Ratings** - Buy/Sell/Hold aggregation
- **Social Sentiment** - Twitter/Reddit/StockTwits
- **Historical Tracking** - Sentiment trends over time

### 🔔 Alerts & Notifications
- **Price Alerts** - Above/below target price
- **Indicator Alerts** - RSI, MACD conditions
- **Percentage Change** - Daily movement alerts
- **Email Notifications** - Automated alerts
- **Alert Throttling** - Prevent spam

### 💳 Monetization (SaaS)
- **Stripe Integration** - International payments
- **Razorpay Integration** - Indian payments
- **Subscription Plans** - FREE, PRO, ELITE
- **Feature Gating** - Plan-based access control
- **Usage Tracking** - API rate limits per plan
- **Billing Portal** - Self-service management

## � Subscription Plans

| Feature | FREE | PRO (₹999/mo) | ELITE (₹2999/mo) |
|---------|------|---------------|------------------|
| Watchlist Items | 10 | 50 | 500 |
| Price Alerts | 5 | 50 | 500 |
| Technical Indicators | Basic | Advanced | Full (50+) |
| AI Predictions | ❌ | ✅ | ✅ |
| Backtesting | ❌ | ✅ | ✅ |
| Sentiment Analysis | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| API Rate Limit | 10/min | 60/min | 300/min |
| Data Export | ❌ | ✅ | ✅ |
| Real-time Data | ❌ | ✅ | ✅ |
| Historical Data | 1 year | 5 years | 20 years |
| Priority Support | ❌ | ❌ | ✅ |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database
- Clerk account for authentication
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-market-analytics.git
   cd stock-market-analytics
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
   CLERK_SECRET_KEY=your_secret_here
   
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/stock_analytics
   
   # Stock Data APIs (at least one required)
   YAHOO_FINANCE_API_KEY=optional
   ALPHA_VANTAGE_API_KEY=your_key_here
   FINNHUB_API_KEY=your_key_here
   
   # Payment Providers
   STRIPE_SECRET_KEY=sk_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
   STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
   STRIPE_ELITE_MONTHLY_PRICE_ID=price_xxx
   STRIPE_ELITE_YEARLY_PRICE_ID=price_xxx
   
   # Razorpay (for India)
   RAZORPAY_KEY_ID=rzp_xxx
   RAZORPAY_KEY_SECRET=xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   
   # Cron Job Security
   CRON_SECRET=your_cron_secret
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Setup Prisma and Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
stock-market-analytics/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── alerts/               # Alert management
│   │   ├── backtesting/          # Strategy backtesting
│   │   ├── cron/                 # Cron job endpoints
│   │   ├── portfolio/            # Portfolio management
│   │   ├── predictions/          # AI predictions
│   │   ├── sentiment/            # Sentiment analysis
│   │   ├── stocks/               # Stock data & analysis
│   │   ├── subscription/         # Subscription management
│   │   └── webhooks/             # Payment webhooks
│   ├── dashboard/                # Dashboard page
│   ├── portfolio/                # Portfolio pages
│   ├── stocks/                   # Stock detail pages
│   ├── analysis/                 # Analysis pages
│   │   ├── technical/            # Technical analysis page
│   │   └── fundamental/          # Fundamental analysis page
│   ├── predictions/              # Predictions pages
│   ├── sentiment/                # Market sentiment analysis
│   ├── backtesting/              # Strategy backtesting
│   ├── features/                 # Features showcase page
│   ├── profile/                  # User profile & settings
│   ├── terms/                    # Terms of Service
│   ├── privacy/                  # Privacy Policy
│   ├── (auth)/                   # Auth pages (sign-in, sign-up)
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── financial-disclaimer.tsx  # Legal compliance component
│   ├── header.tsx                # Navigation header
│   ├── portfolio-form.tsx        # Portfolio management
│   ├── stock-chart.tsx           # Stock charting
│   ├── prediction-chart.tsx      # Prediction visualization
│   ├── technical-analysis.tsx    # Technical indicators
│   ├── fundamental-analysis.tsx  # Fundamental metrics
│   ├── market-overview.tsx       # Market overview widget
│   ├── market-news.tsx           # News feed
│   └── ...                       # Other components
├── lib/                          # Utility functions & services
│   ├── services/                 # Core business logic
│   │   ├── stock-data-service.ts     # Real stock data fetching
│   │   ├── technical-analysis-service.ts # 50+ indicators
│   │   ├── portfolio-service.ts      # P&L calculations
│   │   ├── prediction-service.ts     # AI predictions
│   │   ├── backtesting-service.ts    # Strategy backtesting
│   │   ├── sentiment-service.ts      # Sentiment analysis
│   │   ├── alert-service.ts          # Alert management
│   │   └── subscription-service.ts   # Payment & plans
│   ├── db.ts                     # Database client
│   ├── user.ts                   # User utilities
│   ├── validators.ts             # Form validators
│   └── utils.ts                  # Helper functions
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── public/                       # Static assets
├── styles/                       # Global styles
├── middleware.ts                 # Security & rate limiting
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies
```

## 🔑 Key Technologies

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Component library

### Backend & Database
- **Clerk** - Authentication and user management
- **Prisma** - ORM for database operations
- **PostgreSQL** - Primary database

### Stock Data Providers
- **Yahoo Finance** - Primary market data
- **Alpha Vantage** - Fallback provider
- **Finnhub** - News & additional data

### Payment Providers
- **Stripe** - International payments
- **Razorpay** - Indian payments

### Charts & Visualization
- **TradingView Charts** - Advanced stock charting
- **Lightweight-charts** - Prediction visualization
- **Recharts** - Data visualization

### Deployment
- **Vercel** - Hosting and CI/CD

## 📚 API Documentation

### Stock Data APIs
```
GET /api/stocks?symbol=AAPL                    # Get stock quote
GET /api/stocks?symbols=AAPL,GOOGL,MSFT        # Batch quotes
GET /api/stocks?action=historical&symbol=AAPL  # Historical data
GET /api/stocks?action=search&query=apple      # Search stocks
```

### Technical Analysis
```
GET /api/stocks/AAPL/analysis                  # Full analysis
GET /api/stocks/AAPL/analysis?indicators=rsi,macd,bollinger
```

### Portfolio APIs
```
GET /api/portfolio                             # Portfolio summary
GET /api/portfolio?action=holdings             # All holdings
GET /api/portfolio?action=transactions         # Transaction history
GET /api/portfolio?action=performance          # Performance metrics
GET /api/portfolio?action=allocation           # Allocation breakdown
GET /api/portfolio?action=metrics              # XIRR/CAGR
POST /api/portfolio                            # Add transaction
DELETE /api/portfolio?id=xxx                   # Remove transaction
```

### Predictions APIs
```
GET /api/predictions?symbol=AAPL               # Get predictions
GET /api/predictions?symbol=AAPL&days=60       # Custom horizon
```

### Backtesting APIs
```
GET /api/backtesting                           # Get saved results
POST /api/backtesting                          # Run backtest
Body: {
  symbol: "AAPL",
  strategy: "RSI_OVERSOLD",
  period: 365,
  initialCapital: 100000
}
```

### Sentiment APIs
```
GET /api/sentiment?symbol=AAPL                 # Get sentiment
```

### Alerts APIs
```
GET /api/alerts                                # Get all alerts
POST /api/alerts                               # Create alert
DELETE /api/alerts?id=xxx                      # Delete alert
PATCH /api/alerts?id=xxx&action=deactivate     # Deactivate
```

### Subscription APIs
```
GET /api/subscription                          # Get status
GET /api/subscription?action=plans             # Get all plans
GET /api/subscription?action=usage             # Get usage stats
POST /api/subscription                         # Create checkout
DELETE /api/subscription                       # Cancel subscription
```

## 🔐 Authentication & Security

### Protected Routes
- `/dashboard`, `/portfolio`, `/analysis`
- `/predictions`, `/sentiment`, `/backtesting`
- `/profile`, `/alerts`

### Public Routes
- `/`, `/features`, `/terms`, `/privacy`
- `/stocks` (basic quotes only)

### Security Features
- Clerk authentication
- API rate limiting (per-user, per-IP)
- Security headers (CSP, XSS, CORS)
- Webhook signature verification
- Input validation with Zod

## 🛠️ Development

### Build
```bash
pnpm run build
```

### Lint
```bash
pnpm run lint
```

### Database Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio
npx prisma studio
```

### Cron Jobs Setup

For alert checking, set up a cron job to hit:
```
GET /api/cron/check-alerts
Authorization: Bearer YOUR_CRON_SECRET
```

**Vercel Cron (vercel.json):**
```json
{
  "crons": [{
    "path": "/api/cron/check-alerts",
    "schedule": "* * * * *"
  }]
}
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Required Environment Variables for Production:
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `DATABASE_URL`
- `ALPHA_VANTAGE_API_KEY` or `FINNHUB_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL`

## ⚠️ Legal & Compliance

### Disclaimers
This platform includes legally compliant disclaimers for:
- Investment risk warnings
- SEBI (India) regulatory notices
- Prediction accuracy limitations
- Backtesting caveats

### Not Investment Advice
StockInsight is an analytics tool for informational purposes only. It does not:
- Provide investment recommendations
- Offer financial advice
- Guarantee prediction accuracy
- Act as a registered investment advisor

Users should consult qualified financial advisors before making investment decisions.

## 📊 Database Schema

The project uses Prisma ORM with the following main entities:

### Core Models
- **User** - User data with subscription plan
- **Portfolio** - Legacy portfolio items
- **PortfolioHolding** - Current holdings with avg price
- **Transaction** - Buy/sell transaction history
- **Watchlist** - User watchlist items

### Analytics Models
- **Prediction** - AI price predictions with confidence
- **BacktestResult** - Strategy backtest results
- **SentimentData** - Market sentiment scores
- **NewsArticle** - Cached news articles

### Monetization Models
- **Subscription** - Active subscriptions
- **Payment** - Payment history

### Alert Models
- **PriceAlert** - Price and indicator alerts
- **StockDataCache** - Cached market data

See [prisma/schema.prisma](prisma/schema.prisma) for the complete schema.

## 🐛 Troubleshooting

### Build Issues
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Regenerate Prisma: `npx prisma generate`

### Database Connection
- Verify DATABASE_URL is correct
- Ensure database is accessible
- Check Prisma migrations: `npx prisma migrate status`

### Rate Limiting
- Check API provider rate limits
- Upgrade plan for higher limits
- Use caching to reduce API calls

### Authentication Issues
- Verify Clerk keys in environment variables
- Check authorized redirect URLs in Clerk dashboard
- Clear browser cookies and try again

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📧 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern fintech practices.**


