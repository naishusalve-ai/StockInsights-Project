"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { FundamentalAnalysis } from "@/components/fundamental-analysis"
import { StockChart } from "@/components/stock-chart"
import { MarketNews } from "@/components/market-news"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StockSelector } from "@/components/stock-selector"
import { Header } from "@/components/header-nav"

interface StockData {
  symbol: string
  price: number
  change: number
  volume: number
  marketCap: string
  peRatio: number
  dividend: number
  beta: number
}

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API call
    setStockData({
      symbol: "AAPL",
      price: 185.92,
      change: 2.54,
      volume: 58900000,
      marketCap: "2.87T",
      peRatio: 32.45,
      dividend: 0.52,
      beta: 1.12
    })
  }, [selectedStock])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Stock Analysis</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </Button>
          </div>
        </div>

      {stockData && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stockData.price}</div>
                <p className={`text-sm ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stockData.change >= 0 ? '+' : ''}{stockData.change}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stockData.volume / 1000000).toFixed(1)}M</div>
                <p className="text-sm text-muted-foreground">Daily Volume</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockData.marketCap}</div>
                <p className="text-sm text-muted-foreground">USD</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockData.peRatio}</div>
                <p className="text-sm text-muted-foreground">TTM</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList>
              <TabsTrigger value="chart">Price Chart</TabsTrigger>
              <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
              <TabsTrigger value="fundamental">Fundamental Analysis</TabsTrigger>
              <TabsTrigger value="news">News & Sentiment</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                  <CardDescription>Historical price movement and volume</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <StockChart symbol={selectedStock} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Indicators</CardTitle>
                  <CardDescription>Key technical analysis metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <TechnicalAnalysis stockSymbol={selectedStock} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fundamental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fundamental Analysis</CardTitle>
                  <CardDescription>Key financial metrics and ratios</CardDescription>
                </CardHeader>
                <CardContent>
                  <FundamentalAnalysis stockSymbol={selectedStock} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Latest News & Sentiment</CardTitle>
                  <CardDescription>Recent news and market sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <MarketNews stockSymbol={selectedStock} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      </main>
    </div>
  )
}