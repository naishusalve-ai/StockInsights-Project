/**
 * Subscription & Monetization Service
 * 
 * Implements:
 * - Stripe integration for international payments
 * - Razorpay integration for Indian payments
 * - Feature flags per plan
 * - Usage tracking & rate limiting
 * - Upgrade/downgrade flows
 */

import { prisma } from "@/lib/db"
import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover'
})

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type PlanType = 'FREE' | 'PRO' | 'ELITE'

export interface PlanFeatures {
  name: string
  price: {
    monthly: { inr: number; usd: number }
    yearly: { inr: number; usd: number }
  }
  features: {
    maxWatchlistItems: number
    maxAlerts: number
    technicalIndicators: 'basic' | 'advanced' | 'full'
    predictions: boolean
    backtesting: boolean
    sentimentAnalysis: boolean
    apiAccess: boolean
    apiRateLimit: number // requests per minute
    exportData: boolean
    prioritySupport: boolean
    realTimeData: boolean
    historicalDataYears: number
  }
}

export interface CheckoutSessionInput {
  plan: 'PRO' | 'ELITE'
  billingPeriod: 'monthly' | 'yearly'
  currency: 'inr' | 'usd'
  successUrl: string
  cancelUrl: string
}

export interface UsageStats {
  apiCalls: number
  apiLimit: number
  alertsUsed: number
  alertsLimit: number
  watchlistItems: number
  watchlistLimit: number
  resetDate: Date
}

// ==========================================
// PLAN DEFINITIONS
// ==========================================

export const PLANS: Record<PlanType, PlanFeatures> = {
  FREE: {
    name: 'Free',
    price: {
      monthly: { inr: 0, usd: 0 },
      yearly: { inr: 0, usd: 0 }
    },
    features: {
      maxWatchlistItems: 10,
      maxAlerts: 5,
      technicalIndicators: 'basic',
      predictions: false,
      backtesting: false,
      sentimentAnalysis: false,
      apiAccess: false,
      apiRateLimit: 10,
      exportData: false,
      prioritySupport: false,
      realTimeData: false,
      historicalDataYears: 1
    }
  },
  PRO: {
    name: 'Pro',
    price: {
      monthly: { inr: 999, usd: 12 },
      yearly: { inr: 9999, usd: 120 }
    },
    features: {
      maxWatchlistItems: 50,
      maxAlerts: 50,
      technicalIndicators: 'advanced',
      predictions: true,
      backtesting: true,
      sentimentAnalysis: true,
      apiAccess: true,
      apiRateLimit: 60,
      exportData: true,
      prioritySupport: false,
      realTimeData: true,
      historicalDataYears: 5
    }
  },
  ELITE: {
    name: 'Elite',
    price: {
      monthly: { inr: 2999, usd: 36 },
      yearly: { inr: 29999, usd: 360 }
    },
    features: {
      maxWatchlistItems: 500,
      maxAlerts: 500,
      technicalIndicators: 'full',
      predictions: true,
      backtesting: true,
      sentimentAnalysis: true,
      apiAccess: true,
      apiRateLimit: 300,
      exportData: true,
      prioritySupport: true,
      realTimeData: true,
      historicalDataYears: 20
    }
  }
}

// Stripe Price IDs (configure in Stripe Dashboard)
const STRIPE_PRICE_IDS = {
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly'
  },
  ELITE: {
    monthly: process.env.STRIPE_ELITE_MONTHLY_PRICE_ID || 'price_elite_monthly',
    yearly: process.env.STRIPE_ELITE_YEARLY_PRICE_ID || 'price_elite_yearly'
  }
}

// ==========================================
// RATE LIMITING
// ==========================================

const usageCache = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(userId: string): string {
  const now = new Date()
  const minute = Math.floor(now.getTime() / 60000)
  return `${userId}:${minute}`
}

export function checkRateLimit(userId: string, plan: PlanType): { allowed: boolean; remaining: number } {
  const limit = PLANS[plan].features.apiRateLimit
  const key = getRateLimitKey(userId)
  
  const current = usageCache.get(key) || { count: 0, resetAt: Date.now() + 60000 }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  usageCache.set(key, current)
  
  return { allowed: true, remaining: limit - current.count }
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of usageCache.entries()) {
    if (value.resetAt < now) {
      usageCache.delete(key)
    }
  }
}, 60000)

