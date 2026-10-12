"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

interface FundamentalAnalysisProps {
  stockSymbol: string
}

const data = [
  { quarter: "Q1 2023", revenue: 94.8, netIncome: 24.2 },
  { quarter: "Q2 2023", revenue: 81.8, netIncome: 19.9 },
  { quarter: "Q3 2023", revenue: 89.5, netIncome: 22.6 },
  { quarter: "Q4 2023", revenue: 119.6, netIncome: 34.0 },
  { quarter: "Q1 2024", revenue: 90.8, netIncome: 23.6 },
  { quarter: "Q2 2024", revenue: 85.5, netIncome: 21.9 },
]

export function FundamentalAnalysis({ stockSymbol }: FundamentalAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Quarterly financial performance for {stockSymbol} showing revenue and net income
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="quarter" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}B`} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card className="p-2 shadow-md">
                    <div className="text-sm font-medium">{payload[0].payload.quarter}</div>
                    <div className="text-sm">Revenue: ${payload[0].value}B</div>
                    <div className="text-sm">Net Income: ${payload[1].value}B</div>
                  </Card>
                )
              }
              return null
            }}
          />
          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="netIncome" fill="#10b981" radius={[4, 4, 0, 0]} name="Net Income" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
