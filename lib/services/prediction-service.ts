/**
 * AI Price Prediction Service
 * 
 * Implements realistic price prediction using:
 * - Linear Regression
 * - Moving Average Forecast
 * - Exponential Smoothing
 * - Prediction bands with confidence intervals
 * - Backtested accuracy metrics
 * 
 * DISCLAIMER: This is for educational purposes only. NOT investment advice.
 */

import { prisma } from "@/lib/db"
import { stockDataService, OHLCVData } from "./stock-data-service"
import { calculateSMA, calculateEMA } from "./technical-analysis-service"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PredictionResult {
  symbol: string
  currentPrice: number
  predictions: DailyPrediction[]
  summary: PredictionSummary
  methodology: string
  backtestAccuracy: number | null
  confidenceScore: number
  disclaimer: string
  generatedAt: number
}

export interface DailyPrediction {
  date: string
  predictedPrice: number
  upperBand: number
  lowerBand: number
  confidence: number
}

export interface PredictionSummary {
  shortTerm: {
    price: number
    change: number
    changePercent: number
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
  }
  mediumTerm: {
    price: number
    change: number
    changePercent: number
    direction: 'UP' | 'DOWN' | 'NEUTRAL'
  }
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

// ==========================================
// MATHEMATICAL UTILITIES
// ==========================================

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function variance(arr: number[]): number {
  const avg = mean(arr)
  return mean(arr.map(x => Math.pow(x - avg, 2)))
}

function standardDeviation(arr: number[]): number {
  return Math.sqrt(variance(arr))
}

function covariance(x: number[], y: number[]): number {
  const xMean = mean(x)
  const yMean = mean(y)
  let sum = 0
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - xMean) * (y[i] - yMean)
  }
  return sum / x.length
}

function correlation(x: number[], y: number[]): number {
  const stdX = standardDeviation(x)
  const stdY = standardDeviation(y)
  if (stdX === 0 || stdY === 0) return 0
  return covariance(x, y) / (stdX * stdY)
}

// ==========================================
// LINEAR REGRESSION
// ==========================================

interface LinearRegressionResult {
  slope: number
  intercept: number
  rSquared: number
  predictions: number[]
  standardError: number
}

function linearRegression(
  x: number[],
  y: number[],
  futureDays: number
): LinearRegressionResult {
  const n = x.length
  
  // Calculate means
  const xMean = mean(x)
  const yMean = mean(y)
  
  // Calculate slope (beta)
  let numerator = 0
  let denominator = 0
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean)
    denominator += Math.pow(x[i] - xMean, 2)
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean
  
  // Calculate R-squared
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept
    ssRes += Math.pow(y[i] - predicted, 2)
    ssTot += Math.pow(y[i] - yMean, 2)
  }
  const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0
  
  // Calculate standard error
  const standardError = Math.sqrt(ssRes / (n - 2))
  
  // Generate predictions
  const predictions: number[] = []
  const lastX = x[x.length - 1]
  for (let i = 1; i <= futureDays; i++) {
    const prediction = slope * (lastX + i) + intercept
    predictions.push(Math.max(0, prediction)) // Ensure non-negative
  }
  
  return { slope, intercept, rSquared, predictions, standardError }
}

// ==========================================
// EXPONENTIAL SMOOTHING (Holt-Winters)
// ==========================================

interface ExponentialSmoothingResult {
  predictions: number[]
  level: number
  trend: number
}

function holtWintersSmoothing(
  data: number[],
  alpha: number = 0.3,
  beta: number = 0.1,
  futureDays: number = 30
): ExponentialSmoothingResult {
  const n = data.length
  
  // Initialize level and trend
  let level = data[0]
  let trend = (data[n - 1] - data[0]) / (n - 1)
  
  // Apply double exponential smoothing
  for (let i = 1; i < n; i++) {
    const prevLevel = level
    level = alpha * data[i] + (1 - alpha) * (level + trend)
    trend = beta * (level - prevLevel) + (1 - beta) * trend
  }
  
  // Generate predictions
  const predictions: number[] = []
  for (let i = 1; i <= futureDays; i++) {
    const prediction = level + i * trend
    predictions.push(Math.max(0, prediction))
  }
  
  return { predictions, level, trend }
}

// ==========================================
// MOVING AVERAGE FORECAST
// ==========================================

