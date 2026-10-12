/**
 * Strategy Backtesting Engine
 * 
 * Implements candle-level backtesting with:
 * - Rule-based strategy engine
 * - Entry/exit logic
 * - Transaction costs
 * - Performance metrics (Sharpe, Drawdown, Win Rate)
 * - Equity curve generation
 */

import { prisma } from "@/lib/db"
import { stockDataService, OHLCVData } from "./stock-data-service"
import { 
  calculateRSI, 
  calculateMACD, 
  calculateSMA, 
  calculateEMA,
  calculateBollingerBands,
  calculateATR
} from "./technical-analysis-service"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface StrategyConfig {
  name: string
  type: StrategyType
  parameters: Record<string, number>
  stopLoss?: number // Percentage
  takeProfit?: number // Percentage
  trailingStop?: number // Percentage
  positionSize?: number // Percentage of capital per trade
}

export type StrategyType = 
  | 'RSI_OVERSOLD'
  | 'MACD_CROSSOVER'
  | 'SMA_CROSSOVER'
  | 'EMA_CROSSOVER'
  | 'BOLLINGER_BOUNCE'
  | 'MEAN_REVERSION'
  | 'MOMENTUM'
  | 'CUSTOM'

export interface Trade {
  entryDate: string
  entryPrice: number
  exitDate: string | null
  exitPrice: number | null
  quantity: number
  side: 'LONG' | 'SHORT'
  pnl: number | null
  pnlPercent: number | null
  exitReason: 'SIGNAL' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'END_OF_PERIOD' | null
}

export interface BacktestMetrics {
  totalReturn: number
  totalReturnPercent: number
  annualizedReturn: number
  sharpeRatio: number | null
  sortinoRatio: number | null
  maxDrawdown: number
  maxDrawdownPercent: number
  winRate: number
  profitFactor: number
  averageWin: number
  averageLoss: number
  averageHoldingPeriod: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  largestWin: number
  largestLoss: number
  consecutiveWins: number
  consecutiveLosses: number
}

export interface BacktestResult {
  id: string
  symbol: string
  strategy: StrategyConfig
  startDate: string
  endDate: string
  initialCapital: number
  finalCapital: number
  metrics: BacktestMetrics
  trades: Trade[]
  equityCurve: { date: string; equity: number; drawdown: number }[]
  benchmarkReturn: number
  alpha: number
  createdAt: Date
}

// ==========================================
// STRATEGY SIGNALS
// ==========================================

interface Signal {
  date: string
  type: 'BUY' | 'SELL' | 'HOLD'
  price: number
  strength: number // 0-100
  reason: string
}

function generateRSIOversoldSignals(
  data: OHLCVData[],
  params: { period: number; oversold: number; overbought: number }
): Signal[] {
  const closes = data.map(d => d.close)
  const rsi = calculateRSI(closes, params.period)
  const signals: Signal[] = []
  
  let inPosition = false
  
  for (let i = params.period; i < data.length; i++) {
    const currentRSI = rsi[i]
    const prevRSI = rsi[i - 1]
    
    if (!inPosition && currentRSI < params.oversold && prevRSI >= params.oversold) {
      signals.push({
        date: data[i].date,
        type: 'BUY',
        price: data[i].close,
        strength: Math.min(100, (params.oversold - currentRSI) * 5),
        reason: `RSI crossed below ${params.oversold} (${currentRSI.toFixed(2)})`
      })
      inPosition = true
    } else if (inPosition && currentRSI > params.overbought && prevRSI <= params.overbought) {
      signals.push({
        date: data[i].date,
        type: 'SELL',
        price: data[i].close,
        strength: Math.min(100, (currentRSI - params.overbought) * 5),
        reason: `RSI crossed above ${params.overbought} (${currentRSI.toFixed(2)})`
      })
      inPosition = false
    } else {
      signals.push({
        date: data[i].date,
        type: 'HOLD',
        price: data[i].close,
        strength: 0,
        reason: ''
      })
    }
  }
  
  return signals
}

