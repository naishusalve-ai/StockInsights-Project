"use client"

import { FC } from "react"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { StockSearch } from "./stock-search"

const Header: FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg">
          StockInsight
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block">
          <StockSearch />
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-primary hover:text-primary/80">
            Dashboard
          </Link>
          <Link href="/analysis" className="hover:text-foreground/80">
            Analysis
          </Link>
          <Link href="/portfolio" className="hover:text-foreground/80">
            Portfolio
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button className="h-8">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline" className="h-8">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </header>
  )
}

export default Header