function movingAverageForecast(
  data: number[],
  shortPeriod: number = 10,
  longPeriod: number = 50,
  futureDays: number = 30
): number[] {
  const shortMA = calculateSMA(data, shortPeriod)
  const longMA = calculateSMA(data, longPeriod)
  
  // Get latest valid values
  const latestShort = shortMA.filter(v => !isNaN(v)).pop() || data[data.length - 1]
  const latestLong = longMA.filter(v => !isNaN(v)).pop() || data[data.length - 1]
  const currentPrice = data[data.length - 1]
  
  // Determine trend direction
  const trend = latestShort > latestLong ? 1 : latestShort < latestLong ? -1 : 0
  
  // Calculate average daily change
  const recentData = data.slice(-20)
  const avgDailyChange = (recentData[recentData.length - 1] - recentData[0]) / recentData.length
  
  // Generate predictions with dampening factor
  const predictions: number[] = []
  let lastPrice = currentPrice
  
  for (let i = 1; i <= futureDays; i++) {
    // Dampening factor reduces prediction certainty over time
    const dampening = 1 / Math.pow(1.02, i)
    const change = avgDailyChange * trend * dampening
    lastPrice += change
    predictions.push(Math.max(0, lastPrice))
  }
  
  return predictions
}

// ==========================================
// ENSEMBLE PREDICTION
// ==========================================

function ensemblePrediction(
  predictions: number[][],
  weights: number[]
): number[] {
  const futureDays = predictions[0]?.length || 0
  const result: number[] = []
  
  for (let day = 0; day < futureDays; day++) {
    let weightedSum = 0
    let totalWeight = 0
    
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i]?.[day] !== undefined) {
        weightedSum += predictions[i][day] * weights[i]
        totalWeight += weights[i]
      }
    }
    
    result.push(totalWeight > 0 ? weightedSum / totalWeight : 0)
  }
  
  return result
}

// ==========================================
// CONFIDENCE & BANDS
// ==========================================

function calculateConfidenceBands(
  predictions: number[],
  historicalVolatility: number,
  baseConfidence: number
): { upper: number[]; lower: number[]; confidence: number[] } {
  const upper: number[] = []
  const lower: number[] = []
  const confidence: number[] = []
  
  for (let i = 0; i < predictions.length; i++) {
    // Confidence decreases over time
    const daysFactor = 1 + (i * 0.03) // 3% increase in uncertainty per day
    const adjustedVolatility = historicalVolatility * daysFactor
    
    // Calculate bands (using normal distribution approximation)
    const bandWidth = predictions[i] * adjustedVolatility * 1.96 // 95% confidence
    
    upper.push(predictions[i] + bandWidth)
    lower.push(Math.max(0, predictions[i] - bandWidth))
    
    // Confidence score (decreases over time)
    const dayConfidence = baseConfidence * Math.pow(0.97, i) // 3% decay per day
    confidence.push(Math.max(20, dayConfidence))
  }
  
  return { upper, lower, confidence }
}

// ==========================================
// BACKTESTING
// ==========================================

async function backtestPrediction(
  symbol: string,
  historicalData: OHLCVData[],
  days: number = 30
): Promise<number | null> {
  if (historicalData.length < 100) return null
  
  // Use last 30 days as test period
  const testPeriod = 30
  const trainingData = historicalData.slice(0, -testPeriod)
  const testData = historicalData.slice(-testPeriod)
  
  const closes = trainingData.map(d => d.close)
  const x = Array.from({ length: closes.length }, (_, i) => i)
  
  // Get predictions from training data
  const lr = linearRegression(x, closes, testPeriod)
  
  // Calculate accuracy (Mean Absolute Percentage Error)
  let totalError = 0
  for (let i = 0; i < Math.min(lr.predictions.length, testData.length); i++) {
    const actual = testData[i].close
    const predicted = lr.predictions[i]
    totalError += Math.abs((actual - predicted) / actual)
  }
  
  const mape = (totalError / testPeriod) * 100
  
  // Convert MAPE to accuracy score (inverted)
  const accuracy = Math.max(0, 100 - mape)
  
  return Math.round(accuracy * 10) / 10
}

// ==========================================
// MAIN PREDICTION SERVICE
// ==========================================

