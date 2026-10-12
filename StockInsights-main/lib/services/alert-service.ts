/**
 * Alerts & Notifications Service
 * 
 * Implements:
 * - Price alerts (above/below target)
 * - Indicator alerts (RSI, MACD crossovers)
 * - Percentage change alerts
 * - Email notifications
 * - Alert throttling
 */

import { prisma } from "@/lib/db"
import { stockDataService } from "./stock-data-service"
import { calculateRSI, calculateMACD, calculateSMA } from "./technical-analysis-service"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface CreateAlertInput {
  symbol: string
  alertType: 'PRICE' | 'INDICATOR' | 'PERCENT_CHANGE'
  condition: 'ABOVE' | 'BELOW' | 'CROSSES_ABOVE' | 'CROSSES_BELOW'
  targetPrice?: number
  indicatorName?: string
  indicatorValue?: number
  percentChange?: number
}

export interface AlertWithStatus {
  id: string
  symbol: string
  alertType: string
  condition: string
  targetPrice: number | null
  indicatorName: string | null
  indicatorValue: number | null
  isActive: boolean
  isTriggered: boolean
  triggeredAt: Date | null
  currentValue: number
  distance: number
  distancePercent: number
  createdAt: Date
}

export interface NotificationPayload {
  type: 'ALERT_TRIGGERED'
  alertId: string
  symbol: string
  message: string
  currentValue: number
  targetValue: number
  triggeredAt: Date
}

// ==========================================
// EMAIL SERVICE (Integration point)
// ==========================================

async function sendEmailNotification(
  email: string,
  subject: string,
  body: string
): Promise<boolean> {
  // In production, integrate with:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Nodemailer
  
  // For now, log the email
  console.log(`[EMAIL] To: ${email}`)
  console.log(`[EMAIL] Subject: ${subject}`)
  console.log(`[EMAIL] Body: ${body}`)
  
  // Return true for success
  return true
}

// ==========================================
// ALERT CHECKING LOGIC
// ==========================================

async function checkPriceAlert(
  alert: any,
  currentPrice: number,
  previousPrice: number
): Promise<boolean> {
  const target = alert.targetPrice
  
  switch (alert.condition) {
    case 'ABOVE':
      return currentPrice >= target
    
    case 'BELOW':
      return currentPrice <= target
    
    case 'CROSSES_ABOVE':
      return previousPrice < target && currentPrice >= target
    
    case 'CROSSES_BELOW':
      return previousPrice > target && currentPrice <= target
    
    default:
      return false
  }
}

async function checkIndicatorAlert(
  alert: any,
  historicalData: any[]
): Promise<{ triggered: boolean; currentValue: number }> {
  const closes = historicalData.map(d => d.close)
  
  let currentValue = 0
  let triggered = false
  
  switch (alert.indicatorName?.toUpperCase()) {
    case 'RSI':
      const rsi = calculateRSI(closes, 14)
      currentValue = rsi[rsi.length - 1]
      
      if (alert.condition === 'BELOW' && currentValue <= alert.indicatorValue) {
        triggered = true
      } else if (alert.condition === 'ABOVE' && currentValue >= alert.indicatorValue) {
        triggered = true
      }
      break
    
    case 'MACD':
      const macd = calculateMACD(closes, 12, 26, 9)
      currentValue = macd.histogram[macd.histogram.length - 1]
      
      const prevHistogram = macd.histogram[macd.histogram.length - 2]
      
      if (alert.condition === 'CROSSES_ABOVE' && prevHistogram < 0 && currentValue >= 0) {
        triggered = true
      } else if (alert.condition === 'CROSSES_BELOW' && prevHistogram > 0 && currentValue <= 0) {
        triggered = true
      }
      break
    
    case 'SMA':
      const smaPeriod = alert.indicatorValue || 50
      const sma = calculateSMA(closes, smaPeriod)
      currentValue = closes[closes.length - 1]
      const smaValue = sma[sma.length - 1]
      
      const prevClose = closes[closes.length - 2]
      const prevSma = sma[sma.length - 2]
      
      if (alert.condition === 'CROSSES_ABOVE' && prevClose < prevSma && currentValue >= smaValue) {
        triggered = true
      } else if (alert.condition === 'CROSSES_BELOW' && prevClose > prevSma && currentValue <= smaValue) {
        triggered = true
      }
      break
    
    default:
      break
  }
  
  return { triggered, currentValue }
}

async function checkPercentChangeAlert(
  alert: any,
  currentPrice: number,
  previousClose: number
): Promise<boolean> {
  const percentChange = ((currentPrice - previousClose) / previousClose) * 100
  const targetPercent = alert.indicatorValue || 5
  
  switch (alert.condition) {
    case 'ABOVE':
      return percentChange >= targetPercent
    
    case 'BELOW':
      return percentChange <= -targetPercent
    
    default:
      return Math.abs(percentChange) >= targetPercent
  }
}

// ==========================================
// THROTTLING LOGIC
// ==========================================

