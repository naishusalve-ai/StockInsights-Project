/**
 * Portfolio Service
 * 
 * Implements real investor-grade portfolio management with:
 * - Transaction tracking (BUY/SELL)
 * - Average buy price calculation
 * - Realized & Unrealized P&L
 * - Day P&L, Total P&L
 * - XIRR/CAGR calculations
 * - Allocation percentages
 */

import { prisma } from "@/lib/db"
import { stockDataService, StockQuote } from "./stock-data-service"
import { Prisma } from "@prisma/client"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface HoldingWithMetrics {
  id: string
  symbol: string
  quantity: number
  avgBuyPrice: number
  totalInvested: number
  currentPrice: number
  currentValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  realizedPnL: number
  dayPnL: number
  dayPnLPercent: number
  allocationPercent: number
  lastUpdated: number
}

export interface PortfolioSummary {
  totalInvested: number
  currentValue: number
  totalUnrealizedPnL: number
  totalUnrealizedPnLPercent: number
  totalRealizedPnL: number
  dayPnL: number
  dayPnLPercent: number
  holdings: HoldingWithMetrics[]
  cagr: number | null
  xirr: number | null
  topGainers: HoldingWithMetrics[]
  topLosers: HoldingWithMetrics[]
}

export interface TransactionInput {
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  fees?: number
  notes?: string
  date?: Date
  executedAt?: Date
}

export interface PortfolioPerformanceData {
  date: string
  value: number
  invested: number
  pnl: number
  pnlPercent: number
}

// ==========================================
// XIRR CALCULATION
// ==========================================

interface CashFlow {
  date: Date
  amount: number
}

function calculateXIRR(cashFlows: CashFlow[], guess: number = 0.1): number | null {
  if (cashFlows.length < 2) return null

  const maxIterations = 100
  const tolerance = 1e-7
  let rate = guess

  for (let i = 0; i < maxIterations; i++) {
    let fValue = 0
    let fDerivative = 0

    for (const cf of cashFlows) {
      const years = (cf.date.getTime() - cashFlows[0].date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      const factor = Math.pow(1 + rate, years)
      fValue += cf.amount / factor
      fDerivative -= (years * cf.amount) / (factor * (1 + rate))
    }

    const newRate = rate - fValue / fDerivative

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100 // Return as percentage
    }

    rate = newRate
  }

  return null // Failed to converge
}

function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number | null {
  if (initialValue <= 0 || years <= 0) return null
  return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100
}

// ==========================================
// PORTFOLIO SERVICE
// ==========================================

