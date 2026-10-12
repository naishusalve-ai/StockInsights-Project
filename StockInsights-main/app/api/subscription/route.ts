import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { subscriptionService, PLANS } from "@/lib/services/subscription-service"

/**
 * GET /api/subscription - Get user's subscription status
 * POST /api/subscription - Create checkout session
 * DELETE /api/subscription - Cancel subscription
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get("action") || "status"

  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    switch (action) {
      case 'status': {
        const subscription = await subscriptionService.getUserSubscription(user.id)
        return NextResponse.json({
          success: true,
          data: subscription
        })
      }
      
      case 'plans': {
        return NextResponse.json({
          success: true,
          data: PLANS
        })
      }
      
      case 'usage': {
        const usage = await subscriptionService.getUsageStats(user.id)
        return NextResponse.json({
          success: true,
          data: usage
        })
      }
      
      case 'payments': {
        const payments = await subscriptionService.getPaymentHistory(user.id)
        return NextResponse.json({
          success: true,
          data: payments
        })
      }
      
      case 'billing-portal': {
        const returnUrl = searchParams.get("returnUrl") || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        const portal = await subscriptionService.getBillingPortalUrl(user.id, returnUrl)
        return NextResponse.json({
          success: true,
          data: portal
        })
      }
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
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
    const { plan, billingPeriod, currency, provider } = body
    
    if (!plan || !['PRO', 'ELITE'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }
    
    if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 })
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    if (provider === 'razorpay') {
      // Create Razorpay order
      const order = await subscriptionService.createRazorpayOrder(user.id, plan, billingPeriod)
      return NextResponse.json({
        success: true,
        provider: 'razorpay',
        data: order
      })
    } else {
      // Default to Stripe
      const session = await subscriptionService.createCheckoutSession(user.id, {
        plan,
        billingPeriod,
        currency: currency || 'usd',
        successUrl: `${baseUrl}/dashboard?checkout=success`,
        cancelUrl: `${baseUrl}/dashboard?checkout=cancelled`
      })
      
      return NextResponse.json({
        success: true,
        provider: 'stripe',
        data: session
      })
    }
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const immediately = searchParams.get("immediately") === "true"

  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await subscriptionService.cancelSubscription(user.id, immediately)
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 })
  }
}