const THROTTLE_DURATION = 60 * 60 * 1000 // 1 hour between notifications for same alert

function shouldThrottle(alert: any): boolean {
  if (!alert.lastNotified) return false
  
  const timeSinceLastNotification = Date.now() - new Date(alert.lastNotified).getTime()
  return timeSinceLastNotification < THROTTLE_DURATION
}

// ==========================================
// MAIN ALERT SERVICE
// ==========================================

export const alertService = {
  /**
   * Create a new alert
   */
  async createAlert(userId: string, input: CreateAlertInput) {
    // Validate input
    if (input.alertType === 'PRICE' && !input.targetPrice) {
      throw new Error('Target price is required for price alerts')
    }
    
    if (input.alertType === 'INDICATOR' && !input.indicatorName) {
      throw new Error('Indicator name is required for indicator alerts')
    }
    
    // Check user's alert limit (based on plan)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    })
    
    const alertLimits = {
      FREE: 5,
      PRO: 50,
      ELITE: 500
    }
    
    const existingAlerts = await prisma.priceAlert.count({
      where: { userId, isActive: true }
    })
    
    const limit = alertLimits[(user?.plan || 'FREE') as keyof typeof alertLimits]
    if (existingAlerts >= limit) {
      throw new Error(`Alert limit reached (${limit}). Upgrade your plan for more alerts.`)
    }
    
    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        symbol: input.symbol.toUpperCase(),
        alertType: input.alertType,
        condition: input.condition,
        targetPrice: input.targetPrice,
        indicatorName: input.indicatorName,
        indicatorValue: input.indicatorValue
      }
    })
    
    return alert
  },
  
  /**
   * Get all alerts for a user
   */
  async getAlerts(userId: string, includeTriggered = false): Promise<AlertWithStatus[]> {
    const where: any = { userId }
    if (!includeTriggered) {
      where.isActive = true
    }
    
    const alerts = await prisma.priceAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    // Get current prices for all symbols
    const symbols: string[] = [...new Set(alerts.map((a: { symbol: string }) => a.symbol))]
    const quotes = await stockDataService.getBatchQuotes(symbols)
    
    return alerts.map((alert: { symbol: string; targetPrice: number | null; indicatorValue: number | null; isActive: boolean; isTriggered: boolean; triggeredAt: Date | null; id: string; userId: string; alertType: string; condition: string; indicatorName: string | null; lastNotified: Date | null; createdAt: Date; updatedAt: Date }) => {
      const quote = quotes.get(alert.symbol)
      const currentValue = quote?.price || 0
      const targetValue = alert.targetPrice || alert.indicatorValue || 0
      
      const distance = currentValue - targetValue
      const distancePercent = targetValue > 0 ? (distance / targetValue) * 100 : 0
      
      return {
        id: alert.id,
        symbol: alert.symbol,
        alertType: alert.alertType,
        condition: alert.condition,
        targetPrice: alert.targetPrice,
        indicatorName: alert.indicatorName,
        indicatorValue: alert.indicatorValue,
        isActive: alert.isActive,
        isTriggered: alert.isTriggered,
        triggeredAt: alert.triggeredAt,
        currentValue,
        distance,
        distancePercent,
        createdAt: alert.createdAt
      }
    })
  },
  
  /**
   * Update an alert
   */
  async updateAlert(userId: string, alertId: string, updates: Partial<CreateAlertInput>) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId }
    })
    
    if (!alert) {
      throw new Error('Alert not found')
    }
    
    return await prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        symbol: updates.symbol?.toUpperCase() || alert.symbol,
        alertType: updates.alertType || alert.alertType,
        condition: updates.condition || alert.condition,
        targetPrice: updates.targetPrice ?? alert.targetPrice,
        indicatorName: updates.indicatorName ?? alert.indicatorName,
        indicatorValue: updates.indicatorValue ?? alert.indicatorValue,
        isTriggered: false, // Reset trigger on update
        triggeredAt: null
      }
    })
  },
  
  /**
   * Delete an alert
   */
  async deleteAlert(userId: string, alertId: string) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId }
    })
    
    if (!alert) {
      throw new Error('Alert not found')
    }
    
    await prisma.priceAlert.delete({
      where: { id: alertId }
    })
    
    return { success: true }
  },
  
  /**
   * Deactivate an alert
   */
  async deactivateAlert(userId: string, alertId: string) {
    return await prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: false }
    })
  },
  
  /**
   * Reactivate an alert
   */
  async reactivateAlert(userId: string, alertId: string) {
    return await prisma.priceAlert.update({
      where: { id: alertId },
      data: { 
        isActive: true,
        isTriggered: false,
        triggeredAt: null
      }
    })
  },
  
  /**
   * Check all active alerts (called by cron job)
   */
  async checkAllAlerts(): Promise<NotificationPayload[]> {
    const activeAlerts = await prisma.priceAlert.findMany({
      where: { 
        isActive: true,
        isTriggered: false
      },
      include: {
        User: {
          select: { email: true, plan: true }
        }
      }
    })
    
    const triggeredNotifications: NotificationPayload[] = []
    
    // Group alerts by symbol for efficient fetching
    const alertsBySymbol = new Map<string, typeof activeAlerts>()
    for (const alert of activeAlerts) {
      const existing = alertsBySymbol.get(alert.symbol) || []
      existing.push(alert)
      alertsBySymbol.set(alert.symbol, existing)
    }
    
    // Process each symbol
    for (const [symbol, symbolAlerts] of alertsBySymbol) {
      try {
        const quote = await stockDataService.getQuote(symbol)
        if (!quote) continue
        
        const currentPrice = quote.price
        const previousClose = quote.previousClose
        
        // Get historical data for indicator alerts
        let historicalData: any[] = []
        const hasIndicatorAlerts = symbolAlerts.some((a: { alertType: string }) => a.alertType === 'INDICATOR')
        if (hasIndicatorAlerts) {
          historicalData = await stockDataService.getHistorical(symbol, '1d', '3mo')
        }
        
        for (const alert of symbolAlerts) {
          // Check throttling
          if (shouldThrottle(alert)) continue
          
          let triggered = false
          let currentValue = currentPrice
          
          switch (alert.alertType) {
            case 'PRICE':
              triggered = await checkPriceAlert(alert, currentPrice, previousClose)
              break
            
            case 'INDICATOR':
              const result = await checkIndicatorAlert(alert, historicalData)
              triggered = result.triggered
              currentValue = result.currentValue
              break
            
            case 'PERCENT_CHANGE':
              triggered = await checkPercentChangeAlert(alert, currentPrice, previousClose)
              currentValue = ((currentPrice - previousClose) / previousClose) * 100
              break
          }
          
          if (triggered) {
            // Update alert as triggered
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: {
                isTriggered: true,
                triggeredAt: new Date(),
                lastNotified: new Date()
              }
            })
            
            // Create notification payload
            const targetValue = alert.targetPrice || alert.indicatorValue || 0
            const message = generateAlertMessage(alert, currentValue, targetValue)
            
            const notification: NotificationPayload = {
              type: 'ALERT_TRIGGERED',
              alertId: alert.id,
              symbol: alert.symbol,
              message,
              currentValue,
              targetValue,
              triggeredAt: new Date()
            }
            
            triggeredNotifications.push(notification)
            
            // Send email notification
            if (alert.User?.email) {
              await sendEmailNotification(
                alert.User.email,
                `🔔 Alert Triggered: ${alert.symbol}`,
                message
              )
            }
          }
        }
      } catch (error) {
        console.error(`Error checking alerts for ${symbol}:`, error)
      }
    }
    
    return triggeredNotifications
  },
  
  /**
   * Get alert summary for user
   */
  async getAlertSummary(userId: string) {
    const [active, triggered, total] = await Promise.all([
      prisma.priceAlert.count({ where: { userId, isActive: true, isTriggered: false } }),
      prisma.priceAlert.count({ where: { userId, isTriggered: true } }),
      prisma.priceAlert.count({ where: { userId } })
    ])
    
    // Get recently triggered
    const recentlyTriggered = await prisma.priceAlert.findMany({
      where: { userId, isTriggered: true },
      orderBy: { triggeredAt: 'desc' },
      take: 5
    })
    
    return {
      active,
      triggered,
      total,
      recentlyTriggered
    }
  }
}