export const portfolioService = {
  /**
   * Add a transaction (BUY or SELL)
   */
  async addTransaction(userId: string, input: TransactionInput) {
    const { symbol, type, quantity, price, fees = 0, notes, date, executedAt } = input
    const transactionDate = date || executedAt || new Date()

    if (quantity <= 0 || price <= 0) {
      throw new Error('Quantity and price must be positive')
    }

    const totalAmount = quantity * price + (type === 'BUY' ? fees : -fees)

    // Get or create holding
    let holding = await prisma.portfolioHolding.findUnique({
      where: {
        userId_symbol: { userId, symbol: symbol.toUpperCase() }
      }
    })

    if (type === 'SELL') {
      if (!holding || holding.quantity < quantity) {
        throw new Error(`Insufficient shares. You have ${holding?.quantity || 0} shares of ${symbol}`)
      }
    }

    // Start transaction
    return await prisma.$transaction(async (tx: any) => {
      if (!holding) {
        // Create new holding for BUY
        holding = await tx.portfolioHolding.create({
          data: {
            userId,
            symbol: symbol.toUpperCase(),
            quantity: 0,
            avgBuyPrice: 0,
            totalInvested: 0,
            realizedPnL: 0
          }
        })
      }

      let newQuantity: number
      let newAvgPrice: number
      let newTotalInvested: number
      let realizedPnL = holding.realizedPnL

      if (type === 'BUY') {
        // Calculate new average buy price
        const currentTotalCost = holding.quantity * holding.avgBuyPrice
        const newTotalCost = currentTotalCost + totalAmount
        newQuantity = holding.quantity + quantity
        newAvgPrice = newQuantity > 0 ? newTotalCost / newQuantity : 0
        newTotalInvested = holding.totalInvested + totalAmount
      } else {
        // SELL - Calculate realized P&L
        const costBasis = quantity * holding.avgBuyPrice
        const sellProceeds = quantity * price - fees
        const pnl = sellProceeds - costBasis
        
        realizedPnL = holding.realizedPnL + pnl
        newQuantity = holding.quantity - quantity
        newAvgPrice = holding.avgBuyPrice // Avg price doesn't change on sell
        newTotalInvested = holding.totalInvested * (newQuantity / holding.quantity)
      }

      // Update holding
      await tx.portfolioHolding.update({
        where: { id: holding.id },
        data: {
          quantity: newQuantity,
          avgBuyPrice: newAvgPrice,
          totalInvested: newTotalInvested,
          realizedPnL
        }
      })

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          holdingId: holding.id,
          symbol: symbol.toUpperCase(),
          type,
          quantity,
          price,
          totalAmount,
          fees,
          notes,
          executedAt: transactionDate
        }
      })

      return {
        transaction,
        holding: {
          ...holding,
          quantity: newQuantity,
          avgBuyPrice: newAvgPrice,
          totalInvested: newTotalInvested,
          realizedPnL
        }
      }
    })
  },

  /**
   * Get all holdings with real-time metrics
   */
  async getHoldings(userId: string): Promise<HoldingWithMetrics[]> {
    const holdings = await prisma.portfolioHolding.findMany({
      where: { userId, quantity: { gt: 0 } },
      orderBy: { symbol: 'asc' }
    })

    if (holdings.length === 0) return []

    // Fetch current prices for all symbols
    const symbols: string[] = holdings.map((h: { symbol: string }) => h.symbol)
    const quotes = await stockDataService.getBatchQuotes(symbols)

    // Calculate total portfolio value for allocation
    let totalValue = 0
    const holdingsWithPrices = holdings.map((h: { symbol: string; quantity: number; id: string; userId: string; avgBuyPrice: number; totalInvested: number; realizedPnL: number; createdAt: Date; updatedAt: Date }) => {
      const quote = quotes.get(h.symbol)
      const currentPrice = quote?.price || 0
      const currentValue = h.quantity * currentPrice
      totalValue += currentValue
      return { holding: h, quote, currentPrice, currentValue }
    })

    interface HoldingData {
      holding: { id: string; symbol: string; quantity: number; avgBuyPrice: number; totalInvested: number; realizedPnL: number }
      quote: StockQuote | undefined
      currentPrice: number
      currentValue: number
    }

    // Calculate metrics for each holding
    return holdingsWithPrices.map(({ holding, quote, currentPrice, currentValue }: HoldingData) => {
      const unrealizedPnL = currentValue - holding.totalInvested
      const unrealizedPnLPercent = holding.totalInvested > 0 
        ? (unrealizedPnL / holding.totalInvested) * 100 
        : 0

      const previousClose = quote?.previousClose || currentPrice
      const previousValue = holding.quantity * previousClose
      const dayPnL = currentValue - previousValue
      const dayPnLPercent = previousValue > 0 ? (dayPnL / previousValue) * 100 : 0

      const allocationPercent = totalValue > 0 ? (currentValue / totalValue) * 100 : 0

      return {
        id: holding.id,
        symbol: holding.symbol,
        quantity: holding.quantity,
        avgBuyPrice: holding.avgBuyPrice,
        totalInvested: holding.totalInvested,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
        realizedPnL: holding.realizedPnL,
        dayPnL,
        dayPnLPercent,
        allocationPercent,
        lastUpdated: Date.now()
      }
    })
  },

  /**
   * Get portfolio summary with all metrics
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const holdings = await this.getHoldings(userId)

    if (holdings.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalUnrealizedPnL: 0,
        totalUnrealizedPnLPercent: 0,
        totalRealizedPnL: 0,
        dayPnL: 0,
        dayPnLPercent: 0,
        holdings: [],
        cagr: null,
        xirr: null,
        topGainers: [],
        topLosers: []
      }
    }

    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0)
    const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const totalUnrealizedPnL = holdings.reduce((sum, h) => sum + h.unrealizedPnL, 0)
    const totalUnrealizedPnLPercent = totalInvested > 0 
      ? (totalUnrealizedPnL / totalInvested) * 100 
      : 0
    const totalRealizedPnL = holdings.reduce((sum, h) => sum + h.realizedPnL, 0)
    const dayPnL = holdings.reduce((sum, h) => sum + h.dayPnL, 0)

    // Calculate day P&L percent based on yesterday's value
    const yesterdayValue = currentValue - dayPnL
    const dayPnLPercent = yesterdayValue > 0 ? (dayPnL / yesterdayValue) * 100 : 0

    // Get transactions for XIRR calculation
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' }
    })

    // Build cash flows for XIRR
    const cashFlows: CashFlow[] = transactions.map((t: { executedAt: Date; type: string; totalAmount: number }) => ({
      date: t.executedAt,
      amount: t.type === 'BUY' ? -t.totalAmount : t.totalAmount
    }))

    // Add current portfolio value as final cash flow
    if (currentValue > 0) {
      cashFlows.push({
        date: new Date(),
        amount: currentValue
      })
    }

    const xirr = calculateXIRR(cashFlows)

    // Calculate CAGR if we have enough history
    let cagr: number | null = null
    if (transactions.length > 0) {
      const firstTransaction = transactions[0]
      const years = (Date.now() - firstTransaction.executedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      if (years >= 0.1) { // At least ~1 month
        cagr = calculateCAGR(totalInvested, currentValue, years)
      }
    }

    // Top gainers and losers
    const sortedByPnL = [...holdings].sort((a, b) => b.unrealizedPnLPercent - a.unrealizedPnLPercent)
    const topGainers = sortedByPnL.filter(h => h.unrealizedPnL > 0).slice(0, 5)
    const topLosers = sortedByPnL.filter(h => h.unrealizedPnL < 0).slice(-5).reverse()

    return {
      totalInvested,
      currentValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent,
      totalRealizedPnL,
      dayPnL,
      dayPnLPercent,
      holdings,
      cagr,
      xirr,
      topGainers,
      topLosers
    }
  },

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    options?: {
      symbol?: string
      type?: 'BUY' | 'SELL'
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    }
  ) {
    const { symbol, type, startDate, endDate, limit = 50, offset = 0 } = options || {}

    const where: any = { userId }
    
    if (symbol) where.symbol = symbol.toUpperCase()
    if (type) where.type = type
    if (startDate || endDate) {
      where.executedAt = {}
      if (startDate) where.executedAt.gte = startDate
      if (endDate) where.executedAt.lte = endDate
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { executedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.transaction.count({ where })
    ])

    return {
      transactions,
      total,
      hasMore: offset + transactions.length < total
    }
  },

  /**
   * Get portfolio performance over time
   */
  async getPerformanceHistory(
    userId: string,
    days: number = 30
  ): Promise<PortfolioPerformanceData[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' }
    })

    if (transactions.length === 0) return []

    // Get current holdings
    const holdings = await prisma.portfolioHolding.findMany({
      where: { userId, quantity: { gt: 0 } }
    })

    // Get historical data for each symbol
    const symbols = Array.from(new Set(transactions.map((t: { symbol: string }) => t.symbol))) as string[]
    const historicalData = new Map<string, Map<string, number>>()

    for (const symbol of symbols) {
      try {
        const data = await stockDataService.getHistorical(symbol, '1d', days <= 30 ? '1mo' : '1y')
        const priceMap = new Map<string, number>()
        for (const d of data) {
          priceMap.set(d.date, d.close)
        }
        historicalData.set(symbol, priceMap)
      } catch (error) {
        console.error(`Failed to get historical data for ${symbol}:`, error)
      }
    }

    // Calculate daily portfolio values
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const performanceData: PortfolioPerformanceData[] = []
    let currentDate = new Date(startDate)

    // Build cumulative holdings state
    const holdingsState = new Map<string, { quantity: number; invested: number }>()

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Apply transactions up to this date
      for (const t of transactions) {
        const txDate = t.executedAt.toISOString().split('T')[0]
        if (txDate <= dateStr) {
          const state = holdingsState.get(t.symbol) || { quantity: 0, invested: 0 }
          if (t.type === 'BUY') {
            state.quantity += t.quantity
            state.invested += t.totalAmount
          } else {
            const ratio = (state.quantity - t.quantity) / state.quantity
            state.quantity -= t.quantity
            state.invested *= ratio
          }
          holdingsState.set(t.symbol, state)
        }
      }

      // Calculate portfolio value on this date
      let portfolioValue = 0
      let totalInvested = 0

      for (const [symbol, state] of holdingsState) {
        if (state.quantity > 0) {
          const priceMap = historicalData.get(symbol)
          const price = priceMap?.get(dateStr) || 0
          portfolioValue += state.quantity * price
          totalInvested += state.invested
        }
      }

      if (totalInvested > 0) {
        const pnl = portfolioValue - totalInvested
        const pnlPercent = (pnl / totalInvested) * 100

        performanceData.push({
          date: dateStr,
          value: portfolioValue,
          invested: totalInvested,
          pnl,
          pnlPercent
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return performanceData
  },

  /**
   * Get allocation breakdown
   */
  async getAllocation(userId: string) {
    const holdings = await this.getHoldings(userId)
    
    // Group by sector (you could add sector info to holdings)
    const bySymbol = holdings.map(h => ({
      name: h.symbol,
      value: h.currentValue,
      percent: h.allocationPercent
    }))

    return {
      bySymbol,
      totalValue: holdings.reduce((sum, h) => sum + h.currentValue, 0)
    }
  },

  /**
   * Delete a holding (removes all transactions)
   */
  async deleteHolding(userId: string, holdingId: string) {
    const holding = await prisma.portfolioHolding.findFirst({
      where: { id: holdingId, userId }
    })

    if (!holding) {
      throw new Error('Holding not found')
    }

    // Delete transactions first, then holding
    await prisma.$transaction([
      prisma.transaction.deleteMany({ where: { holdingId } }),
      prisma.portfolioHolding.delete({ where: { id: holdingId } })
    ])

    return { success: true }
  },

  /**
   * Calculate XIRR for portfolio
   */
  async calculateXIRR(userId: string): Promise<number | null> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' }
    })

    if (transactions.length === 0) return null

    const holdings = await this.getHoldings(userId)
    const currentValue = holdings.reduce((sum: number, h: HoldingWithMetrics) => sum + h.currentValue, 0)

    const cashFlows: CashFlow[] = transactions.map((t: { executedAt: Date; type: string; totalAmount: number }) => ({
      date: t.executedAt,
      amount: t.type === 'BUY' ? -t.totalAmount : t.totalAmount
    }))

    if (currentValue > 0) {
      cashFlows.push({
        date: new Date(),
        amount: currentValue
      })
    }

    return calculateXIRR(cashFlows)
  },

  /**
   * Calculate CAGR for portfolio
   */
  async calculateCAGR(userId: string): Promise<number | null> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { executedAt: 'asc' },
      take: 1
    })

    if (transactions.length === 0) return null

    const holdings = await this.getHoldings(userId)
    const totalInvested = holdings.reduce((sum: number, h: HoldingWithMetrics) => sum + h.totalInvested, 0)
    const currentValue = holdings.reduce((sum: number, h: HoldingWithMetrics) => sum + h.currentValue, 0)

    const firstTransaction = transactions[0]
    const years = (Date.now() - firstTransaction.executedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    
    if (years < 0.1) return null // Need at least ~1 month

    return calculateCAGR(totalInvested, currentValue, years)
  }
}

export default portfolioService