function generateMACDCrossoverSignals(
  data: OHLCVData[],
  params: { fastPeriod: number; slowPeriod: number; signalPeriod: number }
): Signal[] {
  const closes = data.map(d => d.close)
  const macd = calculateMACD(closes, params.fastPeriod, params.slowPeriod, params.signalPeriod)
  const signals: Signal[] = []
  
  let inPosition = false
  const startIdx = params.slowPeriod + params.signalPeriod
  
  for (let i = startIdx; i < data.length; i++) {
    const currentMACD = macd.macd[i]
    const currentSignal = macd.signal[i]
    const prevMACD = macd.macd[i - 1]
    const prevSignal = macd.signal[i - 1]
    
    if (isNaN(currentMACD) || isNaN(currentSignal)) continue
    
    // Bullish crossover
    if (!inPosition && currentMACD > currentSignal && prevMACD <= prevSignal) {
      signals.push({
        date: data[i].date,
        type: 'BUY',
        price: data[i].close,
        strength: Math.min(100, Math.abs(currentMACD - currentSignal) * 100),
        reason: 'MACD bullish crossover'
      })
      inPosition = true
    }
    // Bearish crossover
    else if (inPosition && currentMACD < currentSignal && prevMACD >= prevSignal) {
      signals.push({
        date: data[i].date,
        type: 'SELL',
        price: data[i].close,
        strength: Math.min(100, Math.abs(currentSignal - currentMACD) * 100),
        reason: 'MACD bearish crossover'
      })
      inPosition = false
    } else {
      signals.push({
        date: data[i].date,
        type: 'HOLD',
        price: data[i].close,
        strength: 0,
        reason: ''
      })
    }
  }
  
  return signals
}

function generateSMACrossoverSignals(
  data: OHLCVData[],
  params: { shortPeriod: number; longPeriod: number }
): Signal[] {
  const closes = data.map(d => d.close)
  const shortSMA = calculateSMA(closes, params.shortPeriod)
  const longSMA = calculateSMA(closes, params.longPeriod)
  const signals: Signal[] = []
  
  let inPosition = false
  
  for (let i = params.longPeriod; i < data.length; i++) {
    const shortCurrent = shortSMA[i]
    const longCurrent = longSMA[i]
    const shortPrev = shortSMA[i - 1]
    const longPrev = longSMA[i - 1]
    
    if (isNaN(shortCurrent) || isNaN(longCurrent)) continue
    
    // Golden cross (bullish)
    if (!inPosition && shortCurrent > longCurrent && shortPrev <= longPrev) {
      signals.push({
        date: data[i].date,
        type: 'BUY',
        price: data[i].close,
        strength: 80,
        reason: `Golden cross: SMA${params.shortPeriod} crossed above SMA${params.longPeriod}`
      })
      inPosition = true
    }
    // Death cross (bearish)
    else if (inPosition && shortCurrent < longCurrent && shortPrev >= longPrev) {
      signals.push({
        date: data[i].date,
        type: 'SELL',
        price: data[i].close,
        strength: 80,
        reason: `Death cross: SMA${params.shortPeriod} crossed below SMA${params.longPeriod}`
      })
      inPosition = false
    } else {
      signals.push({
        date: data[i].date,
        type: 'HOLD',
        price: data[i].close,
        strength: 0,
        reason: ''
      })
    }
  }
  
  return signals
}

