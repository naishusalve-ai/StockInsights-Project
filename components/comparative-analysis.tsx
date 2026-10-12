"use client"

import { useState, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowDown, ArrowUp, Check, Minus, Plus, X } from "lucide-react"

interface ComparativeAnalysisProps {
  initialStock?: string
}

const stocksData: Record<string, any> = {
  AAPL: {
    name: "Apple Inc.",
    price: 195.45,
    marketCap: "2.87T",
    pe: 32.45,
    eps: 6.02,
    revenue: "385B",
    revenueGrowth: 8.1,
    profitMargin: 25.3,
    roe: 147.5,
    debtEquity: 1.87,
    dividend: 0.52,
    beta: 1.12,
    week52High: 199.62,
    week52Low: 164.08,
  },
  MSFT: {
    name: "Microsoft Corporation",
    price: 428.15,
    marketCap: "3.18T",
    pe: 38.2,
    eps: 11.21,
    revenue: "227B",
    revenueGrowth: 15.8,
    profitMargin: 36.7,
    roe: 35.2,
    debtEquity: 0.42,
    dividend: 0.75,
    beta: 0.89,
    week52High: 468.35,
    week52Low: 309.45,
  },
  GOOGL: {
    name: "Alphabet Inc.",
    price: 175.98,
    marketCap: "2.19T",
    pe: 27.8,
    eps: 6.33,
    revenue: "350B",
    revenueGrowth: 12.4,
    profitMargin: 24.1,
    roe: 28.4,
    debtEquity: 0.11,
    dividend: 0,
    beta: 1.05,
    week52High: 191.75,
    week52Low: 129.40,
  },
  AMZN: {
    name: "Amazon.com Inc.",
    price: 186.23,
    marketCap: "1.94T",
    pe: 62.5,
    eps: 2.98,
    revenue: "575B",
    revenueGrowth: 11.2,
    profitMargin: 7.4,
    roe: 15.8,
    debtEquity: 0.58,
    dividend: 0,
    beta: 1.22,
    week52High: 201.20,
    week52Low: 144.05,
  },
  NVDA: {
    name: "NVIDIA Corporation",
    price: 875.35,
    marketCap: "2.16T",
    pe: 72.8,
    eps: 12.02,
    revenue: "60.9B",
    revenueGrowth: 122.4,
    profitMargin: 55.8,
    roe: 91.5,
    debtEquity: 0.41,
    dividend: 0.04,
    beta: 1.68,
    week52High: 974.00,
    week52Low: 222.97,
  },
  META: {
    name: "Meta Platforms Inc.",
    price: 505.75,
    marketCap: "1.29T",
    pe: 28.9,
    eps: 17.50,
    revenue: "135B",
    revenueGrowth: 21.6,
    profitMargin: 34.5,
    roe: 28.1,
    debtEquity: 0.15,
    dividend: 0.50,
    beta: 1.25,
    week52High: 542.81,
    week52Low: 274.38,
  },
}

const availableStocks = Object.keys(stocksData)

