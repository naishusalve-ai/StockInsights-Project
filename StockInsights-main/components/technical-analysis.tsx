"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

interface TechnicalAnalysisProps {
  stockSymbol: string
}

const data = [
  { date: "2024-01", price: 180, sma20: 178, sma50: 175, rsi: 55 },
  { date: "2024-02", price: 185, sma20: 180, sma50: 176, rsi: 60 },
  { date: "2024-03", price: 190, sma20: 183, sma50: 178, rsi: 65 },
  { date: "2024-04", price: 188, sma20: 185, sma50: 180, rsi: 58 },
  { date: "2024-05", price: 195, sma20: 188, sma50: 182, rsi: 70 },
  { date: "2024-06", price: 198, sma20: 192, sma50: 185, rsi: 72 },
]

export function TechnicalAnalysis({ stockSymbol }: TechnicalAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Technical analysis for {stockSymbol} showing price action with key moving averages
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            domain={["dataMin - 10", "dataMax + 10"]}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 shadow-md">
                    <div className="text-sm font-medium">
                      {new Date(payload[0].payload.date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-sm">Price: ${payload[0].value}</div>
                    <div className="text-sm">SMA(20): ${payload[1].value}</div>
                    <div className="text-sm">SMA(50): ${payload[2].value}</div>
                  </Card>
                )
              }
              return null
            }}
          />
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
