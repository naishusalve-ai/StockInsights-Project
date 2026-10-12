/**
 * Technical Analysis Service
 * 
 * Implements 50+ technical indicators using real mathematical formulas.
 * All calculations are performed server-side for accuracy and caching.
 */

import { OHLCVData } from './stock-data-service'

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface IndicatorResult {
  name: string
  value: number | null
  signal?: 'BUY' | 'SELL' | 'NEUTRAL'
  interpretation?: string
}

export interface TechnicalIndicators {
  // Trend Indicators
  sma: Record<string, number[]>
  ema: Record<string, number[]>
  wma: Record<string, number[]>
  dema: Record<string, number[]>
  tema: Record<string, number[]>
  vwma: number[]
  
  // Momentum Indicators
  rsi: number[]
  stochastic: { k: number[]; d: number[] }
  stochasticRsi: { k: number[]; d: number[] }
  macd: { macd: number[]; signal: number[]; histogram: number[] }
  momentum: number[]
  roc: number[]
  williams: number[]
  cci: number[]
  adx: { adx: number[]; plusDi: number[]; minusDi: number[] }
  aroon: { up: number[]; down: number[]; oscillator: number[] }
  ultimateOscillator: number[]
  trix: number[]
  
  // Volatility Indicators
  bollingerBands: { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[]; percentB: number[] }
  atr: number[]
  keltnerChannels: { upper: number[]; middle: number[]; lower: number[] }
  donchianChannels: { upper: number[]; middle: number[]; lower: number[] }
  standardDeviation: number[]
  
  // Volume Indicators
  obv: number[]
  vwap: number[]
  mfi: number[]
  adLine: number[]
  cmf: number[]
  forceIndex: number[]
  eom: number[]
  
  // Other Indicators
  psar: number[]
  ichimoku: { tenkan: number[]; kijun: number[]; senkouA: number[]; senkouB: number[]; chikou: number[] }
  pivotPoints: { pivot: number; r1: number; r2: number; r3: number; s1: number; s2: number; s3: number }
  
  // Summary
  summary: {
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    momentum: 'STRONG' | 'WEAK' | 'NEUTRAL'
    volatility: 'HIGH' | 'LOW' | 'NORMAL'
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
    score: number // -100 to 100
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

function mean(arr: number[]): number {
  return arr.length > 0 ? sum(arr) / arr.length : 0
}

function standardDev(arr: number[]): number {
  const avg = mean(arr)
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2))
  return Math.sqrt(mean(squareDiffs))
}

function highest(arr: number[]): number {
  return Math.max(...arr)
}

function lowest(arr: number[]): number {
  return Math.min(...arr)
}

function change(current: number, previous: number): number {
  return current - previous
}

function gain(change: number): number {
  return change > 0 ? change : 0
}

function loss(change: number): number {
  return change < 0 ? Math.abs(change) : 0
}

function trueRange(high: number, low: number, prevClose: number): number {
  return Math.max(
    high - low,
    Math.abs(high - prevClose),
    Math.abs(low - prevClose)
  )
}

// ==========================================
// MOVING AVERAGES
// ==========================================

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      result.push(mean(slice))
    }
  }
  
  return result
}

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  
  // First EMA is SMA
  let ema = mean(data.slice(0, period))
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else if (i === period - 1) {
      result.push(ema)
    } else {
      ema = (data[i] - ema) * multiplier + ema
      result.push(ema)
    }
  }
  
  return result
}

export function calculateWMA(data: number[], period: number): number[] {
  const result: number[] = []
  const weights = Array.from({ length: period }, (_, i) => i + 1)
  const weightSum = sum(weights)
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const weighted = slice.reduce((acc, val, idx) => acc + val * weights[idx], 0)
      result.push(weighted / weightSum)
    }
  }
  
  return result
}

export function calculateDEMA(data: number[], period: number): number[] {
  const ema1 = calculateEMA(data, period)
  const ema2 = calculateEMA(ema1.filter(v => !isNaN(v)), period)
  
  const result: number[] = []
  const offset = period - 1
  
  for (let i = 0; i < data.length; i++) {
    if (i < 2 * offset) {
      result.push(NaN)
    } else {
      const idx = i - offset
      result.push(2 * ema1[i] - (ema2[idx] || NaN))
    }
  }
  
  return result
}

