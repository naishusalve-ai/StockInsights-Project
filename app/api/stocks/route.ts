import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stockDataService } from "@/lib/services/stock-data-service"
import { checkRateLimit, subscriptionService } from "@/lib/services/subscription-service"
import { prisma } from "@/lib/db"

/**
 * GET /api/stocks
 * 
 * Query params:
 * - symbol: Single stock symbol (e.g., AAPL, RELIANCE.NS)
 * - symbols: Comma-separated symbols for batch quotes
 * - action: 'quote' | 'historical' | 'search' (default: quote)
 * - interval: For historical - '1m' | '5m' | '15m' | '1h' | '1d' (default: 1d)
 * - range: For historical - '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' (default: 1mo)
 * - query: For search action
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()
  const symbols = searchParams.get("symbols")
  const action = searchParams.get("action") || "quote"
  const interval = searchParams.get("interval") || "1d"
  const range = searchParams.get("range") || "1mo"
  const query = searchParams.get("query")

  try {
    // Check authentication (optional for basic quotes)
    const { userId } = await auth()
    
    // Get user's plan for rate limiting
    let userPlan: 'FREE' | 'PRO' | 'ELITE' = 'FREE'
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, plan: true }
      })
      userPlan = (user?.plan || 'FREE') as 'FREE' | 'PRO' | 'ELITE'
      
      // Check rate limit
      const rateLimit = checkRateLimit(user?.id || userId, userPlan)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please upgrade your plan or wait.' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': '60'
            }
          }
        )
      }
    }

    // Handle different actions
    switch (action) {
      case 'quote': {
        if (symbols) {
          // Batch quotes
          const symbolList = symbols.split(',').map(s => s.trim().toUpperCase())
          const quotes = await stockDataService.getBatchQuotes(symbolList)
          return NextResponse.json({
            success: true,
            data: Object.fromEntries(quotes),
            count: quotes.size
          })
        }
        
        if (!symbol) {
          return NextResponse.json(
            { error: 'Symbol is required' },
            { status: 400 }
          )
        }
        
        const quote = await stockDataService.getQuote(symbol)
        return NextResponse.json({
          success: true,
          data: quote
        })
      }
      
      case 'historical': {
        if (!symbol) {
          return NextResponse.json(
            { error: 'Symbol is required for historical data' },
            { status: 400 }
          )
        }
        
        // Check plan for historical data access
        const features = subscriptionService.getPlanFeatures(userPlan).features
        
        // Limit range for free users
        let allowedRange = range
        if (userPlan === 'FREE') {
          const freeRanges = ['1d', '5d', '1mo', '3mo']
          if (!freeRanges.includes(range)) {
            allowedRange = '3mo'
          }
        }
        
        const historical = await stockDataService.getHistorical(
          symbol,
          interval as any,
          allowedRange as any
        )
        
        return NextResponse.json({
          success: true,
          data: historical,
          count: historical.length,
          interval,
          range: allowedRange
        })
      }
      
      case 'search': {
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required for search' },
            { status: 400 }
          )
        }
        
        const results = await stockDataService.search(query)
        return NextResponse.json({
          success: true,
          data: results,
          count: results.length
        })
      }
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: quote, historical, or search' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Stock API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}