function generateBollingerBounceSignals(
  data: OHLCVData[],
  params: { period: number; stdDev: number }
): Signal[] {
  const closes = data.map(d => d.close)
  const bb = calculateBollingerBands(closes, params.period, params.stdDev)
  const signals: Signal[] = []
  
  let inPosition = false
  
  for (let i = params.period; i < data.length; i++) {
    const price = data[i].close
    const upper = bb.upper[i]
    const lower = bb.lower[i]
    const middle = bb.middle[i]
    
    if (isNaN(upper) || isNaN(lower)) continue
    
    // Buy when price touches lower band
    if (!inPosition && price <= lower) {
      signals.push({
        date: data[i].date,
        type: 'BUY',
        price,
        strength: 70,
        reason: 'Price touched lower Bollinger Band'
      })
      inPosition = true
    }
    // Sell when price touches upper band or middle
    else if (inPosition && price >= upper) {
      signals.push({
        date: data[i].date,
        type: 'SELL',
        price,
        strength: 70,
        reason: 'Price touched upper Bollinger Band'
      })
      inPosition = false
    } else {
      signals.push({
        date: data[i].date,
        type: 'HOLD',
        price,
        strength: 0,
        reason: ''
      })
    }
  }
  
  return signals
}

function generateMomentumSignals(
  data: OHLCVData[],
  params: { lookback: number; threshold: number }
): Signal[] {
  const closes = data.map(d => d.close)
  const signals: Signal[] = []
  
  let inPosition = false
  
  for (let i = params.lookback; i < data.length; i++) {
    const momentum = ((closes[i] - closes[i - params.lookback]) / closes[i - params.lookback]) * 100
    
    // Buy on strong positive momentum
    if (!inPosition && momentum > params.threshold) {
      signals.push({
        date: data[i].date,
        type: 'BUY',
        price: data[i].close,
        strength: Math.min(100, momentum * 2),
        reason: `Strong momentum: ${momentum.toFixed(2)}%`
      })
      inPosition = true
    }
    // Sell on negative momentum
    else if (inPosition && momentum < -params.threshold / 2) {
      signals.push({
        date: data[i].date,
        type: 'SELL',
        price: data[i].close,
        strength: Math.min(100, Math.abs(momentum) * 2),
        reason: `Momentum reversal: ${momentum.toFixed(2)}%`
      })
      inPosition = false
    } else {
      signals.push({
        date: data[i].date,
        type: 'HOLD',
        price: data[i].close,
        strength: 0,
        reason: ''
      })
    }
  }
  
  return signals
}

// ==========================================
// BACKTESTING ENGINE
// ==========================================

function generateSignals(data: OHLCVData[], strategy: StrategyConfig): Signal[] {
  switch (strategy.type) {
    case 'RSI_OVERSOLD':
      return generateRSIOversoldSignals(data, {
        period: strategy.parameters.period || 14,
        oversold: strategy.parameters.oversold || 30,
        overbought: strategy.parameters.overbought || 70
      })
    
    case 'MACD_CROSSOVER':
      return generateMACDCrossoverSignals(data, {
        fastPeriod: strategy.parameters.fastPeriod || 12,
        slowPeriod: strategy.parameters.slowPeriod || 26,
        signalPeriod: strategy.parameters.signalPeriod || 9
      })
    
    case 'SMA_CROSSOVER':
      return generateSMACrossoverSignals(data, {
        shortPeriod: strategy.parameters.shortPeriod || 20,
        longPeriod: strategy.parameters.longPeriod || 50
      })
    
    case 'EMA_CROSSOVER':
      // Similar to SMA but using EMA
      return generateSMACrossoverSignals(data, {
        shortPeriod: strategy.parameters.shortPeriod || 12,
        longPeriod: strategy.parameters.longPeriod || 26
      })
    
    case 'BOLLINGER_BOUNCE':
      return generateBollingerBounceSignals(data, {
        period: strategy.parameters.period || 20,
        stdDev: strategy.parameters.stdDev || 2
      })
    
    case 'MOMENTUM':
      return generateMomentumSignals(data, {
        lookback: strategy.parameters.lookback || 10,
        threshold: strategy.parameters.threshold || 5
      })
    
    default:
      return []
  }
}

