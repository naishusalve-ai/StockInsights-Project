"use client"

import { TrendingUp } from "lucide-react"

export function TopPerformers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">NVDA</p>
          <p className="text-xs text-muted-foreground">NVIDIA Corporation</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-green-500">+4.2%</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">MSFT</p>
          <p className="text-xs text-muted-foreground">Microsoft Corporation</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-green-500">+2.8%</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">AAPL</p>
          <p className="text-xs text-muted-foreground">Apple Inc.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-green-500">+1.9%</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">AMZN</p>
          <p className="text-xs text-muted-foreground">Amazon.com, Inc.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-green-500">+1.7%</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">GOOGL</p>
          <p className="text-xs text-muted-foreground">Alphabet Inc.</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-green-500">+1.5%</p>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </div>
  )
}
