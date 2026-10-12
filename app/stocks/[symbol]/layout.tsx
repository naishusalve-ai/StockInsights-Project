"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function StockDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/stocks/${searchQuery.toUpperCase()}`)
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
              <Link href="/stocks" className="text-primary transition-colors hover:text-primary/80">
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
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
