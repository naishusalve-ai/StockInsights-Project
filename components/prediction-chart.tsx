"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

interface PredictionChartProps {
  stockSymbol: string
  timeframe: number
}

// Generate prediction data based on timeframe
const generatePredictionData = (timeframe: number) => {
  const historicalData = [
    { date: "2024-01-01", actual: 180 },
    { date: "2024-02-01", actual: 185 },
    { date: "2024-03-01", actual: 190 },
    { date: "2024-04-01", actual: 188 },
    { date: "2024-05-01", actual: 195 },
    { date: "2024-06-01", actual: 198 },
  ]

  // Generate future dates based on timeframe
  const futureData = []
  const lastDate = new Date("2024-06-01")
  const lastPrice = 198

  for (let i = 1; i <= timeframe; i++) {
    const newDate = new Date(lastDate)
    newDate.setDate(newDate.getDate() + i)

    // Simple prediction model with some randomness
    const predictedPrice = lastPrice * (1 + 0.085 * (i / timeframe)) + (Math.random() * 2 - 1)
    const optimisticPrice = predictedPrice * 1.05
    const pessimisticPrice = predictedPrice * 0.95

    futureData.push({
      date: newDate.toISOString().split("T")[0],
      predicted: Number.parseFloat(predictedPrice.toFixed(2)),
      optimistic: Number.parseFloat(optimisticPrice.toFixed(2)),
      pessimistic: Number.parseFloat(pessimisticPrice.toFixed(2)),
    })
  }

  return [...historicalData, ...futureData]
}

export function PredictionChart({ stockSymbol, timeframe }: PredictionChartProps) {
  const data = generatePredictionData(timeframe)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          domain={["dataMin - 10", "dataMax + 10"]}
          tickFormatter={(value) => `$${value}`}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 shadow-md">
                  <div className="text-sm font-medium">
                    {new Date(payload[0].payload.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {payload[0].payload.actual && <div className="text-sm">Actual: ${payload[0].payload.actual}</div>}
                  {payload[0].payload.predicted && (
                    <>
                      <div className="text-sm font-semibold text-green-500">
                        Predicted: ${payload[0].payload.predicted}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Range: ${payload[0].payload.pessimistic} - ${payload[0].payload.optimistic}
                      </div>
                    </>
                  )}
                </Card>
              )
            }
            return null
          }}
        />
        <Area
          type="monotone"
          dataKey="actual"
          stroke="#2563eb"
          fillOpacity={1}
          fill="url(#colorActual)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorPredicted)"
          strokeWidth={2}
          strokeDasharray="5 5"
        />
        <Area type="monotone" dataKey="optimistic" stroke="transparent" fill="#10b98133" />
        <Area type="monotone" dataKey="pessimistic" stroke="transparent" fill="transparent" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
