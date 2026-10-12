import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from 'stripe'
import { subscriptionService } from "@/lib/services/subscription-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/stripe
 * 
 * Handle Stripe webhook events
 */
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    // Handle the event
    await subscriptionService.handleStripeWebhook(event)
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
