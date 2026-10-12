"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h4 className="font-semibold">StockInsight</h4>
            <p className="text-sm text-muted-foreground">
              Advanced stock analysis and portfolio management platform
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold">Features</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/analysis" className="text-sm text-muted-foreground hover:text-primary">
                  Stock Analysis
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-primary">
                  Portfolio Management
                </Link>
              </li>
              <li>
                <Link href="/predictions" className="text-sm text-muted-foreground hover:text-primary">
                  Market Predictions
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-sm text-muted-foreground hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} StockInsight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}