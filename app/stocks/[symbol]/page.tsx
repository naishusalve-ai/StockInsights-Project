"use client"

import { useParams } from "next/navigation"
import { StockChart } from "@/components/ui/stock-chart"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { FundamentalAnalysis } from "@/components/fundamental-analysis"
import { MarketNews } from "@/components/market-news"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

export default function StockAnalysisPage() {
  const params = useParams()
  const stockSymbol = params.symbol as string

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">{stockSymbol} Analysis</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis and insights for {stockSymbol}
        </p>
      </div>

      <Card className="p-6">
        <StockChart stockSymbol={stockSymbol} height={500} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <Tabs defaultValue="technical" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="technical" className="flex-1">Technical Analysis</TabsTrigger>
              <TabsTrigger value="fundamental" className="flex-1">Fundamental Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="technical" className="p-4">
              <TechnicalAnalysis stockSymbol={stockSymbol} />
            </TabsContent>
            <TabsContent value="fundamental" className="p-4">
              <FundamentalAnalysis stockSymbol={stockSymbol} />
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Market News</h2>
          <MarketNews stockSymbol={stockSymbol} />
        </Card>
      </div>
    </div>
  )
}