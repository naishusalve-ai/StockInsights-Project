"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

const data = [
  { date: "2023-07", value: 100000 },
  { date: "2023-08", value: 102500 },
  { date: "2023-09", value: 105000 },
  { date: "2023-10", value: 103000 },
  { date: "2023-11", value: 108000 },
  { date: "2023-12", value: 112000 },
  { date: "2024-01", value: 115000 },
  { date: "2024-02", value: 118000 },
  { date: "2024-03", value: 120000 },
  { date: "2024-04", value: 122000 },
  { date: "2024-05", value: 123000 },
  { date: "2024-06", value: 124568 },
]

export function PortfolioPerformance() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
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
            return date.toLocaleDateString("en-US", { month: "short" })
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
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
                  <div className="text-sm font-semibold">Portfolio Value: ${payload[0].value.toLocaleString()}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorPortfolio)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