function generateAlertMessage(
  alert: any,
  currentValue: number,
  targetValue: number
): string {
  const symbol = alert.symbol
  
  switch (alert.alertType) {
    case 'PRICE':
      if (alert.condition === 'ABOVE' || alert.condition === 'CROSSES_ABOVE') {
        return `${symbol} has risen above ₹${targetValue.toFixed(2)}. Current price: ₹${currentValue.toFixed(2)}`
      } else {
        return `${symbol} has fallen below ₹${targetValue.toFixed(2)}. Current price: ₹${currentValue.toFixed(2)}`
      }
    
    case 'INDICATOR':
      const indicator = alert.indicatorName
      if (indicator === 'RSI') {
        if (alert.condition === 'BELOW') {
          return `${symbol} RSI is now ${currentValue.toFixed(1)} (oversold below ${targetValue})`
        } else {
          return `${symbol} RSI is now ${currentValue.toFixed(1)} (overbought above ${targetValue})`
        }
      } else if (indicator === 'MACD') {
        return `${symbol} MACD has crossed ${alert.condition === 'CROSSES_ABOVE' ? 'bullish' : 'bearish'}`
      }
      return `${symbol} ${indicator} alert triggered. Current value: ${currentValue.toFixed(2)}`
    
    case 'PERCENT_CHANGE':
      const direction = currentValue > 0 ? 'up' : 'down'
      return `${symbol} is ${direction} ${Math.abs(currentValue).toFixed(2)}% today`
    
    default:
      return `Alert triggered for ${symbol}`
  }
}

export default alertService
