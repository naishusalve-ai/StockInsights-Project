"use client"

/**
 * TradingView Advanced Chart widget wrapper.
 * Embeds a live chart for a given symbol.
 */
import { useEffect, useRef } from "react"

export function StockChart({
  stockSymbol,
  theme = "light",
  height = 420,
}: {
  stockSymbol: string
  theme?: "light" | "dark"
  height?: number
}) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    // Cleanup existing script/widget
    container.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: stockSymbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      allow_symbol_change: true,
      calendar: false,
      hide_volume: false,
      withdateranges: true,
      range: "1M",
      details: true,
    })

    container.current.appendChild(script)
  }, [stockSymbol, theme])

  return (
    <div className="w-full" style={{ height }}>
      <div className="tradingview-widget-container h-full w-full" ref={container} />
    </div>
  )
}
