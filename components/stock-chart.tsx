"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

const data = [
  { date: "2023-07", value: 180 },
  { date: "2023-08", value: 175 },
  { date: "2023-09", value: 182 },
  { date: "2023-10", value: 178 },
  { date: "2023-11", value: 188 },
  { date: "2023-12", value: 192 },
  { date: "2024-01", value: 187 },
  { date: "2024-02", value: 190 },
  { date: "2024-03", value: 195 },
  { date: "2024-04", value: 185 },
  { date: "2024-05", value: 192 },
  { date: "2024-06", value: 198 },
]

export function StockChart({ symbol }: { symbol?: string }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
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
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-sm font-semibold">AAPL: ${payload[0].value}</div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#2563eb" fillOpacity={1} fill="url(#colorStock)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
