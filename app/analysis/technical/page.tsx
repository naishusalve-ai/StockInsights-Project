"use client"

import { useState } from "react"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  Clock,
  Info,
  LineChart,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { StockChart } from "@/components/ui/stock-chart"
import { StockSelector } from "@/components/stock-selector"

const indicatorData = {
  movingAverages: [
    { name: "SMA (10)", value: 189.45, signal: "Buy" },
    { name: "SMA (20)", value: 187.45, signal: "Buy" },
    { name: "SMA (50)", value: 182.32, signal: "Buy" },
    { name: "SMA (100)", value: 178.21, signal: "Buy" },
    { name: "SMA (200)", value: 175.89, signal: "Buy" },
    { name: "EMA (10)", value: 190.12, signal: "Buy" },
    { name: "EMA (20)", value: 188.56, signal: "Buy" },
    { name: "EMA (50)", value: 184.23, signal: "Buy" },
    { name: "EMA (100)", value: 179.87, signal: "Neutral" },
    { name: "EMA (200)", value: 176.45, signal: "Buy" },
  ],
  oscillators: [
    { name: "RSI (14)", value: 62.45, signal: "Neutral" },
    { name: "Stochastic %K", value: 78.32, signal: "Overbought" },
    { name: "Stochastic %D", value: 72.18, signal: "Neutral" },
    { name: "MACD", value: 4.45, signal: "Buy" },
    { name: "MACD Signal", value: 2.87, signal: "Buy" },
    { name: "Williams %R", value: -21.45, signal: "Overbought" },
    { name: "CCI (20)", value: 145.32, signal: "Buy" },
    { name: "ADX (14)", value: 32.18, signal: "Strong Trend" },
    { name: "ROC", value: 5.67, signal: "Buy" },
    { name: "Ultimate Oscillator", value: 58.45, signal: "Neutral" },
  ],
  volatility: [
    { name: "ATR (14)", value: 3.45, signal: "Normal" },
    { name: "Bollinger Upper", value: 198.45, signal: "-" },
    { name: "Bollinger Middle", value: 190.23, signal: "-" },
    { name: "Bollinger Lower", value: 182.01, signal: "-" },
    { name: "Bollinger Width", value: 8.65, signal: "Normal" },
    { name: "Keltner Upper", value: 196.78, signal: "-" },
    { name: "Keltner Lower", value: 183.45, signal: "-" },
  ],
}

export default function TechnicalAnalysisPage() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectorOpen, setSelectorOpen] = useState(false)

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case "buy":
      case "strong trend":
        return "text-green-600"
      case "sell":
        return "text-red-600"
      case "overbought":
        return "text-orange-500"
      case "oversold":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">StockInsight</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/analysis" className="text-primary transition-colors hover:text-primary/80">
                Analysis
              </Link>
              <Link href="/stocks" className="transition-colors hover:text-foreground/80">
                Stocks
              </Link>
              <Link href="/portfolio" className="transition-colors hover:text-foreground/80">
                Portfolio
              </Link>
              <Link href="/predictions" className="transition-colors hover:text-foreground/80">
                Predictions
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="ml-2">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="h-8">Sign In</Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Technical Analysis</h1>
            <p className="text-muted-foreground">
              Comprehensive technical indicators and chart patterns for {selectedStock}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Clock className="h-4 w-4" />
              Real-time
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-medium">Selected Stock: {selectedStock}</div>
          <StockSelector
            selectedStock={selectedStock}
            onSelect={setSelectedStock}
            open={selectorOpen}
            onOpenChange={setSelectorOpen}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Signal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">Buy</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on 25 indicators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Moving Averages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">Strong Buy</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">9 Buy, 1 Neutral, 0 Sell</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Oscillators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-6 w-6 text-green-600" />
                <span className="text-2xl font-bold text-green-600">Buy</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">4 Buy, 4 Neutral, 2 Sell</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Trend Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold">Strong</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">ADX: 32.18</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Price Chart with Indicators</CardTitle>
            <CardDescription>
              Interactive chart with technical overlays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart stockSymbol={`NASDAQ:${selectedStock}`} height={500} />
          </CardContent>
        </Card>

        {/* Indicator Tables */}
        <Tabs defaultValue="ma" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ma">Moving Averages</TabsTrigger>
            <TabsTrigger value="oscillators">Oscillators</TabsTrigger>
            <TabsTrigger value="volatility">Volatility</TabsTrigger>
          </TabsList>

          <TabsContent value="ma" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moving Averages</CardTitle>
                <CardDescription>
                  Simple and Exponential Moving Averages across different periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Indicator</th>
                        <th className="text-right py-3 px-4 font-medium">Value</th>
                        <th className="text-right py-3 px-4 font-medium">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicatorData.movingAverages.map((indicator, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{indicator.name}</td>
                          <td className="text-right py-3 px-4">${indicator.value.toFixed(2)}</td>
                          <td className={`text-right py-3 px-4 font-medium ${getSignalColor(indicator.signal)}`}>
                            {indicator.signal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="oscillators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Oscillators</CardTitle>
                <CardDescription>
                  Momentum indicators and oscillators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Indicator</th>
                        <th className="text-right py-3 px-4 font-medium">Value</th>
                        <th className="text-right py-3 px-4 font-medium">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicatorData.oscillators.map((indicator, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{indicator.name}</td>
                          <td className="text-right py-3 px-4">{indicator.value.toFixed(2)}</td>
                          <td className={`text-right py-3 px-4 font-medium ${getSignalColor(indicator.signal)}`}>
                            {indicator.signal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volatility" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Volatility Indicators</CardTitle>
                <CardDescription>
                  Bollinger Bands, ATR, and other volatility measures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Indicator</th>
                        <th className="text-right py-3 px-4 font-medium">Value</th>
                        <th className="text-right py-3 px-4 font-medium">Signal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicatorData.volatility.map((indicator, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{indicator.name}</td>
                          <td className="text-right py-3 px-4">${indicator.value.toFixed(2)}</td>
                          <td className={`text-right py-3 px-4 font-medium ${getSignalColor(indicator.signal)}`}>
                            {indicator.signal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
