import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { stockDataService } from "@/lib/services/stock-data-service"
import { backtestingService } from "@/lib/services/backtesting-service"
import { checkRateLimit, subscriptionService } from "@/lib/services/subscription-service"

/**
 * POST /api/backtesting
 * 
 * Run a backtest on a strategy
 * 
 * Body:
 * - symbol: Stock symbol (required)
 * - strategy: Strategy name (required)
 * - period: Backtest period in days (default: 365)
 * - initialCapital: Starting capital (default: 100000)
 * - config: Strategy-specific configuration
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const userPlan = (user.plan || 'FREE') as 'FREE' | 'PRO' | 'ELITE'
    
    // Check rate limit
    const rateLimit = checkRateLimit(user.id, userPlan)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    
    // Check feature access - backtesting requires PRO or ELITE
    const planFeatures = subscriptionService.getPlanFeatures(userPlan).features
    if (!planFeatures.backtesting) {
      return NextResponse.json(
        { 
          error: 'Backtesting feature requires PRO or ELITE plan',
          upgrade: true
        },
        { status: 403 }
      )
    }

    const body = await req.json()
    
    if (!body.symbol || !body.strategy) {
      return NextResponse.json({ 
        error: "Missing required fields: symbol, strategy" 
      }, { status: 400 })
    }
    
    const symbol = body.symbol.toUpperCase()
    const strategy = body.strategy
    const period = body.period || 365
    const initialCapital = body.initialCapital || 100000
    const commission = body.commission || 0.001 // 0.1% per trade
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)
    
    // Run backtest
    const result = await backtestingService.runBacktest(
      symbol,
      strategy,
      startDate,
      endDate,
      initialCapital,
      commission
    )
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (e: any) {
    console.error('Backtesting error:', e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}

/**
 * GET /api/backtesting - Get saved backtest results
 * 
 * Query params:
 * - symbol: Filter by symbol (optional)
 * - limit: Number of results (default: 10)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()
  const limit = parseInt(searchParams.get("limit") || "10")

  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const where: any = { userId: user.id }
    if (symbol) where.symbol = symbol
    
    const results = await prisma.backtestResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    // Get available strategies
    const strategies = backtestingService.getAvailableStrategies()
    
    return NextResponse.json({
      success: true,
      data: {
        results,
        strategies
      }
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}
