"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card } from "@/components/ui/card"

const data = [
  { name: "Technology", value: 45.2, color: "#2563eb" },
  { name: "Healthcare", value: 15.8, color: "#10b981" },
  { name: "Financials", value: 12.4, color: "#f59e0b" },
  { name: "Consumer Discretionary", value: 8.7, color: "#8b5cf6" },
  { name: "Cash", value: 12.4, color: "#64748b" },
  { name: "Other", value: 5.5, color: "#94a3b8" },
]

export function PortfolioAllocation() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(1)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 shadow-md">
                    <div className="text-sm font-medium">{payload[0].name}</div>
                    <div className="text-sm font-semibold">{payload[0].value}%</div>
                  </Card>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
