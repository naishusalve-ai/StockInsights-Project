"use client"

import { useState } from "react"
import Link from "next/link"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Building2,
  Clock,
  DollarSign,
  FileText,
  PieChart,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { FundamentalAnalysis } from "@/components/fundamental-analysis"
import { StockSelector } from "@/components/stock-selector"

const companyInfo = {
  name: "Apple Inc.",
  symbol: "AAPL",
  sector: "Technology",
  industry: "Consumer Electronics",
  employees: "164,000",
  founded: "1976",
  headquarters: "Cupertino, California",
  ceo: "Tim Cook",
  website: "www.apple.com",
}

const valuationMetrics = [
  { name: "P/E Ratio (TTM)", value: "32.45", industry: "28.5", status: "premium" },
  { name: "P/E Ratio (Forward)", value: "28.12", industry: "25.3", status: "premium" },
  { name: "PEG Ratio", value: "2.15", industry: "1.8", status: "premium" },
  { name: "Price/Sales", value: "8.23", industry: "5.2", status: "premium" },
  { name: "Price/Book", value: "47.5", industry: "12.3", status: "premium" },
  { name: "EV/EBITDA", value: "24.8", industry: "18.5", status: "premium" },
  { name: "EV/Revenue", value: "7.9", industry: "4.5", status: "premium" },
]

const profitabilityMetrics = [
  { name: "Gross Margin", value: "45.2%", industry: "42.1%", trend: "up" },
  { name: "Operating Margin", value: "30.5%", industry: "22.3%", trend: "up" },
  { name: "Net Profit Margin", value: "25.3%", industry: "18.5%", trend: "up" },
  { name: "ROE", value: "147.5%", industry: "25.2%", trend: "up" },
  { name: "ROA", value: "28.3%", industry: "12.5%", trend: "up" },
  { name: "ROIC", value: "56.2%", industry: "18.3%", trend: "up" },
]

const financialHealth = [
  { name: "Current Ratio", value: "0.94", industry: "1.5", health: "caution" },
  { name: "Quick Ratio", value: "0.85", industry: "1.2", health: "caution" },
  { name: "Debt/Equity", value: "1.87", industry: "0.8", health: "caution" },
  { name: "Debt/EBITDA", value: "1.2", industry: "1.8", health: "good" },
  { name: "Interest Coverage", value: "29.5x", industry: "15.2x", health: "excellent" },
  { name: "Free Cash Flow Yield", value: "3.8%", industry: "4.2%", health: "good" },
]

const growthMetrics = [
  { name: "Revenue Growth (YoY)", value: "8.1%", period: "TTM" },
  { name: "Revenue Growth (5Y CAGR)", value: "11.2%", period: "5Y" },
  { name: "EPS Growth (YoY)", value: "10.3%", period: "TTM" },
  { name: "EPS Growth (5Y CAGR)", value: "15.8%", period: "5Y" },
  { name: "Free Cash Flow Growth", value: "12.5%", period: "TTM" },
  { name: "Dividend Growth (5Y)", value: "6.2%", period: "5Y" },
]

const quarterlyResults = [
  { quarter: "Q4 2024", revenue: 119.6, netIncome: 34.0, eps: 2.18 },
  { quarter: "Q3 2024", revenue: 89.5, netIncome: 22.6, eps: 1.46 },
  { quarter: "Q2 2024", revenue: 85.5, netIncome: 21.9, eps: 1.40 },
  { quarter: "Q1 2024", revenue: 90.8, netIncome: 23.6, eps: 1.53 },
  { quarter: "Q4 2023", revenue: 117.2, netIncome: 33.9, eps: 2.18 },
  { quarter: "Q3 2023", revenue: 89.5, netIncome: 22.9, eps: 1.46 },
]

