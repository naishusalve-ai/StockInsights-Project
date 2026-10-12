"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowDown, ArrowRight, ArrowUp, TrendingDown, TrendingUp } from "lucide-react"

interface TrendAnalysisProps {
  stockSymbol: string
  timeframe?: number
}

// Generate trend data
const generateTrendData = (days: number = 90) => {
  const data = []
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let price = 180
  let sma20 = 178
  let sma50 = 175
  let rsi = 55

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    // Simulate price movement with trend
    const trend = Math.sin(i / 15) * 0.5 + 0.2
    const noise = (Math.random() - 0.5) * 2
    price = Math.max(150, price + trend + noise)

    // Update moving averages (simplified)
    sma20 = sma20 * 0.95 + price * 0.05
    sma50 = sma50 * 0.98 + price * 0.02

    // Update RSI
    rsi = Math.min(85, Math.max(15, rsi + (Math.random() - 0.48) * 5))

    data.push({
      date: date.toISOString().split("T")[0],
      price: Number(price.toFixed(2)),
      sma20: Number(sma20.toFixed(2)),
      sma50: Number(sma50.toFixed(2)),
      rsi: Number(rsi.toFixed(2)),
      volume: Math.floor(40000000 + Math.random() * 30000000),
    })
  }

  return data
}

const trendStrengthData = [
  { name: "Bullish", value: 65, color: "#22c55e" },
  { name: "Neutral", value: 20, color: "#94a3b8" },
  { name: "Bearish", value: 15, color: "#ef4444" },
]

const trendIndicators = [
  { name: "Short-term (1-7 days)", direction: "up", strength: 75, signal: "Strong Bullish" },
  { name: "Medium-term (1-4 weeks)", direction: "up", strength: 60, signal: "Bullish" },
  { name: "Long-term (1-3 months)", direction: "neutral", strength: 50, signal: "Neutral" },
  { name: "Overall Trend", direction: "up", strength: 65, signal: "Bullish" },
]

const supportResistance = [
  { level: "Resistance 3", price: 210.50, strength: "Weak" },
  { level: "Resistance 2", price: 205.25, strength: "Moderate" },
  { level: "Resistance 1", price: 200.00, strength: "Strong" },
  { level: "Current Price", price: 195.45, strength: "-" },
  { level: "Support 1", price: 190.00, strength: "Strong" },
  { level: "Support 2", price: 185.50, strength: "Moderate" },
  { level: "Support 3", price: 180.00, strength: "Strong" },
]

const volumeProfile = [
  { range: "$205-210", volume: 15, percentage: 8 },
  { range: "$200-205", volume: 25, percentage: 14 },
  { range: "$195-200", volume: 45, percentage: 25 },
  { range: "$190-195", volume: 55, percentage: 30 },
  { range: "$185-190", volume: 30, percentage: 17 },
  { range: "$180-185", volume: 12, percentage: 7 },
]

export function TrendAnalysisComponent({ stockSymbol, timeframe = 90 }: TrendAnalysisProps) {
  const trendData = useMemo(() => generateTrendData(timeframe), [timeframe])
  const lastData = trendData[trendData.length - 1]
  const firstData = trendData[0]
  const priceChange = ((lastData.price - firstData.price) / firstData.price * 100).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Trend Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold text-green-600">Bullish</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {priceChange}% over {timeframe} days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trend Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">65%</div>
            <Progress value={65} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Moderately Strong</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RSI (14)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{lastData.rsi}</div>
            <Progress value={lastData.rsi} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {lastData.rsi > 70 ? "Overbought" : lastData.rsi < 30 ? "Oversold" : "Neutral Zone"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-green-600" />
              <span className="text-xl font-bold">Above Avg</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+12% vs 20-day avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart with Trend Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Price Trend Analysis</CardTitle>
          <CardDescription>
            Price action with moving averages for {stockSymbol}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Card className="p-3 shadow-md">
                        <div className="text-sm font-medium mb-2">
                          {new Date(payload[0].payload.date).toLocaleDateString()}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div>Price: <span className="font-medium">${payload[0].payload.price}</span></div>
                          <div className="text-green-600">SMA(20): ${payload[0].payload.sma20}</div>
                          <div className="text-orange-500">SMA(50): ${payload[0].payload.sma50}</div>
                        </div>
                      </Card>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} name="Price" />
              <Line type="monotone" dataKey="sma20" stroke="#22c55e" strokeWidth={1.5} dot={false} name="SMA(20)" />
              <Line type="monotone" dataKey="sma50" stroke="#f97316" strokeWidth={1.5} dot={false} name="SMA(50)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trend Direction by Timeframe */}
        <Card>
          <CardHeader>
            <CardTitle>Trend by Timeframe</CardTitle>
            <CardDescription>Trend direction across different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {indicator.direction === "up" ? (
                      <ArrowUp className="h-5 w-5 text-green-600" />
                    ) : indicator.direction === "down" ? (
                      <ArrowDown className="h-5 w-5 text-red-600" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium">{indicator.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={indicator.strength} className="w-24" />
                    <span className={`text-sm font-medium min-w-[100px] text-right ${
                      indicator.direction === "up" ? "text-green-600" :
                      indicator.direction === "down" ? "text-red-600" : "text-gray-600"
                    }`}>
                      {indicator.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
            <CardDescription>Distribution of bullish vs bearish signals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={trendStrengthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {trendStrengthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Support & Resistance Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Support & Resistance Levels</CardTitle>
            <CardDescription>Key price levels to watch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {supportResistance.map((level, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded ${
                    level.level === "Current Price"
                      ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                      : level.level.includes("Resistance")
                      ? "text-red-600"
                      : level.level.includes("Support")
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  <span>{level.level}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">${level.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground min-w-[60px]">{level.strength}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volume Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Volume Profile</CardTitle>
            <CardDescription>Volume distribution by price level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={volumeProfile} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="range" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Volume"]}
                />
                <Bar dataKey="percentage" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
