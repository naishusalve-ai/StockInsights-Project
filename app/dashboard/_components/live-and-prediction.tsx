"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockChart } from "@/components/ui/stock-chart"
import { PredictionChart } from "@/components/ui/prediction-chart"

export default function LiveAndPrediction({
  symbol = "NASDAQ:AAPL",
}: {
  symbol?: string
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Live Chart ({symbol})</CardTitle>
        </CardHeader>
        <CardContent>
          <StockChart stockSymbol={symbol} theme="light" height={420} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Predictions Overlay</CardTitle>
        </CardHeader>
        <CardContent>
          <PredictionChart height={420} />
        </CardContent>
      </Card>
    </div>
  )
}
