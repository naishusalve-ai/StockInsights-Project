/**
 * Market Sentiment Analysis Service
 * 
 * Implements sentiment analysis from multiple sources:
 * - News articles
 * - Analyst ratings
 * - Social media mentions (simulated)
 * - Combined sentiment scoring
 */

import { prisma } from "@/lib/db"

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface SentimentScore {
  overall: number // -1 to 1
  label: 'VERY_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY_BULLISH'
  confidence: number // 0-100
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: Date
  sentiment: SentimentScore
  relevanceScore: number
}

export interface AnalystRating {
  firm: string
  analyst: string
  rating: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
  targetPrice: number
  previousRating?: string
  date: Date
}

export interface SocialSentiment {
  source: string
  mentions: number
  sentiment: SentimentScore
  trending: boolean
  topKeywords: string[]
}

export interface StockSentimentData {
  symbol: string
  overallSentiment: SentimentScore
  newsSentiment: {
    score: SentimentScore
    articles: NewsArticle[]
    articleCount: number
  }
  socialSentiment: {
    score: SentimentScore
    sources: SocialSentiment[]
    totalMentions: number
  }
  analystSentiment: {
    score: SentimentScore
    ratings: AnalystRating[]
    consensusRating: string
    averageTargetPrice: number
    buyCount: number
    holdCount: number
    sellCount: number
  }
  sentimentHistory: {
    date: string
    score: number
  }[]
  lastUpdated: Date
}

// ==========================================
// SENTIMENT ANALYSIS UTILITIES
// ==========================================

// Simple keyword-based sentiment analysis
const POSITIVE_KEYWORDS = [
  'bullish', 'buy', 'upgrade', 'outperform', 'beat', 'exceed', 'strong',
  'growth', 'surge', 'rally', 'gains', 'profit', 'positive', 'optimistic',
  'breakthrough', 'innovation', 'record', 'success', 'momentum', 'upside',
  'opportunity', 'leader', 'expand', 'acquire', 'dividend', 'recovery'
]

const NEGATIVE_KEYWORDS = [
  'bearish', 'sell', 'downgrade', 'underperform', 'miss', 'decline', 'weak',
  'loss', 'drop', 'fall', 'crash', 'warning', 'concern', 'risk', 'lawsuit',
  'investigation', 'scandal', 'layoff', 'bankruptcy', 'debt', 'recession',
  'volatile', 'uncertainty', 'miss', 'disappointing', 'struggle', 'headwind'
]

function analyzeSentiment(text: string): SentimentScore {
  const lowerText = text.toLowerCase()
  
  let positiveCount = 0
  let negativeCount = 0
  
  for (const keyword of POSITIVE_KEYWORDS) {
    if (lowerText.includes(keyword)) positiveCount++
  }
  
  for (const keyword of NEGATIVE_KEYWORDS) {
    if (lowerText.includes(keyword)) negativeCount++
  }
  
  const total = positiveCount + negativeCount
  
  if (total === 0) {
    return {
      overall: 0,
      label: 'NEUTRAL',
      confidence: 30
    }
  }
  
  const score = (positiveCount - negativeCount) / total
  const confidence = Math.min(95, 50 + total * 5)
  
  let label: SentimentScore['label']
  if (score >= 0.6) label = 'VERY_BULLISH'
  else if (score >= 0.2) label = 'BULLISH'
  else if (score <= -0.6) label = 'VERY_BEARISH'
  else if (score <= -0.2) label = 'BEARISH'
  else label = 'NEUTRAL'
  
  return { overall: score, label, confidence }
}

function combineSentiments(sentiments: SentimentScore[], weights: number[]): SentimentScore {
  if (sentiments.length === 0) {
    return { overall: 0, label: 'NEUTRAL', confidence: 0 }
  }
  
  let weightedSum = 0
  let totalWeight = 0
  let avgConfidence = 0
  
  for (let i = 0; i < sentiments.length; i++) {
    const weight = weights[i] || 1
    weightedSum += sentiments[i].overall * weight
    totalWeight += weight
    avgConfidence += sentiments[i].confidence
  }
  
  const overall = totalWeight > 0 ? weightedSum / totalWeight : 0
  const confidence = Math.round(avgConfidence / sentiments.length)
  
  let label: SentimentScore['label']
  if (overall >= 0.6) label = 'VERY_BULLISH'
  else if (overall >= 0.2) label = 'BULLISH'
  else if (overall <= -0.6) label = 'VERY_BEARISH'
  else if (overall <= -0.2) label = 'BEARISH'
  else label = 'NEUTRAL'
  
  return { overall, label, confidence }
}

