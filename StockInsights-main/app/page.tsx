"use client"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"



export default function Home() {
  const router = useRouter()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold p-5 sm:inline-block">StockInsight</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/stocks" className="transition-colors hover:text-foreground/80">
                Stocks
              </Link>
              <Link href="/analysis" className="transition-colors hover:text-foreground/80">
                Analysis
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
              <Button variant="outline" className="ml-auto hidden h-8 md:flex " onClick={() => router.push("/sign-in")}>
                Sign In
              </Button>
            </div>
            <Button className="h-8">Get Started</Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Data-Driven Stock Market Analysis
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Make informed investment decisions with our comprehensive stock market analytics platform. Analyze
                    trends, evaluate performance, and predict future movements.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="w-full">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button size="lg" variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <video
                src="/bodyy.mp4"
                width={550}
                height={800}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                autoPlay
                loop
                muted
                playsInline
              >
                Your browser does not support the video tag.
              </video>

            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform provides comprehensive tools for stock market analysis and prediction
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Analysis</CardTitle>
                  <CardDescription>
                    Apply various technical indicators to identify market trends and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Access over 50+ technical indicators including Moving Averages, RSI, MACD, Bollinger Bands, and
                    more.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/analysis/technical">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fundamental Analysis</CardTitle>
                  <CardDescription>Evaluate company financials and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Analyze financial statements, ratios, earnings reports, and compare with industry benchmarks.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/analysis/fundamental">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Predictive Models</CardTitle>
                  <CardDescription>Forecast future price movements using advanced algorithms</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Leverage machine learning models including regression analysis and time series forecasting.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/predictions">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Tracking</CardTitle>
                  <CardDescription>Monitor and analyze your investment portfolio</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Track performance, risk metrics, diversification, and get personalized recommendations.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/portfolio">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Market Sentiment</CardTitle>
                  <CardDescription>Analyze news and social media sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Gauge market sentiment through news analysis, social media trends, and expert opinions.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/sentiment">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Backtesting</CardTitle>
                  <CardDescription>Test your strategies against historical data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Validate investment strategies by testing them against historical market conditions.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/backtesting">
                    <Button variant="ghost" size="sm">
                      Learn more
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 StockInsight. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
