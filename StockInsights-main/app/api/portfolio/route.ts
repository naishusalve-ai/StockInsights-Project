import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { createPortfolioSchema } from "@/lib/validators"
import { portfolioService } from "@/lib/services/portfolio-service"
import { checkRateLimit } from "@/lib/services/subscription-service"

/**
 * GET /api/portfolio - Get portfolio summary with real-time P&L
 * POST /api/portfolio - Add a new transaction (BUY/SELL)
 * DELETE /api/portfolio?id=xxx - Delete a transaction
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "summary"

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

    switch (action) {
      case 'summary': {
        const summary = await portfolioService.getPortfolioSummary(user.id)
        return NextResponse.json({
          success: true,
          data: summary
        })
      }
      
      case 'holdings': {
        const holdings = await portfolioService.getHoldings(user.id)
        return NextResponse.json({
          success: true,
          data: holdings
        })
      }
      
      case 'transactions': {
        const limit = parseInt(searchParams.get("limit") || "50")
        const transactions = await portfolioService.getTransactions(user.id, { limit })
        return NextResponse.json({
          success: true,
          data: transactions
        })
      }
      
      case 'performance': {
        const performance = await portfolioService.getPerformanceHistory(user.id)
        return NextResponse.json({
          success: true,
          data: performance
        })
      }
      
      case 'allocation': {
        const allocation = await portfolioService.getAllocation(user.id)
        return NextResponse.json({
          success: true,
          data: allocation
        })
      }
      
      case 'metrics': {
        const [xirr, cagr] = await Promise.all([
          portfolioService.calculateXIRR(user.id),
          portfolioService.calculateCAGR(user.id)
        ])
        return NextResponse.json({
          success: true,
          data: { xirr, cagr }
        })
      }
      
      // Legacy support for old format
      default: {
        const items = await prisma.portfolio.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
        return NextResponse.json({ items })
      }
    }
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    
    // Check if this is a new transaction format
    if (body.type && (body.type === 'BUY' || body.type === 'SELL')) {
      const transaction = await portfolioService.addTransaction(user.id, {
        symbol: body.symbol.toUpperCase(),
        type: body.type,
        quantity: body.quantity,
        price: body.price,
        date: body.date ? new Date(body.date) : new Date(),
        fees: body.fees || 0,
        notes: body.notes
      })
      
      return NextResponse.json({
        success: true,
        data: { transaction }
      }, { status: 201 })
    }
    
    // Legacy format - direct portfolio creation
    const parsed = createPortfolioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    // Convert to transaction
    const transaction = await portfolioService.addTransaction(user.id, {
      symbol: parsed.data.symbol.toUpperCase(),
      type: 'BUY',
      quantity: parsed.data.quantity,
      price: parsed.data.avgPrice,
      date: new Date()
    })
    
    return NextResponse.json({
      success: true,
      data: { transaction }
    }, { status: 201 })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const transactionId = searchParams.get("id")
  
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
    }

    // Verify ownership and delete
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId: user.id }
    })
    
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }
    
    await prisma.transaction.delete({
      where: { id: transactionId }
    })
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}
