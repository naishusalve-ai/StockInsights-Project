import { NextResponse } from "next/server"
import crypto from 'crypto'
import { subscriptionService } from "@/lib/services/subscription-service"

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || ''

/**
 * POST /api/webhooks/razorpay
 * 
 * Handle Razorpay webhook events
 */
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      console.error('Razorpay webhook signature verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const event = JSON.parse(body)
    
    // Handle the event
    await subscriptionService.handleRazorpayWebhook(event)
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
