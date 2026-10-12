"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  MessageSquare,
  Minus,
  Newspaper,
  Search,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Twitter,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StockSelector } from "@/components/stock-selector"

// Mock sentiment data
const overallSentiment = {
  score: 72,
  label: "Bullish",
  change: 5.2,
}

const sentimentSources = [
  { source: "News Articles", positive: 68, neutral: 22, negative: 10, count: 145 },
  { source: "Social Media", positive: 75, neutral: 15, negative: 10, count: 2340 },
  { source: "Analyst Reports", positive: 60, neutral: 30, negative: 10, count: 28 },
  { source: "Reddit/Forums", positive: 80, neutral: 12, negative: 8, count: 890 },
]

const recentNews = [
  {
    title: "Apple Reports Record Q4 Earnings, Beats Expectations",
    source: "Bloomberg",
    time: "2 hours ago",
    sentiment: "positive",
  },
  {
    title: "New iPhone Sales Surge in Asian Markets",
    source: "Reuters",
    time: "4 hours ago",
    sentiment: "positive",
  },
  {
    title: "Apple Expands AI Features in Latest iOS Update",
    source: "TechCrunch",
    time: "6 hours ago",
    sentiment: "positive",
  },
  {
    title: "Regulatory Concerns Over App Store Policies",
    source: "WSJ",
    time: "8 hours ago",
    sentiment: "negative",
  },
  {
    title: "Apple Announces New Sustainability Initiatives",
    source: "CNBC",
    time: "12 hours ago",
    sentiment: "neutral",
  },
]

const socialMentions = [
  { platform: "Twitter/X", mentions: 12500, sentiment: 78, trending: true },
  { platform: "Reddit", mentions: 3200, sentiment: 82, trending: true },
  { platform: "StockTwits", mentions: 8900, sentiment: 71, trending: false },
  { platform: "YouTube", mentions: 450, sentiment: 65, trending: false },
]

const analystRatings = [
  { firm: "Morgan Stanley", rating: "Overweight", target: 220, date: "Jan 25, 2026" },
  { firm: "Goldman Sachs", rating: "Buy", target: 215, date: "Jan 24, 2026" },
  { firm: "JP Morgan", rating: "Overweight", target: 225, date: "Jan 22, 2026" },
  { firm: "Bank of America", rating: "Buy", target: 210, date: "Jan 20, 2026" },
  { firm: "Citi", rating: "Neutral", target: 195, date: "Jan 18, 2026" },
]

export default function SentimentPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStock, setSelectedStock] = useState("AAPL")
  const [selectorOpen, setSelectorOpen] = useState(false)

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/stocks/${searchQuery.toUpperCase()}`)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-500"
      case "negative":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
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
              <Link href="/analysis" className="transition-colors hover:text-foreground/80">
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
              <Link href="/sentiment" className="text-primary transition-colors hover:text-primary/80">
                Sentiment
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks (e.g., AAPL)..."
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SignedIn>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex"
                  onClick={() => router.push("/profile")}
                >
                  <User className="h-5 w-5" />
                </Button>
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
          <h1 className="text-2xl font-bold tracking-tight">Market Sentiment</h1>
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

        {/* Overall Sentiment Score */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Overall Sentiment Score</CardTitle>
              <CardDescription>Aggregated sentiment from all sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90 transform">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-muted"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${overallSentiment.score * 3.52} 352`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{overallSentiment.score}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-xl font-semibold text-green-500">{overallSentiment.label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">+{overallSentiment.change}%</span>
                    <span>from yesterday</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {sentimentSources.reduce((a, b) => a + b.count, 0).toLocaleString()} data points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Buy Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">8</div>
              <p className="text-sm text-muted-foreground">Strong bullish indicators</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+2 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sell Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">2</div>
              <p className="text-sm text-muted-foreground">Minor bearish indicators</p>
              <div className="mt-2 flex items-center gap-1">
                <ArrowDown className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">-1 from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sources" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Sentiment Sources
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News Feed
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="analysts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Analyst Ratings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sources" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {sentimentSources.map((source) => (
                <Card key={source.source}>
                  <CardHeader>
                    <CardTitle className="text-base">{source.source}</CardTitle>
                    <CardDescription>{source.count.toLocaleString()} data points analyzed</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-green-500" />
                          Positive
                        </span>
                        <span className="font-medium">{source.positive}%</span>
                      </div>
                      <Progress value={source.positive} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-yellow-500" />
                          Neutral
                        </span>
                        <span className="font-medium">{source.neutral}%</span>
                      </div>
                      <Progress value={source.neutral} className="h-2 bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-500" />
                          Negative
                        </span>
                        <span className="font-medium">{source.negative}%</span>
                      </div>
                      <Progress value={source.negative} className="h-2 bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent News</CardTitle>
                <CardDescription>Latest news articles and their sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNews.map((news, index) => (
                    <div key={index} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="font-medium">{news.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{news.source}</span>
                          <span>•</span>
                          <span>{news.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(news.sentiment)}
                        <span className={`text-sm font-medium capitalize ${getSentimentColor(news.sentiment)}`}>
                          {news.sentiment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {socialMentions.map((platform) => (
                <Card key={platform.platform}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{platform.platform}</CardTitle>
                      {platform.trending && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Mentions (24h)</span>
                        <span className="text-xl font-bold">{platform.mentions.toLocaleString()}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Sentiment Score</span>
                          <span className="font-medium text-green-500">{platform.sentiment}%</span>
                        </div>
                        <Progress value={platform.sentiment} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyst Ratings</CardTitle>
                <CardDescription>Recent analyst ratings and price targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 text-left font-medium">Firm</th>
                        <th className="pb-3 text-left font-medium">Rating</th>
                        <th className="pb-3 text-right font-medium">Price Target</th>
                        <th className="pb-3 text-right font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analystRatings.map((analyst, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <td className="py-3 font-medium">{analyst.firm}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                analyst.rating.includes("Buy") || analyst.rating.includes("Overweight")
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {analyst.rating}
                            </Badge>
                          </td>
                          <td className="py-3 text-right font-medium">${analyst.target}</td>
                          <td className="py-3 text-right text-muted-foreground">{analyst.date}</td>
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