// ==========================================
// SUBSCRIPTION SERVICE
// ==========================================

export const subscriptionService = {
  /**
   * Get plan features
   */
  getPlanFeatures(plan: PlanType): PlanFeatures {
    return PLANS[plan]
  },
  
  /**
   * Get all plans for comparison
   */
  getAllPlans(): Record<PlanType, PlanFeatures> {
    return PLANS
  },
  
  /**
   * Check if user has access to a feature
   */
  async hasFeature(userId: string, feature: keyof PlanFeatures['features']): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })
    
    const plan = (user?.plan || 'FREE') as PlanType
    const features = PLANS[plan].features
    
    const value = features[feature]
    
    // Boolean features
    if (typeof value === 'boolean') {
      return value
    }
    
    // String features (always available, but with different levels)
    if (typeof value === 'string') {
      return true
    }
    
    // Numeric features (check against limits elsewhere)
    return true
  },
  
  /**
   * Get user's current plan and subscription status
   */
  async getUserSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Subscription: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    const plan = (user.plan || 'FREE') as PlanType
    const subscription = user.Subscription[0]
    
    return {
      plan,
      planDetails: PLANS[plan],
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      } : null,
      isActive: plan !== 'FREE'
    }
  },
  
  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(userId: string, input: CheckoutSessionInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    // Get or create Stripe customer
    let customerId = user.stripeCustomerId
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId }
      })
      
      customerId = customer.id
      
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      })
    }
    
    // Get price ID
    const priceId = STRIPE_PRICE_IDS[input.plan][input.billingPeriod]
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        userId,
        plan: input.plan,
        billingPeriod: input.billingPeriod
      },
      subscription_data: {
        metadata: {
          userId,
          plan: input.plan
        }
      }
    })
    
    return {
      sessionId: session.id,
      url: session.url
    }
  },
  
  /**
   * Create Razorpay order (for Indian payments)
   */
  async createRazorpayOrder(userId: string, plan: 'PRO' | 'ELITE', billingPeriod: 'monthly' | 'yearly') {
    // Initialize Razorpay
    const Razorpay = require('razorpay')
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    
    const price = PLANS[plan].price[billingPeriod].inr
    
    const order = await razorpay.orders.create({
      amount: price * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        plan,
        billingPeriod
      }
    })
    
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }
  },
  
  /**
   * Handle Stripe webhook
   */
  async handleStripeWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as 'PRO' | 'ELITE'
        
        if (userId && plan) {
          await this.activateSubscription(userId, {
            provider: 'STRIPE',
            externalId: session.subscription as string,
            plan
          })
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId
        
        if (userId) {
          const periodEnd = typeof subscription.current_period_end === 'number' 
            ? subscription.current_period_end 
            : Date.now() / 1000
          await this.updateSubscriptionStatus(
            subscription.id,
            subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED',
            new Date(periodEnd * 1000),
            subscription.cancel_at_period_end
          )
        }
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId
        
        if (userId) {
          await this.cancelSubscription(userId)
        }
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.toString() || ''
        
        if (!subscriptionId) break
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId
        
        if (userId && invoice.amount_paid > 0) {
          await prisma.payment.create({
            data: {
              userId,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency.toUpperCase(),
              status: 'COMPLETED',
              provider: 'STRIPE',
              externalId: invoice.id
            }
          })
        }
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription?.toString() || ''
        
        if (!subscriptionId) break
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = subscription.metadata.userId
        
        if (userId) {
          // Mark subscription as past due
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'PAST_DUE' }
          })
        }
        break
      }
    }
    
    return { received: true }
  },
  
  /**
   * Handle Razorpay webhook
   */
  async handleRazorpayWebhook(event: any) {
    const { event: eventType, payload } = event
    
    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity
        const { userId, plan, billingPeriod } = payment.notes
        
        if (userId && plan) {
          // Calculate period end
          const periodEnd = new Date()
          if (billingPeriod === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
          }
          
          await this.activateSubscription(userId, {
            provider: 'RAZORPAY',
            externalId: payment.id,
            plan,
            periodEnd
          })
          
          // Record payment
          await prisma.payment.create({
            data: {
              userId,
              amount: payment.amount / 100,
              currency: payment.currency.toUpperCase(),
              status: 'COMPLETED',
              provider: 'RAZORPAY',
              externalId: payment.id
            }
          })
        }
        break
      }
      
      case 'payment.failed': {
        const payment = payload.payment.entity
        const { userId } = payment.notes
        
        if (userId) {
          await prisma.payment.create({
            data: {
              userId,
              amount: payment.amount / 100,
              currency: payment.currency.toUpperCase(),
              status: 'FAILED',
              provider: 'RAZORPAY',
              externalId: payment.id
            }
          })
        }
        break
      }
    }
    
    return { received: true }
  },
  
  /**
   * Activate subscription after successful payment
   */
  async activateSubscription(userId: string, data: {
    provider: 'STRIPE' | 'RAZORPAY'
    externalId: string
    plan: 'PRO' | 'ELITE'
    periodEnd?: Date
  }) {
    // Calculate period end if not provided
    const periodEnd = data.periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    
    // Deactivate any existing subscriptions
    await prisma.subscription.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' }
    })
    
    // Create new subscription
    await prisma.subscription.create({
      data: {
        userId,
        plan: data.plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        stripeSubscriptionId: data.provider === 'STRIPE' ? data.externalId : null,
        razorpaySubscriptionId: data.provider === 'RAZORPAY' ? data.externalId : null
      }
    })
    
    // Update user's plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: data.plan }
    })
    
    return { success: true }
  },
  
  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE',
    periodEnd?: Date,
    cancelAtPeriodEnd?: boolean
  ) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd
      }
    })
  },
  
  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string, immediately = false) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' }
    })
    
    if (!subscription) {
      throw new Error('No active subscription found')
    }
    
    if (subscription.stripeSubscriptionId) {
      if (immediately) {
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
      } else {
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        })
      }
    }
    
    if (immediately) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED' }
      })
      
      await prisma.user.update({
        where: { id: userId },
        data: { plan: 'FREE' }
      })
    } else {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true }
      })
    }
    
    return { success: true }
  },
  
  /**
   * Get billing portal URL
   */
  async getBillingPortalUrl(userId: string, returnUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true }
    })
    
    if (!user?.stripeCustomerId) {
      throw new Error('No billing account found')
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl
    })
    
    return { url: session.url }
  },
  
  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string): Promise<UsageStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })
    
    const plan = (user?.plan || 'FREE') as PlanType
    const features = PLANS[plan].features
    
    // Get actual usage
    const [alertCount, watchlistCount] = await Promise.all([
      prisma.priceAlert.count({ where: { userId, isActive: true } }),
      prisma.watchlist.count({ where: { userId } })
    ])
    
    // API calls are tracked in memory
    const key = getRateLimitKey(userId)
    const apiUsage = usageCache.get(key)?.count || 0
    
    return {
      apiCalls: apiUsage,
      apiLimit: features.apiRateLimit,
      alertsUsed: alertCount,
      alertsLimit: features.maxAlerts,
      watchlistItems: watchlistCount,
      watchlistLimit: features.maxWatchlistItems,
      resetDate: new Date(Math.ceil(Date.now() / 60000) * 60000)
    }
  },
  
  /**
   * Get payment history
   */
  async getPaymentHistory(userId: string, limit = 10) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return payments
  },
  
  /**
   * Generate invoice (for compliance)
   */
  async generateInvoice(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })
    
    if (!payment) {
      throw new Error('Payment not found')
    }
    
    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${payment.id.slice(0, 8).toUpperCase()}`,
      date: payment.createdAt,
      customer: {
        email: payment.user.email,
        name: payment.user.name
      },
      items: [
        {
          description: 'StockInsight Subscription',
          amount: payment.amount,
          currency: payment.currency
        }
      ],
      total: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.provider
    }
    
    return invoice
  }
}

export default subscriptionService
