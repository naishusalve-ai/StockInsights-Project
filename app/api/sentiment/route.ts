import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { sentimentService } from "@/lib/services/sentiment-service"
import { checkRateLimit, subscriptionService } from "@/lib/services/subscription-service"

/**
 * GET /api/sentiment?symbol=AAPL
 * 
 * Returns market sentiment analysis for a stock
 * 
 * Query params:
 * - symbol: Stock symbol (required)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase()

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
    
    // Check feature access - sentiment requires PRO or ELITE
    const planFeatures = subscriptionService.getPlanFeatures(userPlan).features
    if (!planFeatures.sentimentAnalysis) {
      return NextResponse.json(
        { 
          error: 'Sentiment analysis requires PRO or ELITE plan',
          upgrade: true
        },
        { status: 403 }
      )
    }

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }
    
    // Get sentiment data
    const sentiment = await sentimentService.getStockSentiment(symbol)
    
    return NextResponse.json({
      success: true,
      data: sentiment
    })
    
  } catch (e: any) {
    console.error('Sentiment error:', e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}
