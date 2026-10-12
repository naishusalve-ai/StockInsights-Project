/**
 * Stock Data Service
 * 
 * Unified service for fetching real stock market data from multiple providers.
 * Supports Yahoo Finance, Alpha Vantage, and Finnhub with automatic fallback.
 * Implements caching, rate limiting, and retry logic.
 */

import { prisma } from "@/lib/db"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface OHLCVData {
  timestamp: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjustedClose?: number
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  marketCap?: number
  pe?: number
  eps?: number
  high52Week?: number
  low52Week?: number
  avgVolume?: number
  dividend?: number
  dividendYield?: number
  exchange: string
  currency: string
  timestamp: number
}

export interface StockSearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
  currency: string
}

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1wk' | '1mo'
export type DataRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'

// ==========================================
// CACHE CONFIGURATION
// ==========================================

const CACHE_DURATIONS = {
  quote: 60 * 1000,           // 1 minute for quotes
  intraday: 5 * 60 * 1000,    // 5 minutes for intraday
  daily: 60 * 60 * 1000,      // 1 hour for daily data
  weekly: 24 * 60 * 60 * 1000 // 24 hours for weekly/monthly
}

// In-memory cache for faster access
const memoryCache = new Map<string, { data: any; expiresAt: number }>()

// ==========================================
// RATE LIMITING
// ==========================================

interface RateLimitState {
  requests: number
  windowStart: number
}

const rateLimits: Record<string, RateLimitState> = {}

const RATE_LIMITS = {
  'yahoo': { requests: 100, windowMs: 60 * 1000 },
  'alphavantage': { requests: 5, windowMs: 60 * 1000 },
  'finnhub': { requests: 60, windowMs: 60 * 1000 }
}

function checkRateLimit(provider: string): boolean {
  const limit = RATE_LIMITS[provider as keyof typeof RATE_LIMITS]
  if (!limit) return true

  const now = Date.now()
  const state = rateLimits[provider] || { requests: 0, windowStart: now }

  if (now - state.windowStart > limit.windowMs) {
    rateLimits[provider] = { requests: 1, windowStart: now }
    return true
  }

  if (state.requests >= limit.requests) {
    return false
  }

  rateLimits[provider] = { requests: state.requests + 1, windowStart: state.windowStart }
  return true
}

// ==========================================
// RETRY LOGIC
// ==========================================

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
      }
    }
  }
  
  throw lastError
}

// ==========================================
// CACHE HELPERS
// ==========================================

function getCacheKey(symbol: string, dataType: string, interval?: string): string {
  return `${symbol}:${dataType}:${interval || 'default'}`
}

function getFromMemoryCache<T>(key: string): T | null {
  const cached = memoryCache.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T
  }
  memoryCache.delete(key)
  return null
}

function setMemoryCache<T>(key: string, data: T, ttlMs: number): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  })
}

async function getFromDbCache<T>(symbol: string, dataType: string, interval?: string): Promise<T | null> {
  try {
    const cached = await prisma.stockDataCache.findUnique({
      where: {
        symbol_dataType_interval: {
          symbol: symbol.toUpperCase(),
          dataType,
          interval: interval || 'default'
        }
      }
    })

    if (cached && cached.expiresAt > new Date()) {
      return cached.data as T
    }
    return null
  } catch {
    return null
  }
}

async function setDbCache<T>(symbol: string, dataType: string, data: T, ttlMs: number, interval?: string): Promise<void> {
  try {
    await prisma.stockDataCache.upsert({
      where: {
        symbol_dataType_interval: {
          symbol: symbol.toUpperCase(),
          dataType,
          interval: interval || 'default'
        }
      },
      update: {
        data: data as any,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + ttlMs)
      },
      create: {
        symbol: symbol.toUpperCase(),
        dataType,
        interval: interval || 'default',
        data: data as any,
        expiresAt: new Date(Date.now() + ttlMs)
      }
    })
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

// ==========================================
// YAHOO FINANCE API (Primary Provider)
// ==========================================

async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  if (!checkRateLimit('yahoo')) {
    throw new Error('Yahoo Finance rate limit exceeded')
  }

  // Handle Indian stocks (NSE/BSE)
  const formattedSymbol = formatSymbolForYahoo(symbol)
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?interval=1d&range=1d`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`)
  }

  const data = await response.json()
  const result = data.chart?.result?.[0]
  
  if (!result) {
    return null
  }

  const meta = result.meta
  const quote = result.indicators?.quote?.[0]
  
  return {
    symbol: symbol.toUpperCase(),
    name: meta.shortName || meta.symbol,
    price: meta.regularMarketPrice,
    change: meta.regularMarketPrice - meta.previousClose,
    changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
    open: quote?.open?.[0] || meta.regularMarketOpen || 0,
    high: quote?.high?.[0] || meta.regularMarketDayHigh || 0,
    low: quote?.low?.[0] || meta.regularMarketDayLow || 0,
    previousClose: meta.previousClose,
    volume: meta.regularMarketVolume || 0,
    high52Week: meta.fiftyTwoWeekHigh,
    low52Week: meta.fiftyTwoWeekLow,
    exchange: meta.exchangeName,
    currency: meta.currency,
    timestamp: Date.now()
  }
}

