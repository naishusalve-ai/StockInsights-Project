"use client"

/**
 * Lightweight-charts overlay with "actual" vs "predicted" lines.
 * When no backend data is provided, generates mock series for demo.
 */
import { useEffect, useMemo, useRef } from "react"
import { createChart } from "lightweight-charts"

type Point = { time: number; value: number }

interface ChartPoint {
  time: number;
  value: number;
}

// Helper function to create a series
const createSeries = (chart: any, color: string, isActual: boolean) => {
  return chart.addLineSeries({
    color: color,
    lineWidth: 2,
    lineStyle: isActual ? 0 : 1, // 0 for solid, 1 for dotted
  })
}

function genMockSeries(days = 60) {
  const now = new Date()
  const hist: Point[] = []
  const pred: Point[] = []
  let v = 180
  for (let i = days; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const noise = (Math.random() - 0.5) * 2
    v = Math.max(50, v + noise)
    hist.push({ time: Math.floor(d.getTime() / 1000), value: Number(v.toFixed(2)) })
  }
  // Next 30 days predicted
  const last = hist[hist.length - 1]
  let pv = last.value
  for (let i = 1; i <= 30; i++) {
    const d = new Date((last.time as number) * 1000)
    d.setDate(d.getDate() + i)
    const drift = 0.15
    const noise = (Math.random() - 0.5) * 1.5
    pv = Math.max(50, pv + drift + noise)
    pred.push({ time: Math.floor(d.getTime() / 1000), value: Number(pv.toFixed(2)) })
  }
  return { hist, pred }
}

export function PredictionChart({
  historical,
  predicted,
  height = 320,
}: {
  historical?: Point[]
  predicted?: Point[]
  height?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const data = useMemo(() => {
    if (historical && predicted) return { hist: historical, pred: predicted }
    return genMockSeries()
  }, [historical, predicted])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      height,
      layout: { textColor: "#475569", background: { color: "transparent" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      grid: { horzLines: { color: "#e2e8f0" }, vertLines: { color: "#f1f5f9" } },
      crosshair: { mode: 0 },
    })

    const lineSeries = chart.addLineSeries({
      color: "#2563eb",
      lineWidth: 2,
    })
    lineSeries.setData(data.hist.map(point => ({
      time: point.time as any,
      value: point.value
    })))

    const predictedSeries = chart.addLineSeries({
      color: "#10b981",
      lineWidth: 2,
      lineStyle: 1,
    })
    predictedSeries.setData(data.pred.map(point => ({
      time: point.time as any,
      value: point.value
    })))

    // Fit content
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      chart.applyOptions({ width })
    }
    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      chart.remove()
    }
  }, [data, height])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
