import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { predictionService } from "@/lib/services/prediction-service"
import { checkRateLimit, subscriptionService } from "@/lib/services/subscription-service"

/**
 * GET /api/predictions?symbol=AAPL
 * 
 * Returns AI-powered price predictions with confidence bands
 * 
 * Query params:
 * - symbol: Stock symbol (required)
 * - days: Number of days to predict (default: 30, max: 90)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.toUpperCase() || "AAPL"
  const days = Math.min(parseInt(searchParams.get("days") || "30"), 90)

  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required for predictions' },
        { status: 401 }
      )
    }
    
    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, plan: true }
    })
    
    const userPlan = (user?.plan || 'FREE') as 'FREE' | 'PRO' | 'ELITE'
    
    // Check rate limit
    const rateLimit = checkRateLimit(user?.id || '', userPlan)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    
    // Check feature access - predictions require PRO or ELITE
    const planFeatures = subscriptionService.getPlanFeatures(userPlan).features
    if (!planFeatures.predictions) {
      return NextResponse.json(
        { 
          error: 'Predictions feature requires PRO or ELITE plan',
          upgrade: true
        },
        { status: 403 }
      )
    }
    
    // Check for cached prediction first
    const cached = await prisma.prediction.findFirst({
      where: { 
        symbol,
        createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // 6 hours
      },
      orderBy: { createdAt: "desc" },
    })
    
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: {
          symbol,
          currentPrice: cached.currentPrice,
          predictedPrice: cached.predictedPrice,
          confidence: cached.confidence,
          upperBand: cached.upperBand,
          lowerBand: cached.lowerBand,
          createdAt: cached.createdAt
        },
        disclaimer: cached.disclaimer || predictionService.getDisclaimer()
      })
    }
    
    // Generate fresh prediction using the service
    const prediction = await predictionService.generatePrediction(symbol, days)
    
    // Format response
    return NextResponse.json({
      success: true,
      data: prediction,
      disclaimer: prediction.disclaimer
    })
    
  } catch (error: any) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate predictions' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  // Admin endpoint to manually create predictions
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await req.json()
    if (!body?.symbol || typeof body.predictedPrice !== "number") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    const created = await prisma.prediction.create({
      data: {
        symbol: body.symbol.toUpperCase(),
        currentPrice: body.currentPrice || body.predictedPrice,
        predictedPrice: body.predictedPrice,
        confidence: body.confidence || 75,
        upperBand: body.upperBand,
        lowerBand: body.lowerBand,
        disclaimer: predictionService.getDisclaimer()
      },
    })

    return NextResponse.json({ prediction: created }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
