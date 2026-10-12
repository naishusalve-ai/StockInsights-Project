import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ClerkProviderWrapper } from "@/components/ClerkProviderWrapper"
import { AuthSync } from "@/components/auth-sync"
import { Spinner } from "@/components/ui/spinner"

export const metadata: Metadata = {
  title: "StockInsights",
  description: "Stock analysis and portfolio management",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen flex flex-col`}>
        <ClerkProviderWrapper>
          <AuthSync />
          {children}
        </ClerkProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