async function fetchYahooHistorical(
  symbol: string,
  interval: TimeInterval = '1d',
  range: DataRange = '1y'
): Promise<OHLCVData[]> {
  if (!checkRateLimit('yahoo')) {
    throw new Error('Yahoo Finance rate limit exceeded')
  }

  const formattedSymbol = formatSymbolForYahoo(symbol)
  const yahooInterval = convertToYahooInterval(interval)
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?interval=${yahooInterval}&range=${range}`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status}`)
  }

  const data = await response.json()
  const result = data.chart?.result?.[0]
  
  if (!result) {
    return []
  }

  const timestamps = result.timestamp || []
  const quote = result.indicators?.quote?.[0] || {}
  const adjClose = result.indicators?.adjclose?.[0]?.adjclose || []

  return timestamps.map((ts: number, i: number) => ({
    timestamp: ts * 1000,
    date: new Date(ts * 1000).toISOString().split('T')[0],
    open: quote.open?.[i] || 0,
    high: quote.high?.[i] || 0,
    low: quote.low?.[i] || 0,
    close: quote.close?.[i] || 0,
    volume: quote.volume?.[i] || 0,
    adjustedClose: adjClose[i] || quote.close?.[i] || 0
  })).filter((d: OHLCVData) => d.close > 0)
}

// ==========================================
// ALPHA VANTAGE API (Fallback Provider)
// ==========================================