export default function FundamentalAnalysisPage() {
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectorOpen, setSelectorOpen] = useState(false)

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "caution":
        return "text-orange-500"
      case "poor":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">StockInsight</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/analysis" className="text-primary transition-colors hover:text-primary/80">
                Analysis
              </Link>
              <Link href="/stocks" className="transition-colors hover:text-foreground/80">
                Stocks
              </Link>
              <Link href="/portfolio" className="transition-colors hover:text-foreground/80">
                Portfolio
              </Link>
              <Link href="/predictions" className="transition-colors hover:text-foreground/80">
                Predictions
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="ml-2">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button className="h-8">Sign In</Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fundamental Analysis</h1>
            <p className="text-muted-foreground">
              Financial metrics, valuations, and company fundamentals for {selectedStock}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Clock className="h-4 w-4" />
              Last updated: Today
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-lg font-medium">Selected Stock: {selectedStock}</div>
          <StockSelector
            selectedStock={selectedStock}
            onSelect={setSelectedStock}
            open={selectorOpen}
            onOpenChange={setSelectorOpen}
          />
        </div>

        {/* Company Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{companyInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sector</p>
                <p className="font-medium">{companyInfo.sector}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Industry</p>
                <p className="font-medium">{companyInfo.industry}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="font-medium">{companyInfo.employees}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CEO</p>
                <p className="font-medium">{companyInfo.ceo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Headquarters</p>
                <p className="font-medium">{companyInfo.headquarters}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Founded</p>
                <p className="font-medium">{companyInfo.founded}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p className="font-medium">{companyInfo.website}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.87T</div>
              <p className="text-xs text-muted-foreground">Mega Cap</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">P/E Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.45</div>
              <p className="text-xs text-muted-foreground">vs Industry: 28.5</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dividend Yield</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.52%</div>
              <p className="text-xs text-muted-foreground">$0.96/share annually</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">52-Week Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$164 - $199</div>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs defaultValue="valuation" className="space-y-4">
          <TabsList>
            <TabsTrigger value="valuation" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Valuation
            </TabsTrigger>
            <TabsTrigger value="profitability" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Profitability
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2">
              <PieChart className="h-4 w-4" />
              Financial Health
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Growth
            </TabsTrigger>
            <TabsTrigger value="earnings" className="gap-2">
              <FileText className="h-4 w-4" />
              Earnings History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valuation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Valuation Metrics</CardTitle>
                <CardDescription>
                  Compare company valuation against industry averages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-right py-3 px-4 font-medium">{selectedStock}</th>
                        <th className="text-right py-3 px-4 font-medium">Industry Avg</th>
                        <th className="text-right py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuationMetrics.map((metric, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{metric.name}</td>
                          <td className="text-right py-3 px-4 font-medium">{metric.value}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{metric.industry}</td>
                          <td className="text-right py-3 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                              Premium
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Metrics</CardTitle>
                <CardDescription>
                  Margins and return metrics compared to industry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-right py-3 px-4 font-medium">{selectedStock}</th>
                        <th className="text-right py-3 px-4 font-medium">Industry Avg</th>
                        <th className="text-right py-3 px-4 font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profitabilityMetrics.map((metric, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{metric.name}</td>
                          <td className="text-right py-3 px-4 font-medium">{metric.value}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{metric.industry}</td>
                          <td className="text-right py-3 px-4">
                            {metric.trend === "up" ? (
                              <ArrowUp className="h-4 w-4 text-green-600 inline" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-600 inline" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>
                  Liquidity and solvency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-right py-3 px-4 font-medium">{selectedStock}</th>
                        <th className="text-right py-3 px-4 font-medium">Industry Avg</th>
                        <th className="text-right py-3 px-4 font-medium">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialHealth.map((metric, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{metric.name}</td>
                          <td className="text-right py-3 px-4 font-medium">{metric.value}</td>
                          <td className="text-right py-3 px-4 text-muted-foreground">{metric.industry}</td>
                          <td className={`text-right py-3 px-4 font-medium capitalize ${getHealthColor(metric.health)}`}>
                            {metric.health}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>
                  Revenue, earnings, and cash flow growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {growthMetrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold text-green-600">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.period}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue & Earnings Chart</CardTitle>
                <CardDescription>
                  Quarterly financial performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FundamentalAnalysis stockSymbol={selectedStock} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Earnings History</CardTitle>
                <CardDescription>
                  Recent quarterly financial results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Quarter</th>
                        <th className="text-right py-3 px-4 font-medium">Revenue (B)</th>
                        <th className="text-right py-3 px-4 font-medium">Net Income (B)</th>
                        <th className="text-right py-3 px-4 font-medium">EPS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quarterlyResults.map((result, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 px-4">{result.quarter}</td>
                          <td className="text-right py-3 px-4">${result.revenue.toFixed(1)}B</td>
                          <td className="text-right py-3 px-4">${result.netIncome.toFixed(1)}B</td>
                          <td className="text-right py-3 px-4 font-medium">${result.eps.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