export async function runBacktest(
  symbol: string,
  strategy: StrategyConfig,
  startDate: Date,
  endDate: Date,
  initialCapital: number = 100000,
  transactionCost: number = 0.001 // 0.1% per trade
): Promise<BacktestResult> {
  // Fetch historical data
  const allData = await stockDataService.getHistorical(symbol, '1d', '5y')
  
  // Filter data by date range
  const data = allData.filter(d => {
    const date = new Date(d.date)
    return date >= startDate && date <= endDate
  })
  
  if (data.length < 50) {
    throw new Error('Insufficient data for backtesting')
  }
  
  // Generate signals
  const signals = generateSignals(data, strategy)
  
  // Initialize backtest state
  let capital = initialCapital
  let position = 0
  let entryPrice = 0
  let entryDate = ''
  let peakEquity = initialCapital
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  
  const trades: Trade[] = []
  const equityCurve: { date: string; equity: number; drawdown: number }[] = []
  const dailyReturns: number[] = []
  let previousEquity = initialCapital
  
  const positionSize = strategy.positionSize || 100 // Default 100% of capital
  const stopLoss = strategy.stopLoss || 0
  const takeProfit = strategy.takeProfit || 0
  const trailingStop = strategy.trailingStop || 0
  let trailingStopPrice = 0
  
  // Run backtest
  for (let i = 0; i < data.length; i++) {
    const candle = data[i]
    const signal = signals.find(s => s.date === candle.date)
    
    let equity = capital + (position * candle.close)
    
    // Check for stop loss / take profit / trailing stop
    if (position > 0) {
      const pnlPercent = ((candle.close - entryPrice) / entryPrice) * 100
      
      // Trailing stop update
      if (trailingStop > 0 && candle.high > trailingStopPrice / (1 - trailingStop / 100)) {
        trailingStopPrice = candle.high * (1 - trailingStop / 100)
      }
      
      // Stop loss hit
      if (stopLoss > 0 && pnlPercent <= -stopLoss) {
        const exitPrice = entryPrice * (1 - stopLoss / 100)
        const tradePnL = (exitPrice - entryPrice) * position - (position * exitPrice * transactionCost)
        
        trades.push({
          entryDate,
          entryPrice,
          exitDate: candle.date,
          exitPrice,
          quantity: position,
          side: 'LONG',
          pnl: tradePnL,
          pnlPercent: (tradePnL / (entryPrice * position)) * 100,
          exitReason: 'STOP_LOSS'
        })
        
        capital += position * exitPrice - (position * exitPrice * transactionCost)
        position = 0
        entryPrice = 0
      }
      // Take profit hit
      else if (takeProfit > 0 && pnlPercent >= takeProfit) {
        const exitPrice = entryPrice * (1 + takeProfit / 100)
        const tradePnL = (exitPrice - entryPrice) * position - (position * exitPrice * transactionCost)
        
        trades.push({
          entryDate,
          entryPrice,
          exitDate: candle.date,
          exitPrice,
          quantity: position,
          side: 'LONG',
          pnl: tradePnL,
          pnlPercent: (tradePnL / (entryPrice * position)) * 100,
          exitReason: 'TAKE_PROFIT'
        })
        
        capital += position * exitPrice - (position * exitPrice * transactionCost)
        position = 0
        entryPrice = 0
      }
      // Trailing stop hit
      else if (trailingStop > 0 && candle.low <= trailingStopPrice) {
        const exitPrice = trailingStopPrice
        const tradePnL = (exitPrice - entryPrice) * position - (position * exitPrice * transactionCost)
        
        trades.push({
          entryDate,
          entryPrice,
          exitDate: candle.date,
          exitPrice,
          quantity: position,
          side: 'LONG',
          pnl: tradePnL,
          pnlPercent: (tradePnL / (entryPrice * position)) * 100,
          exitReason: 'TRAILING_STOP'
        })
        
        capital += position * exitPrice - (position * exitPrice * transactionCost)
        position = 0
        entryPrice = 0
      }
    }
    
    // Process signals
    if (signal) {
      if (signal.type === 'BUY' && position === 0) {
        // Enter long position
        const investAmount = capital * (positionSize / 100)
        const shares = Math.floor(investAmount / candle.close)
        const cost = shares * candle.close * (1 + transactionCost)
        
        if (cost <= capital && shares > 0) {
          position = shares
          entryPrice = candle.close
          entryDate = candle.date
          capital -= cost
          trailingStopPrice = candle.close * (1 - (trailingStop || 10) / 100)
        }
      } else if (signal.type === 'SELL' && position > 0) {
        // Exit long position
        const exitPrice = candle.close
        const proceeds = position * exitPrice * (1 - transactionCost)
        const tradePnL = proceeds - (position * entryPrice)
        
        trades.push({
          entryDate,
          entryPrice,
          exitDate: candle.date,
          exitPrice,
          quantity: position,
          side: 'LONG',
          pnl: tradePnL,
          pnlPercent: (tradePnL / (position * entryPrice)) * 100,
          exitReason: 'SIGNAL'
        })
        
        capital += proceeds
        position = 0
        entryPrice = 0
      }
    }
    
    // Update equity curve
    equity = capital + (position * candle.close)
    
    // Track drawdown
    if (equity > peakEquity) {
      peakEquity = equity
    }
    const currentDrawdown = peakEquity - equity
    const currentDrawdownPercent = (currentDrawdown / peakEquity) * 100
    if (currentDrawdownPercent > maxDrawdownPercent) {
      maxDrawdown = currentDrawdown
      maxDrawdownPercent = currentDrawdownPercent
    }
    
    equityCurve.push({
      date: candle.date,
      equity,
      drawdown: currentDrawdownPercent
    })
    
    // Track daily returns
    if (previousEquity > 0) {
      dailyReturns.push((equity - previousEquity) / previousEquity)
    }
    previousEquity = equity
  }
  
  // Close any open position at end
  if (position > 0) {
    const lastCandle = data[data.length - 1]
    const exitPrice = lastCandle.close
    const proceeds = position * exitPrice * (1 - transactionCost)
    const tradePnL = proceeds - (position * entryPrice)
    
    trades.push({
      entryDate,
      entryPrice,
      exitDate: lastCandle.date,
      exitPrice,
      quantity: position,
      side: 'LONG',
      pnl: tradePnL,
      pnlPercent: (tradePnL / (position * entryPrice)) * 100,
      exitReason: 'END_OF_PERIOD'
    })
    
    capital += proceeds
  }
  
  const finalCapital = capital
  
  // Calculate metrics
  const totalReturn = finalCapital - initialCapital
  const totalReturnPercent = (totalReturn / initialCapital) * 100
  
  // Annualized return
  const days = (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) / (1000 * 60 * 60 * 24)
  const years = days / 365
  const annualizedReturn = years > 0 ? (Math.pow(finalCapital / initialCapital, 1 / years) - 1) * 100 : 0
  
  // Win/loss statistics
  const winningTrades = trades.filter(t => (t.pnl || 0) > 0)
  const losingTrades = trades.filter(t => (t.pnl || 0) <= 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0
  
  const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0
  
  const averageWin = winningTrades.length > 0 
    ? totalWins / winningTrades.length 
    : 0
  const averageLoss = losingTrades.length > 0 
    ? totalLosses / losingTrades.length 
    : 0
  
  // Sharpe ratio (assuming risk-free rate of 5%)
  const avgDailyReturn = dailyReturns.length > 0 
    ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length 
    : 0
  const stdDailyReturn = Math.sqrt(
    dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgDailyReturn, 2), 0) / dailyReturns.length
  )
  const riskFreeRate = 0.05 / 252 // Daily risk-free rate
  const sharpeRatio = stdDailyReturn > 0 
    ? ((avgDailyReturn - riskFreeRate) / stdDailyReturn) * Math.sqrt(252) 
    : null
  
  // Sortino ratio (only downside deviation)
  const negativeReturns = dailyReturns.filter(r => r < 0)
  const downsideDeviation = Math.sqrt(
    negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / (negativeReturns.length || 1)
  )
  const sortinoRatio = downsideDeviation > 0 
    ? ((avgDailyReturn - riskFreeRate) / downsideDeviation) * Math.sqrt(252) 
    : null
  
  // Calculate benchmark return (buy and hold)
  const benchmarkReturn = ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
  
  // Alpha (excess return over benchmark)
  const alpha = totalReturnPercent - benchmarkReturn
  
  // Consecutive wins/losses
  let maxConsecutiveWins = 0
  let maxConsecutiveLosses = 0
  let currentWinStreak = 0
  let currentLossStreak = 0
  
  for (const trade of trades) {
    if ((trade.pnl || 0) > 0) {
      currentWinStreak++
      currentLossStreak = 0
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak)
    } else {
      currentLossStreak++
      currentWinStreak = 0
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak)
    }
  }
  
  // Average holding period
  let totalHoldingDays = 0
  for (const trade of trades) {
    if (trade.entryDate && trade.exitDate) {
      const entry = new Date(trade.entryDate)
      const exit = new Date(trade.exitDate)
      totalHoldingDays += (exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)
    }
  }
  const averageHoldingPeriod = trades.length > 0 ? totalHoldingDays / trades.length : 0
  
  const metrics: BacktestMetrics = {
    totalReturn,
    totalReturnPercent,
    annualizedReturn,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    maxDrawdownPercent,
    winRate,
    profitFactor,
    averageWin,
    averageLoss,
    averageHoldingPeriod,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses
  }
  
  // Save to database
  const saved = await prisma.backtestResult.create({
    data: {
      strategyName: strategy.name,
      strategyConfig: strategy as any,
      symbol: symbol.toUpperCase(),
      startDate,
      endDate,
      initialCapital,
      finalCapital,
      totalReturn: totalReturnPercent,
      annualizedReturn,
      sharpeRatio: sharpeRatio || 0,
      maxDrawdown: maxDrawdownPercent,
      winRate,
      totalTrades: trades.length,
      profitableTrades: winningTrades.length,
      trades: trades as any,
      equityCurve: equityCurve as any
    }
  })
  
  return {
    id: saved.id,
    symbol: symbol.toUpperCase(),
    strategy,
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
    initialCapital,
    finalCapital,
    metrics,
    trades,
    equityCurve,
    benchmarkReturn,
    alpha,
    createdAt: saved.createdAt
  }
}