export function calculateTEMA(data: number[], period: number): number[] {
  const ema1 = calculateEMA(data, period)
  const ema2 = calculateEMA(ema1.filter(v => !isNaN(v)), period)
  const ema3 = calculateEMA(ema2.filter(v => !isNaN(v)), period)
  
  const result: number[] = []
  const offset = period - 1
  
  for (let i = 0; i < data.length; i++) {
    if (i < 3 * offset) {
      result.push(NaN)
    } else {
      const idx = i - offset
      const idx2 = i - 2 * offset
      result.push(3 * ema1[i] - 3 * (ema2[idx] || 0) + (ema3[idx2] || 0))
    }
  }
  
  return result
}

export function calculateVWMA(data: OHLCVData[], period: number): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const sumPV = slice.reduce((acc, d) => acc + d.close * d.volume, 0)
      const sumV = slice.reduce((acc, d) => acc + d.volume, 0)
      result.push(sumV > 0 ? sumPV / sumV : NaN)
    }
  }
  
  return result
}

// ==========================================
// MOMENTUM INDICATORS
// ==========================================

export function calculateRSI(data: number[], period: number = 14): number[] {
  const result: number[] = []
  const changes: number[] = []
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }
  
  // Calculate RSI
  let avgGain = 0
  let avgLoss = 0
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(NaN)
    } else if (i < period) {
      result.push(NaN)
    } else if (i === period) {
      // First RSI calculation uses simple average
      const gains = changes.slice(0, period).map(c => gain(c))
      const losses = changes.slice(0, period).map(c => loss(c))
      avgGain = mean(gains)
      avgLoss = mean(losses)
      
      if (avgLoss === 0) {
        result.push(100)
      } else {
        const rs = avgGain / avgLoss
        result.push(100 - (100 / (1 + rs)))
      }
    } else {
      // Subsequent calculations use smoothed average
      const currentChange = changes[i - 1]
      avgGain = ((avgGain * (period - 1)) + gain(currentChange)) / period
      avgLoss = ((avgLoss * (period - 1)) + loss(currentChange)) / period
      
      if (avgLoss === 0) {
        result.push(100)
      } else {
        const rs = avgGain / avgLoss
        result.push(100 - (100 / (1 + rs)))
      }
    }
  }
  
  return result
}

export function calculateStochastic(
  data: OHLCVData[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const kValues: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(NaN)
    } else {
      const slice = data.slice(i - kPeriod + 1, i + 1)
      const highestHigh = highest(slice.map(d => d.high))
      const lowestLow = lowest(slice.map(d => d.low))
      const currentClose = data[i].close
      
      if (highestHigh === lowestLow) {
        kValues.push(50)
      } else {
        kValues.push(((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100)
      }
    }
  }
  
  const dValues = calculateSMA(kValues.filter(v => !isNaN(v)), dPeriod)
  
  // Pad dValues to match length
  const paddedD: number[] = []
  let validCount = 0
  for (let i = 0; i < data.length; i++) {
    if (isNaN(kValues[i])) {
      paddedD.push(NaN)
    } else {
      paddedD.push(dValues[validCount] || NaN)
      validCount++
    }
  }
  
  return { k: kValues, d: paddedD }
}

export function calculateMACD(
  data: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)
  
  const macdLine: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN)
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }
  }
  
  const validMacd = macdLine.filter(v => !isNaN(v))
  const signalEMA = calculateEMA(validMacd, signalPeriod)
  
  const signal: number[] = []
  const histogram: number[] = []
  let validIdx = 0
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i])) {
      signal.push(NaN)
      histogram.push(NaN)
    } else {
      const sigVal = signalEMA[validIdx] || NaN
      signal.push(sigVal)
      histogram.push(isNaN(sigVal) ? NaN : macdLine[i] - sigVal)
      validIdx++
    }
  }
  
  return { macd: macdLine, signal, histogram }
}

export function calculateMomentum(data: number[], period: number = 10): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
    } else {
      result.push(data[i] - data[i - period])
    }
  }
  
  return result
}

export function calculateROC(data: number[], period: number = 10): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
    } else {
      result.push(((data[i] - data[i - period]) / data[i - period]) * 100)
    }
  }
  
  return result
}

