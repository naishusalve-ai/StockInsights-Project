"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

const data = [
  { date: "2023-07", value: 4200 },
  { date: "2023-08", value: 4350 },
  { date: "2023-09", value: 4500 },
  { date: "2023-10", value: 4400 },
  { date: "2023-11", value: 4600 },
  { date: "2023-12", value: 4750 },
  { date: "2024-01", value: 4850 },
  { date: "2024-02", value: 4700 },
  { date: "2024-03", value: 4800 },
  { date: "2024-04", value: 4900 },
  { date: "2024-05", value: 4750 },
  { date: "2024-06", value: 4800 },
]

export function MarketOverview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", { month: "short" })
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                  <div className="text-sm font-semibold">S&P 500: {payload[0].value}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