const COLORS = ["#2563eb", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6"]

export function ComparativeAnalysisComponent({ initialStock = "AAPL" }: ComparativeAnalysisProps) {
  // Ensure initial stock exists in data, fallback to AAPL
  const validInitialStock = stocksData[initialStock] ? initialStock : "AAPL"
  const [selectedStocks, setSelectedStocks] = useState<string[]>([validInitialStock, "MSFT", "GOOGL"])

  const toggleStock = (symbol: string) => {
    // Only allow stocks that exist in our data
    if (!stocksData[symbol]) return
    
    if (selectedStocks.includes(symbol)) {
      if (selectedStocks.length > 1) {
        setSelectedStocks(selectedStocks.filter((s) => s !== symbol))
      }
    } else if (selectedStocks.length < 5) {
      setSelectedStocks([...selectedStocks, symbol])
    }
  }

  const comparisonData = useMemo(() => {
    return selectedStocks
      .filter((symbol) => stocksData[symbol]) // Filter out invalid stocks
      .map((symbol) => ({ symbol, ...stocksData[symbol] }))
  }, [selectedStocks])

  const metricsData = useMemo(() => {
    const metrics = ["P/E Ratio", "Revenue Growth", "Profit Margin", "ROE", "Beta"]
    return metrics.map((metric) => {
      const dataPoint: any = { metric }
      selectedStocks.forEach((symbol) => {
        const stock = stocksData[symbol]
        if (!stock) return // Skip if stock doesn't exist
        switch (metric) {
          case "P/E Ratio":
            dataPoint[symbol] = stock.pe
            break
          case "Revenue Growth":
            dataPoint[symbol] = stock.revenueGrowth
            break
          case "Profit Margin":
            dataPoint[symbol] = stock.profitMargin
            break
          case "ROE":
            dataPoint[symbol] = stock.roe
            break
          case "Beta":
            dataPoint[symbol] = stock.beta * 10 // Scale for visibility
            break
        }
      })
      return dataPoint
    })
  }, [selectedStocks])

  const radarData = useMemo(() => {
    return selectedStocks
      .filter((symbol) => stocksData[symbol]) // Filter out invalid stocks
      .map((symbol, index) => {
        const stock = stocksData[symbol]
        return {
          symbol,
          name: stock.name,
          color: COLORS[index],
          data: [
            { subject: "Valuation", value: Math.min(100, (30 / stock.pe) * 100), fullMark: 100 },
            { subject: "Growth", value: Math.min(100, stock.revenueGrowth * 3), fullMark: 100 },
            { subject: "Profitability", value: stock.profitMargin * 2.5, fullMark: 100 },
            { subject: "Efficiency", value: Math.min(100, stock.roe), fullMark: 100 },
            { subject: "Stability", value: (2 - stock.beta) * 50, fullMark: 100 },
            { subject: "Dividend", value: stock.dividend * 100, fullMark: 100 },
          ],
        }
      })
  }, [selectedStocks])

  const performanceData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month, i) => {
      const dataPoint: any = { month }
      selectedStocks.forEach((symbol) => {
        const baseReturn = stocksData[symbol].revenueGrowth / 12
        const noise = (Math.random() - 0.5) * 5
        dataPoint[symbol] = Number(((i + 1) * baseReturn + noise).toFixed(2))
      })
      return dataPoint
    })
  }, [selectedStocks])

  return (
    <div className="space-y-6">
      {/* Stock Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Stocks to Compare</CardTitle>
          <CardDescription>Choose up to 5 stocks for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {availableStocks.map((symbol, index) => {
              const isSelected = selectedStocks.includes(symbol)
              const colorIndex = selectedStocks.indexOf(symbol)
              return (
                <Button
                  key={symbol}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStock(symbol)}
                  className="gap-2"
                  style={isSelected ? { backgroundColor: COLORS[colorIndex] } : {}}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {symbol}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Comparison</CardTitle>
          <CardDescription>Side-by-side comparison of fundamental metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  {selectedStocks.map((symbol, index) => (
                    <th key={symbol} className="text-right py-3 px-4 font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        {symbol}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Price</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4 font-medium">
                      ${stocksData[symbol].price.toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Market Cap</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].marketCap}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">P/E Ratio</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].pe}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">EPS</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      ${stocksData[symbol].eps}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Revenue</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].revenue}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Revenue Growth (YoY)</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      <span className={stocksData[symbol].revenueGrowth > 10 ? "text-green-600" : ""}>
                        {stocksData[symbol].revenueGrowth}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Profit Margin</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].profitMargin}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">ROE</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].roe}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Debt/Equity</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].debtEquity}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Dividend Yield</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].dividend}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4">Beta</td>
                  {selectedStocks.map((symbol) => (
                    <td key={symbol} className="text-right py-3 px-4">
                      {stocksData[symbol].beta}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Metrics Comparison Chart</CardTitle>
            <CardDescription>Visual comparison of key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={metricsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="metric" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                {selectedStocks.map((symbol, index) => (
                  <Bar key={symbol} dataKey={symbol} fill={COLORS[index]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>YTD Performance Comparison</CardTitle>
            <CardDescription>Cumulative returns comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
                <Legend />
                {selectedStocks.map((symbol, index) => (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={COLORS[index]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Highest Valuation</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const highest = selectedStocks.reduce((a, b) =>
                stocksData[a].pe > stocksData[b].pe ? a : b
              )
              return (
                <div>
                  <p className="text-2xl font-bold">{highest}</p>
                  <p className="text-sm text-muted-foreground">P/E: {stocksData[highest].pe}</p>
                </div>
              )
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fastest Growing</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const fastest = selectedStocks.reduce((a, b) =>
                stocksData[a].revenueGrowth > stocksData[b].revenueGrowth ? a : b
              )
              return (
                <div>
                  <p className="text-2xl font-bold text-green-600">{fastest}</p>
                  <p className="text-sm text-muted-foreground">
                    Growth: {stocksData[fastest].revenueGrowth}%
                  </p>
                </div>
              )
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Profitable</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const mostProfitable = selectedStocks.reduce((a, b) =>
                stocksData[a].profitMargin > stocksData[b].profitMargin ? a : b
              )
              return (
                <div>
                  <p className="text-2xl font-bold">{mostProfitable}</p>
                  <p className="text-sm text-muted-foreground">
                    Margin: {stocksData[mostProfitable].profitMargin}%
                  </p>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