export function calculateWilliamsR(data: OHLCVData[], period: number = 14): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const highestHigh = highest(slice.map(d => d.high))
      const lowestLow = lowest(slice.map(d => d.low))
      
      if (highestHigh === lowestLow) {
        result.push(-50)
      } else {
        result.push(((highestHigh - data[i].close) / (highestHigh - lowestLow)) * -100)
      }
    }
  }
  
  return result
}

export function calculateCCI(data: OHLCVData[], period: number = 20): number[] {
  const result: number[] = []
  const typicalPrices: number[] = data.map(d => (d.high + d.low + d.close) / 3)
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const slice = typicalPrices.slice(i - period + 1, i + 1)
      const sma = mean(slice)
      const meanDev = mean(slice.map(tp => Math.abs(tp - sma)))
      
      if (meanDev === 0) {
        result.push(0)
      } else {
        result.push((typicalPrices[i] - sma) / (0.015 * meanDev))
      }
    }
  }
  
  return result
}

export function calculateADX(
  data: OHLCVData[],
  period: number = 14
): { adx: number[]; plusDi: number[]; minusDi: number[] } {
  const tr: number[] = []
  const plusDM: number[] = []
  const minusDM: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      tr.push(data[i].high - data[i].low)
      plusDM.push(0)
      minusDM.push(0)
    } else {
      tr.push(trueRange(data[i].high, data[i].low, data[i - 1].close))
      
      const upMove = data[i].high - data[i - 1].high
      const downMove = data[i - 1].low - data[i].low
      
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0)
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0)
    }
  }
  
  const atr = calculateEMA(tr, period)
  const smoothedPlusDM = calculateEMA(plusDM, period)
  const smoothedMinusDM = calculateEMA(minusDM, period)
  
  const plusDI: number[] = []
  const minusDI: number[] = []
  const dx: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(atr[i]) || atr[i] === 0) {
      plusDI.push(NaN)
      minusDI.push(NaN)
      dx.push(NaN)
    } else {
      const pdi = (smoothedPlusDM[i] / atr[i]) * 100
      const mdi = (smoothedMinusDM[i] / atr[i]) * 100
      plusDI.push(pdi)
      minusDI.push(mdi)
      
      const sumDI = pdi + mdi
      dx.push(sumDI === 0 ? 0 : (Math.abs(pdi - mdi) / sumDI) * 100)
    }
  }
  
  const adx = calculateEMA(dx.filter(v => !isNaN(v)), period)
  
  // Pad ADX
  const paddedADX: number[] = []
  let validCount = 0
  for (let i = 0; i < data.length; i++) {
    if (isNaN(dx[i])) {
      paddedADX.push(NaN)
    } else {
      paddedADX.push(adx[validCount] || NaN)
      validCount++
    }
  }
  
  return { adx: paddedADX, plusDi: plusDI, minusDi: minusDI }
}

// ==========================================
// VOLATILITY INDICATORS
// ==========================================

export function calculateBollingerBands(
  data: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[]; bandwidth: number[]; percentB: number[] } {
  const middle = calculateSMA(data, period)
  const upper: number[] = []
  const lower: number[] = []
  const bandwidth: number[] = []
  const percentB: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
      bandwidth.push(NaN)
      percentB.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const std = standardDev(slice)
      const mid = middle[i]
      const up = mid + (stdDev * std)
      const low = mid - (stdDev * std)
      
      upper.push(up)
      lower.push(low)
      bandwidth.push(((up - low) / mid) * 100)
      percentB.push((data[i] - low) / (up - low))
    }
  }
  
  return { upper, middle, lower, bandwidth, percentB }
}

export function calculateATR(data: OHLCVData[], period: number = 14): number[] {
  const tr: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      tr.push(data[i].high - data[i].low)
    } else {
      tr.push(trueRange(data[i].high, data[i].low, data[i - 1].close))
    }
  }
  
  return calculateEMA(tr, period)
}

export function calculateKeltnerChannels(
  data: OHLCVData[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const closes = data.map(d => d.close)
  const middle = calculateEMA(closes, emaPeriod)
  const atr = calculateATR(data, atrPeriod)
  
  const upper: number[] = []
  const lower: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(middle[i]) || isNaN(atr[i])) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
      upper.push(middle[i] + (multiplier * atr[i]))
      lower.push(middle[i] - (multiplier * atr[i]))
    }
  }
  
  return { upper, middle, lower }
}

