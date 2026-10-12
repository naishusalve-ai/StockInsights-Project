"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  DollarSign,
  LineChart,
  PieChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketOverview } from "@/components/market-overview"
import { StockChart } from "@/components/ui/stock-chart"
import { TopPerformers } from "@/components/top-performers"
import { MarketNews } from "@/components/market-news"
import LiveAndPrediction from "./_components/live-and-prediction"
import { AuthSync } from "@/components/auth-sync"
import { Header } from "@/components/header-nav"

type TickerQuote = {
  provider: string
  symbol: string
  price: number
  change: number
  changePercent: number
}

export default function Dashboard() {
  const [spx, setSpx] = useState<TickerQuote | null>(null)
  const [dow, setDow] = useState<TickerQuote | null>(null)
  const [nas, setNas] = useState<TickerQuote | null>(null)
  const [rut, setRut] = useState<TickerQuote | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [a, b, c, d] = await Promise.all([
          fetch("/api/stocks?symbol=SPY").then((r) => r.json()),
          fetch("/api/stocks?symbol=DIA").then((r) => r.json()),
          fetch("/api/stocks?symbol=QQQ").then((r) => r.json()),
          fetch("/api/stocks?symbol=IWM").then((r) => r.json()),
        ])
        if (!cancelled) {
          setSpx({ ...a, symbol: "S&P 500" })
          setDow({ ...b, symbol: "Dow Jones" })
          setNas({ ...c, symbol: "NASDAQ" })
          setRut({ ...d, symbol: "Russell 2000" })
        }
      } catch (e) {
        // Keep silent; cards will show placeholders
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  const tiles = useMemo(
    () =>
      [
        spx ?? { symbol: "S&P 500", price: 0, change: 0, changePercent: 0 },
        dow ?? { symbol: "Dow Jones", price: 0, change: 0, changePercent: 0 },
        nas ?? { symbol: "NASDAQ", price: 0, change: 0, changePercent: 0 },
        rut ?? { symbol: "Russell 2000", price: 0, change: 0, changePercent: 0 },
      ] as TickerQuote[],
    [spx, dow, nas, rut],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AuthSync />
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
              <Clock className="h-4 w-4" />
              Last updated: 1 min ago
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
              <ChevronsUpDown className="h-4 w-4" />
              Filter
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.symbol}</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t.price ? t.price.toFixed(2) : "—"}</div>
                <div className="flex items-center space-x-2">
                  {t.change >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <p className="text-xs text-green-500">+{t.changePercent?.toFixed(2)}%</p>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-red-500">{t.changePercent?.toFixed(2)}%</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <LiveAndPrediction symbol="NASDAQ:AAPL" />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Market Overview
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Stock Performance
            </TabsTrigger>
            <TabsTrigger value="sectors" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Sector Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle>Market Overview</CardTitle>
                  <CardDescription>S&P 500 performance over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <MarketOverview />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Best performing stocks today</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopPerformers />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Market News</CardTitle>
                  <CardDescription>Latest financial news and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <MarketNews stockSymbol="MARKET" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sector Performance</CardTitle>
                  <CardDescription>Performance by sector</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Technology</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-500">+2.4%</p>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Healthcare</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-500">+1.7%</p>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Financials</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-500">+0.9%</p>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Energy</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-red-500">-1.2%</p>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Consumer Discretionary</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-green-500">+0.5%</p>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="stocks" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Stock Performance</CardTitle>
                  <CardDescription>AAPL stock price over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <StockChart stockSymbol="NASDAQ:AAPL" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                  <CardDescription>AAPL financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Market Cap</p>
                      </div>
                      <p className="text-sm">$2.87T</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">P/E Ratio</p>
                      </div>
                      <p className="text-sm">32.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">EPS</p>
                      </div>
                      <p className="text-sm">$6.14</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Dividend Yield</p>
                      </div>
                      <p className="text-sm">0.52%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">52-Week High</p>
                      </div>
                      <p className="text-sm">$199.62</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">52-Week Low</p>
                      </div>
                      <p className="text-sm">$124.17</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="sectors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Sector Analysis</CardTitle>
                  <CardDescription>Performance comparison across market sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">Sector analysis visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
