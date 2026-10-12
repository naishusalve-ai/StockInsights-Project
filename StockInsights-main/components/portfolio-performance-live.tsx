"use client"

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

type Pt = { date: string; value: number }

export function PortfolioPerformanceLive() {
  const [data, setData] = useState<Pt[]>([])
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/portfolio/performance")
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setData(json.series as Pt[])
      } catch {}
    }
    load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPortfolioLive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 shadow-md">
                  <div className="text-sm font-medium">{payload[0].payload.date}</div>
                  <div className="text-sm font-semibold">
                    Portfolio Value: ${Number(payload[0].value).toLocaleString()}
                  </div>
                </Card>
              )
            }
            return null
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorPortfolioLive)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