export function calculateDonchianChannels(
  data: OHLCVData[],
  period: number = 20
): { upper: number[]; middle: number[]; lower: number[] } {
  const upper: number[] = []
  const middle: number[] = []
  const lower: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      middle.push(NaN)
      lower.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const high = highest(slice.map(d => d.high))
      const low = lowest(slice.map(d => d.low))
      upper.push(high)
      lower.push(low)
      middle.push((high + low) / 2)
    }
  }
  
  return { upper, middle, lower }
}

// ==========================================
// VOLUME INDICATORS
// ==========================================

export function calculateOBV(data: OHLCVData[]): number[] {
  const result: number[] = []
  let obv = 0
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      obv = data[i].volume
    } else {
      if (data[i].close > data[i - 1].close) {
        obv += data[i].volume
      } else if (data[i].close < data[i - 1].close) {
        obv -= data[i].volume
      }
    }
    result.push(obv)
  }
  
  return result
}

export function calculateVWAP(data: OHLCVData[]): number[] {
  const result: number[] = []
  let cumulativeTPV = 0
  let cumulativeVolume = 0
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3
    cumulativeTPV += typicalPrice * data[i].volume
    cumulativeVolume += data[i].volume
    result.push(cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : NaN)
  }
  
  return result
}

export function calculateMFI(data: OHLCVData[], period: number = 14): number[] {
  const result: number[] = []
  const typicalPrices: number[] = []
  const moneyFlow: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    const tp = (data[i].high + data[i].low + data[i].close) / 3
    typicalPrices.push(tp)
    moneyFlow.push(tp * data[i].volume)
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
    } else {
      let positiveFlow = 0
      let negativeFlow = 0
      
      for (let j = i - period + 1; j <= i; j++) {
        if (typicalPrices[j] > typicalPrices[j - 1]) {
          positiveFlow += moneyFlow[j]
        } else {
          negativeFlow += moneyFlow[j]
        }
      }
      
      if (negativeFlow === 0) {
        result.push(100)
      } else {
        const mfRatio = positiveFlow / negativeFlow
        result.push(100 - (100 / (1 + mfRatio)))
      }
    }
  }
  
  return result
}

export function calculateCMF(data: OHLCVData[], period: number = 20): number[] {
  const result: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      let sumMFV = 0
      let sumVolume = 0
      
      for (let j = i - period + 1; j <= i; j++) {
        const range = data[j].high - data[j].low
        if (range > 0) {
          const mfMultiplier = ((data[j].close - data[j].low) - (data[j].high - data[j].close)) / range
          sumMFV += mfMultiplier * data[j].volume
        }
        sumVolume += data[j].volume
      }
      
      result.push(sumVolume > 0 ? sumMFV / sumVolume : 0)
    }
  }
  
  return result
}

// ==========================================
// MAIN ANALYSIS FUNCTION
// ==========================================

