"use client"

import { useState } from "react"
import { BarChart3, Clock, LineChart, PieChart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TechnicalAnalysis } from "@/components/technical-analysis"
import { FundamentalAnalysis } from "@/components/fundamental-analysis"
import { StockSelector } from "@/components/stock-selector"
import { ComparativeAnalysisComponent } from "@/components/comparative-analysis"
import { Header } from "@/components/header-nav"

export default function Analysis() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [selectorOpen, setSelectorOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Analysis</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Clock className="h-4 w-4" />
              Last updated: Just now
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="text-lg font-medium">Selected Stock: {selectedStock}</div>
          <StockSelector
            selectedStock={selectedStock}
            onSelect={setSelectedStock}
            open={selectorOpen}
            onOpenChange={setSelectorOpen}
          />
        </div>
        <Tabs defaultValue="technical" className="space-y-4">
          <TabsList>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Technical Analysis
            </TabsTrigger>
            <TabsTrigger value="fundamental" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Fundamental Analysis
            </TabsTrigger>
            <TabsTrigger value="comparative" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Comparative Analysis
            </TabsTrigger>
          </TabsList>
          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Analysis</CardTitle>
                <CardDescription>Analyze {selectedStock} using technical indicators and chart patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <TechnicalAnalysis stockSymbol={selectedStock} />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Moving Averages</CardTitle>
                  <CardDescription>Simple and exponential moving averages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">SMA (20)</p>
                      </div>
                      <p className="text-sm">$187.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">SMA (50)</p>
                      </div>
                      <p className="text-sm">$182.32</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">SMA (200)</p>
                      </div>
                      <p className="text-sm">$175.89</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">EMA (12)</p>
                      </div>
                      <p className="text-sm">$189.21</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">EMA (26)</p>
                      </div>
                      <p className="text-sm">$184.76</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Oscillators</CardTitle>
                  <CardDescription>Momentum indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">RSI (14)</p>
                      </div>
                      <p className="text-sm">62.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">MACD</p>
                      </div>
                      <p className="text-sm">4.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">MACD Signal</p>
                      </div>
                      <p className="text-sm">2.87</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Stochastic %K</p>
                      </div>
                      <p className="text-sm">78.32</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Stochastic %D</p>
                      </div>
                      <p className="text-sm">72.18</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Volatility & Volume</CardTitle>
                  <CardDescription>Volatility and volume indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Bollinger Bands Width</p>
                      </div>
                      <p className="text-sm">12.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">ATR (14)</p>
                      </div>
                      <p className="text-sm">3.87</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Volume</p>
                      </div>
                      <p className="text-sm">45.2M</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">OBV</p>
                      </div>
                      <p className="text-sm">1.23B</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Volume MA (20)</p>
                      </div>
                      <p className="text-sm">52.7M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="fundamental" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fundamental Analysis</CardTitle>
                <CardDescription>Analyze {selectedStock} using financial statements and ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <FundamentalAnalysis stockSymbol={selectedStock} />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Ratios</CardTitle>
                  <CardDescription>Key valuation metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">P/E Ratio</p>
                      </div>
                      <p className="text-sm">32.45</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Forward P/E</p>
                      </div>
                      <p className="text-sm">28.76</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">PEG Ratio</p>
                      </div>
                      <p className="text-sm">2.34</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">P/S Ratio</p>
                      </div>
                      <p className="text-sm">7.89</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">P/B Ratio</p>
                      </div>
                      <p className="text-sm">45.67</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Profitability</CardTitle>
                  <CardDescription>Profitability metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Gross Margin</p>
                      </div>
                      <p className="text-sm">43.31%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Operating Margin</p>
                      </div>
                      <p className="text-sm">30.42%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Net Profit Margin</p>
                      </div>
                      <p className="text-sm">25.88%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">ROE</p>
                      </div>
                      <p className="text-sm">156.39%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">ROA</p>
                      </div>
                      <p className="text-sm">24.72%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                  <CardDescription>Growth metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Revenue Growth (YoY)</p>
                      </div>
                      <p className="text-sm">8.12%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">EPS Growth (YoY)</p>
                      </div>
                      <p className="text-sm">10.45%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Dividend Growth (5Y)</p>
                      </div>
                      <p className="text-sm">7.32%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">EBITDA Growth</p>
                      </div>
                      <p className="text-sm">9.87%</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Free Cash Flow Growth</p>
                      </div>
                      <p className="text-sm">12.54%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="comparative" className="space-y-4">
            <ComparativeAnalysisComponent initialStock={selectedStock} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
