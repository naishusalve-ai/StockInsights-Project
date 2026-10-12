import { NextResponse } from "next/server"
import { alertService } from "@/lib/services/alert-service"

/**
 * GET /api/cron/check-alerts
 * 
 * Cron job endpoint to check all active alerts
 * Should be called every minute by a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Secure with a secret token in production
 */
export async function GET(req: Request) {
  try {
    // Verify cron secret in production
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check all alerts
    const triggeredNotifications = await alertService.checkAllAlerts()
    
    return NextResponse.json({
      success: true,
      triggeredCount: triggeredNotifications.length,
      notifications: triggeredNotifications
    })
    
  } catch (error: any) {
    console.error('Cron alert check error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Also support POST for some cron services
export async function POST(req: Request) {
  return GET(req)
}