export function calculateAllIndicators(data: OHLCVData[]): TechnicalIndicators {
  const closes = data.map(d => d.close)
  
  // Moving Averages
  const sma = {
    '5': calculateSMA(closes, 5),
    '10': calculateSMA(closes, 10),
    '20': calculateSMA(closes, 20),
    '50': calculateSMA(closes, 50),
    '100': calculateSMA(closes, 100),
    '200': calculateSMA(closes, 200)
  }
  
  const ema = {
    '5': calculateEMA(closes, 5),
    '10': calculateEMA(closes, 10),
    '20': calculateEMA(closes, 20),
    '50': calculateEMA(closes, 50),
    '100': calculateEMA(closes, 100),
    '200': calculateEMA(closes, 200)
  }
  
  const wma = {
    '10': calculateWMA(closes, 10),
    '20': calculateWMA(closes, 20)
  }
  
  const dema = {
    '10': calculateDEMA(closes, 10),
    '20': calculateDEMA(closes, 20)
  }
  
  const tema = {
    '10': calculateTEMA(closes, 10),
    '20': calculateTEMA(closes, 20)
  }
  
  const vwma = calculateVWMA(data, 20)
  
  // Momentum
  const rsi = calculateRSI(closes, 14)
  const stochastic = calculateStochastic(data, 14, 3)
  const stochasticRsi = calculateStochastic(
    data.map((d, i) => ({ ...d, high: rsi[i] || 0, low: rsi[i] || 0, close: rsi[i] || 0 })),
    14,
    3
  )
  const macd = calculateMACD(closes, 12, 26, 9)
  const momentum = calculateMomentum(closes, 10)
  const roc = calculateROC(closes, 10)
  const williams = calculateWilliamsR(data, 14)
  const cci = calculateCCI(data, 20)
  const adx = calculateADX(data, 14)
  
  // Aroon
  const aroonUp: number[] = []
  const aroonDown: number[] = []
  const aroonOsc: number[] = []
  const aroonPeriod = 25
  
  for (let i = 0; i < data.length; i++) {
    if (i < aroonPeriod - 1) {
      aroonUp.push(NaN)
      aroonDown.push(NaN)
      aroonOsc.push(NaN)
    } else {
      const slice = data.slice(i - aroonPeriod + 1, i + 1)
      const highs = slice.map(d => d.high)
      const lows = slice.map(d => d.low)
      const daysSinceHigh = aroonPeriod - 1 - highs.indexOf(highest(highs))
      const daysSinceLow = aroonPeriod - 1 - lows.indexOf(lowest(lows))
      const up = ((aroonPeriod - daysSinceHigh) / aroonPeriod) * 100
      const down = ((aroonPeriod - daysSinceLow) / aroonPeriod) * 100
      aroonUp.push(up)
      aroonDown.push(down)
      aroonOsc.push(up - down)
    }
  }
  
  // Volatility
  const bollingerBands = calculateBollingerBands(closes, 20, 2)
  const atr = calculateATR(data, 14)
  const keltnerChannels = calculateKeltnerChannels(data, 20, 10, 2)
  const donchianChannels = calculateDonchianChannels(data, 20)
  const stdDev = closes.map((_, i) => {
    if (i < 19) return NaN
    return standardDev(closes.slice(i - 19, i + 1))
  })
  
  // Volume
  const obv = calculateOBV(data)
  const vwap = calculateVWAP(data)
  const mfi = calculateMFI(data, 14)
  const cmf = calculateCMF(data, 20)
  
  // A/D Line
  const adLine: number[] = []
  let adValue = 0
  for (const d of data) {
    const range = d.high - d.low
    if (range > 0) {
      const clv = ((d.close - d.low) - (d.high - d.close)) / range
      adValue += clv * d.volume
    }
    adLine.push(adValue)
  }
  
  // Force Index
  const forceIndex: number[] = [0]
  for (let i = 1; i < data.length; i++) {
    forceIndex.push((data[i].close - data[i - 1].close) * data[i].volume)
  }
  
  // Ease of Movement
  const eom: number[] = [0]
  for (let i = 1; i < data.length; i++) {
    const dm = ((data[i].high + data[i].low) / 2) - ((data[i - 1].high + data[i - 1].low) / 2)
    const br = (data[i].volume / 100000000) / (data[i].high - data[i].low)
    eom.push(br > 0 ? dm / br : 0)
  }
  
  // Parabolic SAR (simplified)
  const psar: number[] = []
  let sarUp = true
  let sar = data[0]?.low || 0
  let ep = data[0]?.high || 0
  let af = 0.02
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      psar.push(sar)
      continue
    }
    
    sar = sar + af * (ep - sar)
    
    if (sarUp) {
      if (data[i].low < sar) {
        sarUp = false
        sar = ep
        ep = data[i].low
        af = 0.02
      } else {
        if (data[i].high > ep) {
          ep = data[i].high
          af = Math.min(af + 0.02, 0.2)
        }
      }
    } else {
      if (data[i].high > sar) {
        sarUp = true
        sar = ep
        ep = data[i].high
        af = 0.02
      } else {
        if (data[i].low < ep) {
          ep = data[i].low
          af = Math.min(af + 0.02, 0.2)
        }
      }
    }
    
    psar.push(sar)
  }
  
  // Pivot Points (for latest day)
  const lastDay = data[data.length - 1]
  const pivot = (lastDay.high + lastDay.low + lastDay.close) / 3
  const pivotPoints = {
    pivot,
    r1: 2 * pivot - lastDay.low,
    r2: pivot + (lastDay.high - lastDay.low),
    r3: lastDay.high + 2 * (pivot - lastDay.low),
    s1: 2 * pivot - lastDay.high,
    s2: pivot - (lastDay.high - lastDay.low),
    s3: lastDay.low - 2 * (lastDay.high - pivot)
  }
  
  // Ichimoku (simplified)
  const tenkanPeriod = 9
  const kijunPeriod = 26
  const senkouBPeriod = 52
  
  const tenkan: number[] = []
  const kijun: number[] = []
  const senkouA: number[] = []
  const senkouB: number[] = []
  const chikou: number[] = []
  
  for (let i = 0; i < data.length; i++) {
    // Tenkan-sen
    if (i < tenkanPeriod - 1) {
      tenkan.push(NaN)
    } else {
      const slice = data.slice(i - tenkanPeriod + 1, i + 1)
      tenkan.push((highest(slice.map(d => d.high)) + lowest(slice.map(d => d.low))) / 2)
    }
    
    // Kijun-sen
    if (i < kijunPeriod - 1) {
      kijun.push(NaN)
    } else {
      const slice = data.slice(i - kijunPeriod + 1, i + 1)
      kijun.push((highest(slice.map(d => d.high)) + lowest(slice.map(d => d.low))) / 2)
    }
    
    // Senkou Span B
    if (i < senkouBPeriod - 1) {
      senkouB.push(NaN)
    } else {
      const slice = data.slice(i - senkouBPeriod + 1, i + 1)
      senkouB.push((highest(slice.map(d => d.high)) + lowest(slice.map(d => d.low))) / 2)
    }
    
    // Senkou Span A
    if (isNaN(tenkan[i]) || isNaN(kijun[i])) {
      senkouA.push(NaN)
    } else {
      senkouA.push((tenkan[i] + kijun[i]) / 2)
    }
    
    // Chikou Span
    chikou.push(data[i].close)
  }
  
  // Ultimate Oscillator
  const ultimateOscillator: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < 28) {
      ultimateOscillator.push(NaN)
    } else {
      let bp7 = 0, tr7 = 0, bp14 = 0, tr14 = 0, bp28 = 0, tr28 = 0
      
      for (let j = i - 6; j <= i; j++) {
        bp7 += data[j].close - Math.min(data[j].low, data[j - 1].close)
        tr7 += trueRange(data[j].high, data[j].low, data[j - 1].close)
      }
      for (let j = i - 13; j <= i; j++) {
        bp14 += data[j].close - Math.min(data[j].low, data[j - 1].close)
        tr14 += trueRange(data[j].high, data[j].low, data[j - 1].close)
      }
      for (let j = i - 27; j <= i; j++) {
        bp28 += data[j].close - Math.min(data[j].low, data[j - 1].close)
        tr28 += trueRange(data[j].high, data[j].low, data[j - 1].close)
      }
      
      const avg7 = tr7 > 0 ? bp7 / tr7 : 0
      const avg14 = tr14 > 0 ? bp14 / tr14 : 0
      const avg28 = tr28 > 0 ? bp28 / tr28 : 0
      
      ultimateOscillator.push(100 * ((4 * avg7) + (2 * avg14) + avg28) / 7)
    }
  }
  
  // TRIX
  const ema1 = calculateEMA(closes, 14)
  const ema2 = calculateEMA(ema1.filter(v => !isNaN(v)), 14)
  const ema3 = calculateEMA(ema2.filter(v => !isNaN(v)), 14)
  const trix: number[] = []
  for (let i = 0; i < ema3.length; i++) {
    if (i === 0) {
      trix.push(0)
    } else {
      trix.push(((ema3[i] - ema3[i - 1]) / ema3[i - 1]) * 10000)
    }
  }
  
  // Pad arrays to match data length
  const paddedTrix: number[] = Array(data.length - trix.length).fill(NaN).concat(trix)
  
  // Calculate Summary
  const summary = calculateSummary(data, {
    rsi: rsi[rsi.length - 1],
    macdHistogram: macd.histogram[macd.histogram.length - 1],
    stochK: stochastic.k[stochastic.k.length - 1],
    adx: adx.adx[adx.adx.length - 1],
    cci: cci[cci.length - 1],
    williams: williams[williams.length - 1],
    mfi: mfi[mfi.length - 1],
    sma20: sma['20'][sma['20'].length - 1],
    sma50: sma['50'][sma['50'].length - 1],
    sma200: sma['200'][sma['200'].length - 1],
    ema20: ema['20'][ema['20'].length - 1],
    bollingerPercentB: bollingerBands.percentB[bollingerBands.percentB.length - 1],
    currentPrice: closes[closes.length - 1]
  })
  
  return {
    sma,
    ema,
    wma,
    dema,
    tema,
    vwma,
    rsi,
    stochastic,
    stochasticRsi,
    macd,
    momentum,
    roc,
    williams,
    cci,
    adx,
    aroon: { up: aroonUp, down: aroonDown, oscillator: aroonOsc },
    ultimateOscillator,
    trix: paddedTrix,
    bollingerBands,
    atr,
    keltnerChannels,
    donchianChannels,
    standardDeviation: stdDev,
    obv,
    vwap,
    mfi,
    adLine,
    cmf,
    forceIndex,
    eom,
    psar,
    ichimoku: { tenkan, kijun, senkouA, senkouB, chikou },
    pivotPoints,
    summary
  }
}