export const backtestingService = {
  runBacktest,
  
  async getBacktestHistory(userId?: string, limit: number = 20) {
    return await prisma.backtestResult.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  },
  
  async getBacktestById(id: string) {
    return await prisma.backtestResult.findUnique({
      where: { id }
    })
  },
  
  getAvailableStrategies(): StrategyConfig[] {
    return [
      {
        name: 'RSI Oversold Strategy',
        type: 'RSI_OVERSOLD',
        parameters: { period: 14, oversold: 30, overbought: 70 },
        stopLoss: 5,
        takeProfit: 15
      },
      {
        name: 'MACD Crossover Strategy',
        type: 'MACD_CROSSOVER',
        parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        stopLoss: 3,
        trailingStop: 5
      },
      {
        name: 'Golden Cross Strategy',
        type: 'SMA_CROSSOVER',
        parameters: { shortPeriod: 50, longPeriod: 200 },
        stopLoss: 8
      },
      {
        name: 'Bollinger Bounce Strategy',
        type: 'BOLLINGER_BOUNCE',
        parameters: { period: 20, stdDev: 2 },
        stopLoss: 3,
        takeProfit: 5
      },
      {
        name: 'Momentum Strategy',
        type: 'MOMENTUM',
        parameters: { lookback: 20, threshold: 10 },
        stopLoss: 5,
        trailingStop: 3
      }
    ]
  }
}

export default backtestingService
