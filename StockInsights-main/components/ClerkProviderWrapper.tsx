"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { Suspense } from "react"

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        layout: {
          helpPageUrl: "https://clerk.dev/support",
          logoImageUrl: "/logo.png",
          logoPlacement: "inside",
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms",
          shimmer: true
        },
        elements: {
          formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
          footerActionLink: "text-emerald-600 hover:text-emerald-700",
          card: "shadow-none"
        }
      }}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600"></div>
        </div>
      }>
        {children}
      </Suspense>
    </ClerkProvider>
  )
}