function calculateSummary(
  data: OHLCVData[],
  indicators: {
    rsi: number
    macdHistogram: number
    stochK: number
    adx: number
    cci: number
    williams: number
    mfi: number
    sma20: number
    sma50: number
    sma200: number
    ema20: number
    bollingerPercentB: number
    currentPrice: number
  }
): TechnicalIndicators['summary'] {
  let buySignals = 0
  let sellSignals = 0
  const price = indicators.currentPrice
  
  // RSI
  if (indicators.rsi < 30) buySignals += 2
  else if (indicators.rsi > 70) sellSignals += 2
  else if (indicators.rsi < 40) buySignals++
  else if (indicators.rsi > 60) sellSignals++
  
  // MACD
  if (indicators.macdHistogram > 0) buySignals++
  else if (indicators.macdHistogram < 0) sellSignals++
  
  // Stochastic
  if (indicators.stochK < 20) buySignals += 2
  else if (indicators.stochK > 80) sellSignals += 2
  
  // CCI
  if (indicators.cci < -100) buySignals++
  else if (indicators.cci > 100) sellSignals++
  
  // Williams %R
  if (indicators.williams < -80) buySignals++
  else if (indicators.williams > -20) sellSignals++
  
  // MFI
  if (indicators.mfi < 20) buySignals++
  else if (indicators.mfi > 80) sellSignals++
  
  // Moving Averages
  if (price > indicators.sma20) buySignals++
  else sellSignals++
  
  if (price > indicators.sma50) buySignals++
  else sellSignals++
  
  if (price > indicators.sma200) buySignals += 2
  else sellSignals += 2
  
  if (price > indicators.ema20) buySignals++
  else sellSignals++
  
  // Bollinger %B
  if (indicators.bollingerPercentB < 0) buySignals++
  else if (indicators.bollingerPercentB > 1) sellSignals++
  
  // Calculate overall score
  const totalSignals = buySignals + sellSignals
  const score = totalSignals > 0 ? Math.round(((buySignals - sellSignals) / totalSignals) * 100) : 0
  
  // Determine trend
  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL'
  if (price > indicators.sma50 && price > indicators.sma200) trend = 'BULLISH'
  else if (price < indicators.sma50 && price < indicators.sma200) trend = 'BEARISH'
  
  // Determine momentum
  let momentum: 'STRONG' | 'WEAK' | 'NEUTRAL' = 'NEUTRAL'
  if (indicators.adx > 25) {
    momentum = indicators.rsi > 50 ? 'STRONG' : 'WEAK'
  }
  
  // Determine volatility
  let volatility: 'HIGH' | 'LOW' | 'NORMAL' = 'NORMAL'
  if (indicators.bollingerPercentB > 1 || indicators.bollingerPercentB < 0) volatility = 'HIGH'
  else if (indicators.bollingerPercentB > 0.3 && indicators.bollingerPercentB < 0.7) volatility = 'LOW'
  
  // Determine recommendation
  let recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' = 'HOLD'
  if (score >= 60) recommendation = 'STRONG_BUY'
  else if (score >= 30) recommendation = 'BUY'
  else if (score <= -60) recommendation = 'STRONG_SELL'
  else if (score <= -30) recommendation = 'SELL'
  
  return { trend, momentum, volatility, recommendation, score }
}

export const technicalAnalysisService = {
  calculateAllIndicators,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateStochastic,
  calculateADX,
  calculateOBV,
  calculateVWAP,
  calculateMFI
}
