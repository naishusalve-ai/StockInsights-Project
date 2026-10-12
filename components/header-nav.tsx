"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Menu, Search, User, X } from "lucide-react"
import { useState, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface HeaderProps {
  showSearch?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearch?: (query: string) => void
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analysis", label: "Analysis" },
  { href: "/stocks", label: "Stocks" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/predictions", label: "Predictions" },
  { href: "/sentiment", label: "Sentiment" },
  { href: "/backtesting", label: "Backtesting" },
]

export function Header({ showSearch = true, searchQuery = "", onSearchChange, onSearch }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }, [onSearchChange])

  const handleSearchSubmit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && localSearch.trim()) {
      if (onSearch) {
        onSearch(localSearch)
      } else {
        // Default behavior: navigate to stocks page with the symbol
        router.push(`/stocks/${localSearch.toUpperCase()}`)
      }
    }
  }, [localSearch, onSearch, router])

  const isActive = (href: string) => {
    if (href === "/dashboard" && pathname === "/dashboard") return true
    if (href !== "/dashboard" && pathname?.startsWith(href)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo and Desktop Nav */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">StockInsight</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  isActive(item.href) ? "text-primary" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  StockInsight
                </Link>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-4" />
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <Link href="/" className="mr-4 md:hidden font-bold">
          StockInsight
        </Link>

        {/* Search and Auth */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {showSearch && (
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks (e.g., AAPL)..."
                  className="pl-8 md:w-[300px] lg:w-[400px]"
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>
            </div>
          )}
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
  )
}