export const predictionService = {
  /**
   * Generate price predictions for a stock
   */
  async generatePrediction(
    symbol: string,
    horizon: number = 30
  ): Promise<PredictionResult> {
    // Fetch historical data
    const historicalData = await stockDataService.getHistorical(symbol, '1d', '1y')
    
    if (historicalData.length < 50) {
      throw new Error('Insufficient historical data for prediction')
    }
    
    const closes = historicalData.map(d => d.close)
    const currentPrice = closes[closes.length - 1]
    
    // Calculate historical volatility
    const returns = []
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1])
    }
    const dailyVolatility = standardDeviation(returns)
    const annualizedVolatility = dailyVolatility * Math.sqrt(252)
    
    // Generate predictions using multiple methods
    const x = Array.from({ length: closes.length }, (_, i) => i)
    
    // 1. Linear Regression
    const lrResult = linearRegression(x, closes, horizon)
    
    // 2. Exponential Smoothing
    const esResult = holtWintersSmoothing(closes, 0.3, 0.1, horizon)
    
    // 3. Moving Average Forecast
    const maResult = movingAverageForecast(closes, 10, 50, horizon)
    
    // Ensemble the predictions
    // Weight based on R-squared and recent performance
    const weights = [
      Math.max(0.1, lrResult.rSquared), // Linear regression weight
      0.4, // Exponential smoothing weight
      0.3  // Moving average weight
    ]
    
    const ensembled = ensemblePrediction(
      [lrResult.predictions, esResult.predictions, maResult],
      weights
    )
    
    // Calculate base confidence from R-squared
    const baseConfidence = 40 + (lrResult.rSquared * 40) // 40-80%
    
    // Calculate confidence bands
    const bands = calculateConfidenceBands(ensembled, dailyVolatility, baseConfidence)
    
    // Generate daily predictions
    const predictions: DailyPrediction[] = []
    const today = new Date()
    
    for (let i = 0; i < horizon; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i + 1)
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedPrice: Math.round(ensembled[i] * 100) / 100,
        upperBand: Math.round(bands.upper[i] * 100) / 100,
        lowerBand: Math.round(bands.lower[i] * 100) / 100,
        confidence: Math.round(bands.confidence[i])
      })
    }
    
    // Calculate summary
    const shortTermIdx = Math.min(6, horizon - 1) // 7 days
    const mediumTermIdx = horizon - 1
    
    const shortTermPrice = predictions[shortTermIdx].predictedPrice
    const shortTermChange = shortTermPrice - currentPrice
    const shortTermChangePercent = (shortTermChange / currentPrice) * 100
    
    const mediumTermPrice = predictions[mediumTermIdx].predictedPrice
    const mediumTermChange = mediumTermPrice - currentPrice
    const mediumTermChangePercent = (mediumTermChange / currentPrice) * 100
    
    const getDirection = (change: number): 'UP' | 'DOWN' | 'NEUTRAL' => {
      if (change > currentPrice * 0.02) return 'UP'
      if (change < -currentPrice * 0.02) return 'DOWN'
      return 'NEUTRAL'
    }
    
    const summary: PredictionSummary = {
      shortTerm: {
        price: shortTermPrice,
        change: shortTermChange,
        changePercent: shortTermChangePercent,
        direction: getDirection(shortTermChange)
      },
      mediumTerm: {
        price: mediumTermPrice,
        change: mediumTermChange,
        changePercent: mediumTermChangePercent,
        direction: getDirection(mediumTermChange)
      },
      overallSentiment: mediumTermChangePercent > 5 ? 'BULLISH' 
        : mediumTermChangePercent < -5 ? 'BEARISH' 
        : 'NEUTRAL'
    }
    
    // Backtest accuracy
    const backtestAccuracy = await backtestPrediction(symbol, historicalData, 30)
    
    // Overall confidence score
    const confidenceScore = Math.round(
      (baseConfidence * 0.4) + 
      ((backtestAccuracy || 50) * 0.4) + 
      ((1 - dailyVolatility * 10) * 20)
    )
    
    const result: PredictionResult = {
      symbol: symbol.toUpperCase(),
      currentPrice,
      predictions,
      summary,
      methodology: 'Ensemble model combining Linear Regression, Holt-Winters Exponential Smoothing, and Moving Average Analysis',
      backtestAccuracy,
      confidenceScore: Math.min(95, Math.max(20, confidenceScore)),
      disclaimer: `⚠️ IMPORTANT DISCLAIMER: This prediction is generated using statistical models for EDUCATIONAL and INFORMATIONAL purposes only. 
      
This is NOT investment advice. Stock prices are inherently unpredictable and past performance does not guarantee future results. 

As per SEBI (Securities and Exchange Board of India) guidelines:
- Always consult a qualified financial advisor before making investment decisions
- Investments in securities market are subject to market risks
- Read all scheme related documents carefully

The developers and platform are not responsible for any investment decisions made based on these predictions.`,
      generatedAt: Date.now()
    }
    
    // Store prediction in database
    await prisma.prediction.create({
      data: {
        symbol: symbol.toUpperCase(),
        predictedPrice: mediumTermPrice,
        upperBand: predictions[mediumTermIdx].upperBand,
        lowerBand: predictions[mediumTermIdx].lowerBand,
        confidence: confidenceScore,
        method: 'ensemble',
        horizon,
        backtestAccuracy: backtestAccuracy || undefined,
        disclaimer: result.disclaimer
      }
    })
    
    return result
  },
  
  /**
   * Get historical predictions and their accuracy
   */
  async getPredictionHistory(symbol: string, limit: number = 10) {
    return await prisma.prediction.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  },

  /**
   * Get the standard disclaimer for predictions
   */
  getDisclaimer(): string {
    return `⚠️ IMPORTANT DISCLAIMER

This is NOT investment advice. Stock prices are inherently unpredictable and past performance does not guarantee future results.

As per SEBI (Securities and Exchange Board of India) guidelines:
- Always consult a qualified financial advisor before making investment decisions
- Investments in securities market are subject to market risks
- Read all scheme related documents carefully

The developers and platform are not responsible for any investment decisions made based on these predictions.`
  }
}

export default predictionService