async function fetchAlphaVantageQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured')
  }

  if (!checkRateLimit('alphavantage')) {
    throw new Error('Alpha Vantage rate limit exceeded')
  }

  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`)
  }

  const data = await response.json()
  const quote = data['Global Quote']
  
  if (!quote || Object.keys(quote).length === 0) {
    return null
  }

  const price = parseFloat(quote['05. price'])
  const previousClose = parseFloat(quote['08. previous close'])

  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price,
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent']?.replace('%', '')),
    open: parseFloat(quote['02. open']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    previousClose,
    volume: parseInt(quote['06. volume']),
    exchange: 'US',
    currency: 'USD',
    timestamp: Date.now()
  }
}

async function fetchAlphaVantageHistorical(
  symbol: string,
  interval: TimeInterval = '1d'
): Promise<OHLCVData[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured')
  }

  if (!checkRateLimit('alphavantage')) {
    throw new Error('Alpha Vantage rate limit exceeded')
  }

  const isIntraday = ['1m', '5m', '15m', '30m', '1h'].includes(interval)
  const fn = isIntraday ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY_ADJUSTED'
  
  let url = `https://www.alphavantage.co/query?function=${fn}&symbol=${symbol}&apikey=${apiKey}&outputsize=full`
  if (isIntraday) {
    url += `&interval=${interval}`
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Alpha Vantage API error: ${response.status}`)
  }

  const data = await response.json()
  const timeSeriesKey = Object.keys(data).find(k => k.includes('Time Series'))
  
  if (!timeSeriesKey) {
    return []
  }

  const timeSeries = data[timeSeriesKey]
  
  return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    timestamp: new Date(date).getTime(),
    date: date.split(' ')[0],
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'] || values['6. volume']),
    adjustedClose: parseFloat(values['5. adjusted close'] || values['4. close'])
  })).sort((a, b) => a.timestamp - b.timestamp)
}

// ==========================================
// FINNHUB API (Additional Provider)
// ==========================================

async function fetchFinnhubQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    throw new Error('Finnhub API key not configured')
  }

  if (!checkRateLimit('finnhub')) {
    throw new Error('Finnhub rate limit exceeded')
  }

  const [quoteRes, profileRes] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`),
    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`)
  ])

  if (!quoteRes.ok) {
    throw new Error(`Finnhub API error: ${quoteRes.status}`)
  }

  const quote = await quoteRes.json()
  const profile = profileRes.ok ? await profileRes.json() : {}

  if (!quote.c) {
    return null
  }

  return {
    symbol: symbol.toUpperCase(),
    name: profile.name || symbol.toUpperCase(),
    price: quote.c,
    change: quote.d || 0,
    changePercent: quote.dp || 0,
    open: quote.o,
    high: quote.h,
    low: quote.l,
    previousClose: quote.pc,
    volume: 0,
    marketCap: profile.marketCapitalization,
    exchange: profile.exchange || 'US',
    currency: profile.currency || 'USD',
    timestamp: Date.now()
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatSymbolForYahoo(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  
  // Check if it's an Indian stock
  if (isIndianStock(upperSymbol)) {
    // Try NSE first, then BSE
    if (!upperSymbol.includes('.NS') && !upperSymbol.includes('.BO')) {
      return `${upperSymbol}.NS`
    }
  }
  
  return upperSymbol
}

function isIndianStock(symbol: string): boolean {
  const indianSymbols = [
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'HINDUNILVR',
    'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'LT', 'AXISBANK',
    'WIPRO', 'ASIANPAINT', 'MARUTI', 'TITAN', 'ULTRACEMCO', 'NESTLEIND',
    'BAJFINANCE', 'HCLTECH', 'SUNPHARMA', 'POWERGRID', 'TATASTEEL',
    'NTPC', 'ONGC', 'TECHM', 'ADANIPORTS', 'TATAMOTORS', 'JSWSTEEL',
    'COALINDIA', 'DRREDDY', 'GRASIM', 'CIPLA', 'DIVISLAB', 'APOLLOHOSP',
    'HINDALCO', 'EICHERMOT', 'BRITANNIA', 'HEROMOTOCO', 'TATACONSUM',
    'UPL', 'BPCL', 'SHREECEM', 'SBILIFE', 'INDUSINDBK', 'BAJAJFINSV',
    'HDFCLIFE', 'ADANIENT', 'M&M'
  ]
  
  return indianSymbols.includes(symbol.replace('.NS', '').replace('.BO', ''))
}

function convertToYahooInterval(interval: TimeInterval): string {
  const mapping: Record<TimeInterval, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '30m': '30m',
    '1h': '60m',
    '4h': '60m', // Yahoo doesn't support 4h, use 1h
    '1d': '1d',
    '1wk': '1wk',
    '1mo': '1mo'
  }
  return mapping[interval] || '1d'
}

// ==========================================
// MAIN SERVICE EXPORTS
// ==========================================

export const stockDataService = {
  /**
   * Get real-time stock quote with caching
   */
  async getQuote(symbol: string, forceRefresh = false): Promise<StockQuote | null> {
    const cacheKey = getCacheKey(symbol, 'quote')
    
    // Check memory cache first
    if (!forceRefresh) {
      const memoryCached = getFromMemoryCache<StockQuote>(cacheKey)
      if (memoryCached) return memoryCached
      
      // Check database cache
      const dbCached = await getFromDbCache<StockQuote>(symbol, 'quote')
      if (dbCached) {
        setMemoryCache(cacheKey, dbCached, CACHE_DURATIONS.quote)
        return dbCached
      }
    }

    // Fetch from providers with fallback
    let quote: StockQuote | null = null
    
    try {
      quote = await fetchWithRetry(() => fetchYahooQuote(symbol))
    } catch (yahooError) {
      console.warn('Yahoo Finance failed:', yahooError)
      
      try {
        quote = await fetchWithRetry(() => fetchAlphaVantageQuote(symbol))
      } catch (avError) {
        console.warn('Alpha Vantage failed:', avError)
        
        try {
          quote = await fetchWithRetry(() => fetchFinnhubQuote(symbol))
        } catch (finnhubError) {
          console.error('All providers failed:', finnhubError)
          throw new Error('Unable to fetch stock data from any provider')
        }
      }
    }

    if (quote) {
      setMemoryCache(cacheKey, quote, CACHE_DURATIONS.quote)
      await setDbCache(symbol, 'quote', quote, CACHE_DURATIONS.quote)
    }

    return quote
  },

  /**
   * Get historical OHLCV data
   */
  async getHistorical(
    symbol: string,
    interval: TimeInterval = '1d',
    range: DataRange = '1y',
    forceRefresh = false
  ): Promise<OHLCVData[]> {
    const isIntraday = ['1m', '5m', '15m', '30m', '1h'].includes(interval)
    const dataType = isIntraday ? 'intraday' : 'daily'
    const cacheDuration = isIntraday ? CACHE_DURATIONS.intraday : CACHE_DURATIONS.daily
    const cacheKey = getCacheKey(symbol, dataType, `${interval}-${range}`)

    // Check caches
    if (!forceRefresh) {
      const memoryCached = getFromMemoryCache<OHLCVData[]>(cacheKey)
      if (memoryCached) return memoryCached

      const dbCached = await getFromDbCache<OHLCVData[]>(symbol, dataType, `${interval}-${range}`)
      if (dbCached) {
        setMemoryCache(cacheKey, dbCached, cacheDuration)
        return dbCached
      }
    }

    // Fetch from providers
    let data: OHLCVData[] = []

    try {
      data = await fetchWithRetry(() => fetchYahooHistorical(symbol, interval, range))
    } catch (yahooError) {
      console.warn('Yahoo Finance historical failed:', yahooError)
      
      try {
        data = await fetchWithRetry(() => fetchAlphaVantageHistorical(symbol, interval))
      } catch (avError) {
        console.error('All providers failed for historical:', avError)
        throw new Error('Unable to fetch historical data')
      }
    }

    if (data.length > 0) {
      setMemoryCache(cacheKey, data, cacheDuration)
      await setDbCache(symbol, dataType, data, cacheDuration, `${interval}-${range}`)
    }

    return data
  },

  /**
   * Get multiple quotes at once
   */
  async getBatchQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
    const quotes = new Map<string, StockQuote>()
    
    // Process in parallel with concurrency limit
    const batchSize = 5
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(symbol => this.getQuote(symbol))
      )
      
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          quotes.set(batch[idx], result.value)
        }
      })
    }

    return quotes
  },

  /**
   * Search for stocks
   */
  async search(query: string): Promise<StockSearchResult[]> {
    const apiKey = process.env.FINNHUB_API_KEY
    
    if (apiKey) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`
        )
        
        if (response.ok) {
          const data = await response.json()
          return (data.result || []).slice(0, 20).map((r: any) => ({
            symbol: r.symbol,
            name: r.description,
            type: r.type,
            exchange: r.exchange || 'Unknown',
            currency: 'USD'
          }))
        }
      } catch (error) {
        console.error('Search error:', error)
      }
    }

    // Fallback to static list for common stocks
    return getStaticStockList().filter(
      s => s.symbol.toLowerCase().includes(query.toLowerCase()) ||
           s.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20)
  },

  /**
   * Clear cache for a symbol
   */
  async clearCache(symbol?: string): Promise<void> {
    if (symbol) {
      // Clear memory cache
      for (const key of memoryCache.keys()) {
        if (key.startsWith(symbol.toUpperCase())) {
          memoryCache.delete(key)
        }
      }
      
      // Clear database cache
      await prisma.stockDataCache.deleteMany({
        where: { symbol: symbol.toUpperCase() }
      })
    } else {
      memoryCache.clear()
      await prisma.stockDataCache.deleteMany({})
    }
  }
}

// ==========================================
// STATIC STOCK LIST (Fallback)
// ==========================================

function getStaticStockList(): StockSearchResult[] {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Stock', exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Stock', exchange: 'NYSE', currency: 'USD' },
    { symbol: 'V', name: 'Visa Inc.', type: 'Stock', exchange: 'NYSE', currency: 'USD' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Stock', exchange: 'NYSE', currency: 'USD' },
    // Indian Stocks (NSE)
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'INFY.NS', name: 'Infosys Limited', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'ITC.NS', name: 'ITC Limited', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', type: 'Stock', exchange: 'NSE', currency: 'INR' },
    { symbol: 'WIPRO.NS', name: 'Wipro Limited', type: 'Stock', exchange: 'NSE', currency: 'INR' }
  ]
}