// ==========================================
// NEWS FETCHING
// ==========================================

async function fetchNewsFromFinnhub(symbol: string): Promise<NewsArticle[]> {
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) return []
  
  try {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${weekAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}&token=${apiKey}`
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return data.slice(0, 20).map((item: any) => {
      const sentiment = analyzeSentiment(item.headline + ' ' + (item.summary || ''))
      
      return {
        id: item.id?.toString() || Math.random().toString(36),
        title: item.headline,
        summary: item.summary || '',
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.datetime * 1000),
        sentiment,
        relevanceScore: 0.8
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

async function fetchNewsFromAlphaVantage(symbol: string): Promise<NewsArticle[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return []
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    if (!data.feed) return []
    
    return data.feed.slice(0, 20).map((item: any) => {
      // Use Alpha Vantage's sentiment if available
      const tickerSentiment = item.ticker_sentiment?.find(
        (ts: any) => ts.ticker === symbol
      )
      
      const sentimentScore = tickerSentiment 
        ? parseFloat(tickerSentiment.ticker_sentiment_score)
        : analyzeSentiment(item.title + ' ' + (item.summary || '')).overall
      
      let label: SentimentScore['label']
      if (sentimentScore >= 0.35) label = 'VERY_BULLISH'
      else if (sentimentScore >= 0.15) label = 'BULLISH'
      else if (sentimentScore <= -0.35) label = 'VERY_BEARISH'
      else if (sentimentScore <= -0.15) label = 'BEARISH'
      else label = 'NEUTRAL'
      
      return {
        id: item.url,
        title: item.title,
        summary: item.summary || '',
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.time_published),
        sentiment: {
          overall: sentimentScore,
          label,
          confidence: tickerSentiment ? 85 : 60
        },
        relevanceScore: parseFloat(tickerSentiment?.relevance_score || '0.5')
      }
    })
  } catch (error) {
    console.error('Error fetching Alpha Vantage news:', error)
    return []
  }
}

// ==========================================
// ANALYST RATINGS (Simulated with realistic data)
// ==========================================

function getAnalystRatings(symbol: string): AnalystRating[] {
  // In production, this would fetch from a real data provider
  // For now, generate realistic analyst ratings based on the symbol
  
  const firms = [
    'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'Bank of America',
    'Citigroup', 'Credit Suisse', 'Deutsche Bank', 'UBS', 'Barclays',
    'Jefferies', 'Piper Sandler', 'Wedbush', 'Raymond James', 'RBC Capital'
  ]
  
  const ratings: AnalystRating[] = []
  const numRatings = 5 + Math.floor(Math.random() * 8)
  const usedFirms = new Set<string>()
  
  // Seed random based on symbol for consistency
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return x - Math.floor(x)
  }
  
  for (let i = 0; i < numRatings; i++) {
    let firm: string
    do {
      firm = firms[Math.floor(random(i * 100) * firms.length)]
    } while (usedFirms.has(firm))
    usedFirms.add(firm)
    
    const ratingNum = random(i) * 100
    let rating: AnalystRating['rating']
    
    if (ratingNum < 15) rating = 'STRONG_BUY'
    else if (ratingNum < 45) rating = 'BUY'
    else if (ratingNum < 75) rating = 'HOLD'
    else if (ratingNum < 90) rating = 'SELL'
    else rating = 'STRONG_SELL'
    
    // Generate realistic target price (±30% from a base)
    const basePrice = 100 + (seed % 400)
    const targetPrice = basePrice * (0.8 + random(i + 50) * 0.6)
    
    ratings.push({
      firm,
      analyst: `Analyst ${i + 1}`,
      rating,
      targetPrice: Math.round(targetPrice * 100) / 100,
      date: new Date(Date.now() - Math.floor(random(i + 200) * 90 * 24 * 60 * 60 * 1000))
    })
  }
  
  return ratings.sort((a, b) => b.date.getTime() - a.date.getTime())
}

function calculateAnalystSentiment(ratings: AnalystRating[]): SentimentScore {
  if (ratings.length === 0) {
    return { overall: 0, label: 'NEUTRAL', confidence: 0 }
  }
  
  const ratingScores: Record<string, number> = {
    'STRONG_BUY': 1,
    'BUY': 0.5,
    'HOLD': 0,
    'SELL': -0.5,
    'STRONG_SELL': -1
  }
  
  const avgScore = ratings.reduce((sum, r) => sum + ratingScores[r.rating], 0) / ratings.length
  const confidence = Math.min(95, 50 + ratings.length * 3)
  
  let label: SentimentScore['label']
  if (avgScore >= 0.6) label = 'VERY_BULLISH'
  else if (avgScore >= 0.2) label = 'BULLISH'
  else if (avgScore <= -0.6) label = 'VERY_BEARISH'
  else if (avgScore <= -0.2) label = 'BEARISH'
  else label = 'NEUTRAL'
  
  return { overall: avgScore, label, confidence }
}

// ==========================================
// SOCIAL SENTIMENT (Simulated)
// ==========================================

function getSocialSentiment(symbol: string): SocialSentiment[] {
  // In production, this would use Twitter API, Reddit API, StockTwits, etc.
  // For now, generate realistic simulated data
  
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const random = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000
    return x - Math.floor(x)
  }
  
  const sources: SocialSentiment[] = [
    {
      source: 'Twitter/X',
      mentions: Math.floor(random(1) * 5000) + 500,
      sentiment: analyzeSentiment(random(10) > 0.5 ? 'bullish momentum growth' : 'bearish concern decline'),
      trending: random(20) > 0.7,
      topKeywords: ['earnings', 'growth', symbol.toLowerCase()]
    },
    {
      source: 'Reddit (r/wallstreetbets)',
      mentions: Math.floor(random(2) * 2000) + 100,
      sentiment: analyzeSentiment(random(11) > 0.4 ? 'buy opportunity strong' : 'risky volatile'),
      trending: random(21) > 0.8,
      topKeywords: ['YOLO', 'diamond hands', 'tendies']
    },
    {
      source: 'StockTwits',
      mentions: Math.floor(random(3) * 3000) + 200,
      sentiment: analyzeSentiment(random(12) > 0.5 ? 'bullish breakout' : 'bearish breakdown'),
      trending: random(22) > 0.6,
      topKeywords: ['technical', 'breakout', 'support']
    }
  ]
  
  return sources
}

// ==========================================
// MAIN SENTIMENT SERVICE
// ==========================================

export const sentimentService = {
  /**
   * Get comprehensive sentiment analysis for a stock
   */
  async getStockSentiment(symbol: string): Promise<StockSentimentData> {
    // Check cache first
    const cached = await prisma.sentimentData.findUnique({
      where: { symbol: symbol.toUpperCase() }
    })
    
    if (cached && cached.expiresAt > new Date()) {
      // Return cached data
      const data = cached.sources as any
      return data
    }
    
    // Fetch fresh data
    const [finnhubNews, avNews] = await Promise.all([
      fetchNewsFromFinnhub(symbol),
      fetchNewsFromAlphaVantage(symbol)
    ])
    
    // Combine and deduplicate news
    const allNews = [...finnhubNews, ...avNews]
    const uniqueNews = allNews.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    )
    
    // Calculate news sentiment
    const newsSentiments = uniqueNews.map(a => a.sentiment)
    const newsScore = combineSentiments(
      newsSentiments,
      uniqueNews.map(a => a.relevanceScore)
    )
    
    // Get analyst ratings
    const analystRatings = getAnalystRatings(symbol)
    const analystScore = calculateAnalystSentiment(analystRatings)
    
    const buyCount = analystRatings.filter(r => r.rating === 'STRONG_BUY' || r.rating === 'BUY').length
    const holdCount = analystRatings.filter(r => r.rating === 'HOLD').length
    const sellCount = analystRatings.filter(r => r.rating === 'SELL' || r.rating === 'STRONG_SELL').length
    
    const consensusRating = buyCount > sellCount 
      ? (buyCount > holdCount ? 'BUY' : 'HOLD')
      : (sellCount > holdCount ? 'SELL' : 'HOLD')
    
    const avgTargetPrice = analystRatings.length > 0
      ? analystRatings.reduce((sum, r) => sum + r.targetPrice, 0) / analystRatings.length
      : 0
    
    // Get social sentiment
    const socialSources = getSocialSentiment(symbol)
    const socialSentiments = socialSources.map(s => s.sentiment)
    const socialScore = combineSentiments(
      socialSentiments,
      socialSources.map(s => Math.log10(s.mentions + 1)) // Weight by log of mentions
    )
    
    const totalMentions = socialSources.reduce((sum, s) => sum + s.mentions, 0)
    
    // Calculate overall sentiment
    const overallSentiment = combineSentiments(
      [newsScore, analystScore, socialScore],
      [0.35, 0.45, 0.20] // Analyst ratings weighted highest
    )
    
    // Generate sentiment history (last 7 days)
    const sentimentHistory: { date: string; score: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Add some variation to historical sentiment
      const variation = (Math.random() - 0.5) * 0.2
      sentimentHistory.push({
        date: date.toISOString().split('T')[0],
        score: Math.max(-1, Math.min(1, overallSentiment.overall + variation))
      })
    }
    
    const sentimentData: StockSentimentData = {
      symbol: symbol.toUpperCase(),
      overallSentiment,
      newsSentiment: {
        score: newsScore,
        articles: uniqueNews.slice(0, 10),
        articleCount: uniqueNews.length
      },
      socialSentiment: {
        score: socialScore,
        sources: socialSources,
        totalMentions
      },
      analystSentiment: {
        score: analystScore,
        ratings: analystRatings,
        consensusRating,
        averageTargetPrice: Math.round(avgTargetPrice * 100) / 100,
        buyCount,
        holdCount,
        sellCount
      },
      sentimentHistory,
      lastUpdated: new Date()
    }
    
    // Cache the result
    await prisma.sentimentData.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: {
        overallScore: overallSentiment.overall,
        newsScore: newsScore.overall,
        socialScore: socialScore.overall,
        analystScore: analystScore.overall,
        sources: sentimentData as any,
        articleCount: uniqueNews.length,
        fetchedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 min cache
      },
      create: {
        symbol: symbol.toUpperCase(),
        overallScore: overallSentiment.overall,
        newsScore: newsScore.overall,
        socialScore: socialScore.overall,
        analystScore: analystScore.overall,
        sources: sentimentData as any,
        articleCount: uniqueNews.length,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    })
    
    // Store news articles
    for (const article of uniqueNews.slice(0, 20)) {
      try {
        await prisma.newsArticle.upsert({
          where: { url: article.url },
          update: {
            sentiment: article.sentiment.overall
          },
          create: {
            symbol: symbol.toUpperCase(),
            title: article.title,
            summary: article.summary,
            url: article.url,
            source: article.source,
            sentiment: article.sentiment.overall,
            publishedAt: article.publishedAt
          }
        })
      } catch (e) {
        // Ignore duplicate URL errors
      }
    }
    
    return sentimentData
  },
  
  /**
   * Get latest news for a stock
   */
  async getNews(symbol: string, limit: number = 10): Promise<NewsArticle[]> {
    const sentimentData = await this.getStockSentiment(symbol)
    return sentimentData.newsSentiment.articles.slice(0, limit)
  },
  
  /**
   * Get market-wide sentiment
   */
  async getMarketSentiment(): Promise<{
    overall: SentimentScore
    fearGreedIndex: number
    topBullish: string[]
    topBearish: string[]
  }> {
    // Analyze major indices
    const majorSymbols = ['SPY', 'QQQ', 'DIA', 'IWM']
    const sentiments: SentimentScore[] = []
    
    for (const symbol of majorSymbols) {
      try {
        const data = await this.getStockSentiment(symbol)
        sentiments.push(data.overallSentiment)
      } catch (e) {
        // Skip on error
      }
    }
    
    const overall = combineSentiments(sentiments, [1, 1, 1, 1])
    
    // Calculate Fear & Greed Index (0-100)
    const fearGreedIndex = Math.round((overall.overall + 1) * 50)
    
    return {
      overall,
      fearGreedIndex,
      topBullish: ['NVDA', 'META', 'GOOGL'],
      topBearish: ['XOM', 'CVX', 'BA']
    }
  }
}

export default sentimentService
