"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  ChartLine,
  Globe,
  LineChart,
  Lock,
  PieChart,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header-nav"

const features = [
  {
    icon: LineChart,
    title: "Technical Analysis",
    description:
      "Access over 50+ technical indicators including Moving Averages, RSI, MACD, Bollinger Bands, and more.",
    href: "/analysis",
  },
  {
    icon: BarChart3,
    title: "Fundamental Analysis",
    description:
      "Analyze financial statements, ratios, earnings reports, and compare with industry benchmarks.",
    href: "/analysis",
  },
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description:
      "Leverage machine learning models including regression analysis and time series forecasting for price predictions.",
    href: "/predictions",
  },
  {
    icon: PieChart,
    title: "Portfolio Management",
    description:
      "Create and manage multiple portfolios, track performance, and visualize asset allocation.",
    href: "/portfolio",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Data",
    description:
      "Get real-time stock quotes, market indices, and live price updates from major exchanges.",
    href: "/dashboard",
  },
  {
    icon: Globe,
    title: "Market Overview",
    description:
      "Monitor global market trends, sector performance, and top gainers/losers at a glance.",
    href: "/dashboard",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description:
      "Set custom price alerts and get notified when stocks hit your target prices.",
    href: "/portfolio",
  },
  {
    icon: ChartLine,
    title: "Advanced Charts",
    description:
      "Interactive TradingView charts with drawing tools, multiple timeframes, and customizable indicators.",
    href: "/stocks",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    description:
      "Enterprise-grade security with Clerk authentication to keep your data safe.",
    href: "/sign-in",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description:
      "Access your portfolio and analytics from any device with our mobile-friendly interface.",
    href: "/dashboard",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description:
      "Built with Next.js for lightning-fast page loads and optimal user experience.",
    href: "/dashboard",
  },
  {
    icon: BarChart3,
    title: "Comparative Analysis",
    description:
      "Compare multiple stocks side by side with comprehensive metrics and visualizations.",
    href: "/analysis",
  },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Powerful Features for Smart Investing
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Discover all the tools and features that make StockInsight the ultimate platform for
                  stock market analysis and portfolio management.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Start Analyzing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={feature.href}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        Learn more
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Start?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of investors who trust StockInsight for their market analysis needs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="gap-2">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 StockInsight. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/features" className="text-sm text-muted-foreground hover:underline">
              Features
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
