"use client"

import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDown, ArrowUp, Calculator, TrendingDown, TrendingUp } from "lucide-react"

interface ScenarioAnalysisProps {
  stockSymbol: string
  currentPrice?: number
}

interface Scenario {
  name: string
  color: string
  multiplier: number
  description: string
}

const scenarios: Scenario[] = [
  { name: "Bull Case", color: "#22c55e", multiplier: 1.25, description: "Strong market conditions, positive earnings" },
  { name: "Base Case", color: "#3b82f6", multiplier: 1.08, description: "Normal market conditions, steady growth" },
  { name: "Bear Case", color: "#ef4444", multiplier: 0.85, description: "Market downturn, negative sentiment" },
]

const generateScenarioData = (currentPrice: number, days: number = 365) => {
  const data = []
  const startDate = new Date()

  for (let i = 0; i <= days; i += 7) { // Weekly data points
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const progress = i / days
    
    const dataPoint: any = {
      date: date.toISOString().split("T")[0],
      day: i,
    }

    scenarios.forEach((scenario) => {
      const targetPrice = currentPrice * scenario.multiplier
      const priceAtPoint = currentPrice + (targetPrice - currentPrice) * progress
      // Add some noise
      const noise = (Math.random() - 0.5) * 5 * (scenario.multiplier > 1 ? 1 : -1)
      dataPoint[scenario.name] = Number((priceAtPoint + noise).toFixed(2))
    })

    data.push(dataPoint)
  }

  return data
}

const sensitivityFactors = [
  { name: "Revenue Growth", baseImpact: 2.5, range: [-5, 15] },
  { name: "Operating Margin", baseImpact: 1.8, range: [25, 35] },
  { name: "P/E Multiple", baseImpact: 3.2, range: [25, 40] },
  { name: "Interest Rates", baseImpact: -1.5, range: [3, 7] },
  { name: "Market Beta", baseImpact: 1.2, range: [0.8, 1.5] },
]

const whatIfScenarios = [
  {
    event: "Fed Rate Cut (0.25%)",
    bullImpact: "+5-7%",
    bearImpact: "+2-3%",
    probability: "45%",
  },
  {
    event: "Earnings Beat (>10%)",
    bullImpact: "+8-12%",
    bearImpact: "+3-5%",
    probability: "30%",
  },
  {
    event: "Market Correction (>10%)",
    bullImpact: "-8-12%",
    bearImpact: "-15-20%",
    probability: "20%",
  },
  {
    event: "New Product Launch",
    bullImpact: "+10-15%",
    bearImpact: "+3-5%",
    probability: "60%",
  },
  {
    event: "Sector Rotation",
    bullImpact: "+5-8%",
    bearImpact: "-5-10%",
    probability: "35%",
  },
]

export function ScenarioAnalysisComponent({ stockSymbol, currentPrice = 195.45 }: ScenarioAnalysisProps) {
  const [investmentAmount, setInvestmentAmount] = useState(10000)
  const [holdingPeriod, setHoldingPeriod] = useState([12]) // months
  const [customGrowth, setCustomGrowth] = useState([8]) // percentage

  const scenarioData = useMemo(() => generateScenarioData(currentPrice), [currentPrice])

  const calculateReturns = (multiplier: number, months: number, amount: number) => {
    const annualizedMultiplier = Math.pow(multiplier, months / 12)
    const finalValue = amount * annualizedMultiplier
    const profit = finalValue - amount
    const percentReturn = ((finalValue - amount) / amount) * 100
    return { finalValue, profit, percentReturn }
  }

  const bullReturns = calculateReturns(scenarios[0].multiplier, holdingPeriod[0], investmentAmount)
  const baseReturns = calculateReturns(scenarios[1].multiplier, holdingPeriod[0], investmentAmount)
  const bearReturns = calculateReturns(scenarios[2].multiplier, holdingPeriod[0], investmentAmount)

  return (
    <div className="space-y-6">
      {/* Investment Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Investment Scenario Calculator
          </CardTitle>
          <CardDescription>
            Calculate potential returns based on different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="investment">Investment Amount ($)</Label>
                <Input
                  id="investment"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Holding Period: {holdingPeriod[0]} months</Label>
                <Slider
                  value={holdingPeriod}
                  onValueChange={setHoldingPeriod}
                  min={1}
                  max={36}
                  step={1}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Bull Case */}
                <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-700">Bull Case (+25%/yr)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-green-700">
                        ${bullReturns.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-green-600">
                        +${bullReturns.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({bullReturns.percentReturn.toFixed(1)}%)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Base Case */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-700">Base Case (+8%/yr)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-blue-700">
                        ${baseReturns.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-blue-600">
                        +${baseReturns.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({baseReturns.percentReturn.toFixed(1)}%)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Bear Case */}
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-700">Bear Case (-15%/yr)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-red-700">
                        ${bearReturns.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-red-600">
                        ${bearReturns.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({bearReturns.percentReturn.toFixed(1)}%)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Price Projections */}
      <Card>
        <CardHeader>
          <CardTitle>Price Scenario Projections</CardTitle>
          <CardDescription>
            12-month price projections for {stockSymbol} under different scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={scenarioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short" })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 20", "dataMax + 20"]}
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
                          {payload.map((item: any, index: number) => (
                            <div key={index} style={{ color: item.color }}>
                              {item.name}: <span className="font-medium">${item.value}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="Bull Case"
                stroke="#22c55e"
                fill="url(#bullGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Base Case"
                stroke="#3b82f6"
                fill="url(#baseGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Bear Case"
                stroke="#ef4444"
                fill="url(#bearGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* What-If Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>What-If Scenarios</CardTitle>
            <CardDescription>Potential price impact of various events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {whatIfScenarios.map((scenario, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{scenario.event}</span>
                    <span className="text-xs text-muted-foreground">
                      Probability: {scenario.probability}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>Bull: {scenario.bullImpact}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span>Bear: {scenario.bearImpact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sensitivity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Analysis</CardTitle>
            <CardDescription>Price impact per 1% change in key factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sensitivityFactors.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.name}</span>
                    <span className={`text-sm font-medium ${
                      factor.baseImpact > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {factor.baseImpact > 0 ? "+" : ""}{factor.baseImpact}% price impact
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{factor.range[0]}</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.baseImpact > 0 ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${Math.abs(factor.baseImpact) * 15}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{factor.range[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scenario Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Price Targets</CardTitle>
          <CardDescription>Price targets under each scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Scenario</th>
                  <th className="text-right py-3 px-4 font-medium">Target Price</th>
                  <th className="text-right py-3 px-4 font-medium">Upside/Downside</th>
                  <th className="text-right py-3 px-4 font-medium">Probability</th>
                  <th className="text-left py-3 px-4 font-medium">Key Assumptions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Bull Case
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-green-600">
                    ${(currentPrice * 1.25).toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-green-600">+25%</td>
                  <td className="text-right py-3 px-4">20%</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    Strong earnings, favorable macro
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Base Case
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-blue-600">
                    ${(currentPrice * 1.08).toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-blue-600">+8%</td>
                  <td className="text-right py-3 px-4">55%</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    Steady growth, stable market
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Bear Case
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-medium text-red-600">
                    ${(currentPrice * 0.85).toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4 text-red-600">-15%</td>
                  <td className="text-right py-3 px-4">25%</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    Economic slowdown, weak demand
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
