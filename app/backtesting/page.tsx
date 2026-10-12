"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  DollarSign,
  Play,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { StockSelector } from "@/components/stock-selector"

// Available strategies
const strategies = [
  { id: "sma-crossover", name: "SMA Crossover", description: "Buy when short SMA crosses above long SMA" },
  { id: "rsi-oversold", name: "RSI Oversold", description: "Buy when RSI drops below 30, sell above 70" },
  { id: "macd-signal", name: "MACD Signal", description: "Trade based on MACD and signal line crossovers" },
  { id: "bollinger-bands", name: "Bollinger Bands", description: "Trade bounces off Bollinger Bands" },
  { id: "momentum", name: "Momentum", description: "Buy stocks with strong upward momentum" },
]

// Generate mock backtest results
const generateBacktestData = (months: number) => {
  const data = []
  let strategyValue = 10000
  let benchmarkValue = 10000
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  for (let i = 0; i <= months * 4; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i * 7)

    // Random walk with slight upward bias for strategy
    const strategyChange = (Math.random() - 0.45) * 400
    const benchmarkChange = (Math.random() - 0.48) * 300

    strategyValue = Math.max(5000, strategyValue + strategyChange)
    benchmarkValue = Math.max(5000, benchmarkValue + benchmarkChange)

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      strategy: Math.round(strategyValue),
      benchmark: Math.round(benchmarkValue),
    })
  }
  return data
}

const tradeHistory = [
  { date: "Jan 15, 2026", symbol: "AAPL", type: "BUY", price: 185.50, shares: 50, pnl: 425.00, status: "closed" },
  { date: "Jan 12, 2026", symbol: "MSFT", type: "SELL", price: 428.75, shares: 25, pnl: -180.50, status: "closed" },
  { date: "Jan 10, 2026", symbol: "GOOGL", type: "BUY", price: 172.30, shares: 30, pnl: 312.00, status: "closed" },
  { date: "Jan 8, 2026", symbol: "NVDA", type: "BUY", price: 865.00, shares: 10, pnl: 850.00, status: "closed" },
  { date: "Jan 5, 2026", symbol: "AMZN", type: "SELL", price: 188.25, shares: 40, pnl: 225.60, status: "closed" },
  { date: "Jan 3, 2026", symbol: "TSLA", type: "BUY", price: 248.50, shares: 35, pnl: -420.00, status: "closed" },
]

const monthlyReturns = [
  { month: "Aug", return: 2.3 },
  { month: "Sep", return: -1.5 },
  { month: "Oct", return: 4.2 },
  { month: "Nov", return: 3.8 },
  { month: "Dec", return: -0.8 },
  { month: "Jan", return: 5.1 },
]

export default function BacktestingPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState("sma-crossover")
  const [backtestPeriod, setBacktestPeriod] = useState("12")
  const [initialCapital, setInitialCapital] = useState("10000")
  const [isRunning, setIsRunning] = useState(false)
  const [hasResults, setHasResults] = useState(true)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/stocks/${searchQuery.toUpperCase()}`)
    }
  }

  const backtestData = useMemo(() => generateBacktestData(Number.parseInt(backtestPeriod)), [backtestPeriod])

  const runBacktest = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setHasResults(true)
    }, 2000)
  }

  // Calculate metrics from data
  const finalStrategyValue = backtestData[backtestData.length - 1]?.strategy || 10000
  const finalBenchmarkValue = backtestData[backtestData.length - 1]?.benchmark || 10000
  const startValue = Number.parseInt(initialCapital)
  const strategyReturn = ((finalStrategyValue - startValue) / startValue) * 100
  const benchmarkReturn = ((finalBenchmarkValue - startValue) / startValue) * 100
  const totalTrades = tradeHistory.length
  const winningTrades = tradeHistory.filter((t) => t.pnl > 0).length
  const winRate = (winningTrades / totalTrades) * 100

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
              <Link href="/analysis" className="transition-colors hover:text-foreground/80">
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
              <Link href="/backtesting" className="text-primary transition-colors hover:text-primary/80">
                Backtesting
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks (e.g., AAPL)..."
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SignedIn>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Strategy Backtesting</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Clock className="h-4 w-4" />
              Last run: Just now
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Backtest Configuration</CardTitle>
            <CardDescription>Configure your strategy parameters and run a backtest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Stock Symbol</Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{selectedStock}</span>
                  <StockSelector
                    selectedStock={selectedStock}
                    onSelect={setSelectedStock}
                    open={selectorOpen}
                    onOpenChange={setSelectorOpen}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period (months)</Label>
                <Select value={backtestPeriod} onValueChange={setBacktestPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Initial Capital ($)</Label>
                <Input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Strategy:</strong> {strategies.find((s) => s.id === selectedStrategy)?.description}
              </p>
              <Button onClick={runBacktest} disabled={isRunning} className="gap-2">
                <Play className="h-4 w-4" />
                {isRunning ? "Running Backtest..." : "Run Backtest"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {hasResults && (
          <>
            {/* Performance Metrics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${strategyReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {strategyReturn >= 0 ? "+" : ""}
                    {strategyReturn.toFixed(2)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    vs Benchmark: {benchmarkReturn >= 0 ? "+" : ""}
                    {benchmarkReturn.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Final Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${finalStrategyValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Started with ${Number.parseInt(initialCapital).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {winningTrades} of {totalTrades} trades profitable
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.85</div>
                  <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="performance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="trades" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Trade History
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Monthly Returns
                </TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription>Strategy vs Benchmark (S&P 500) over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={backtestData}>
                          <defs>
                            <linearGradient id="strategyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="benchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis
                            className="text-xs"
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString()}`, ""]}
                            labelStyle={{ color: "hsl(var(--foreground))" }}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="strategy"
                            name="Strategy"
                            stroke="#2563eb"
                            fill="url(#strategyGradient)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="benchmark"
                            name="Benchmark (S&P 500)"
                            stroke="#6b7280"
                            fill="url(#benchmarkGradient)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Max Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">-12.4%</div>
                      <p className="text-sm text-muted-foreground">Largest peak-to-trough decline</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Volatility</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">18.5%</div>
                      <p className="text-sm text-muted-foreground">Annualized standard deviation</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Alpha</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">+4.2%</div>
                      <p className="text-sm text-muted-foreground">Excess return vs benchmark</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trades" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade History</CardTitle>
                    <CardDescription>All trades executed during the backtest period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="pb-3 text-left font-medium">Date</th>
                            <th className="pb-3 text-left font-medium">Symbol</th>
                            <th className="pb-3 text-left font-medium">Type</th>
                            <th className="pb-3 text-right font-medium">Price</th>
                            <th className="pb-3 text-right font-medium">Shares</th>
                            <th className="pb-3 text-right font-medium">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tradeHistory.map((trade, index) => (
                            <tr key={index} className="border-b last:border-0">
                              <td className="py-3 text-muted-foreground">{trade.date}</td>
                              <td className="py-3 font-medium">{trade.symbol}</td>
                              <td className="py-3">
                                <Badge variant={trade.type === "BUY" ? "default" : "secondary"}>
                                  {trade.type}
                                </Badge>
                              </td>
                              <td className="py-3 text-right">${trade.price.toFixed(2)}</td>
                              <td className="py-3 text-right">{trade.shares}</td>
                              <td
                                className={`py-3 text-right font-medium ${
                                  trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                                }`}
                              >
                                {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Returns</CardTitle>
                    <CardDescription>Performance breakdown by month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyReturns}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(2)}%`, "Return"]}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Bar
                            dataKey="return"
                            fill="#2563eb"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
