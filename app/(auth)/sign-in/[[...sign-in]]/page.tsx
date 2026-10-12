"use client"

import { SignIn } from "@clerk/nextjs"
import Image from "next/image"
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url')
  
  // Handle routing after successful sign in
  const handleAfterSignIn = () => {
    if (redirectUrl) {
      window.location.href = decodeURIComponent(redirectUrl)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-b from-slate-900 to-slate-700" />
        <Image
          src="/stock-market-charts-background.jpg"
          alt="Stock charts"
          fill
          className="object-cover mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">StockInsights</h1>
            <p className="mt-2 text-white/80">Analyze markets. Track portfolios. Predict trends.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              elements: { 
                formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700",
                footerActionLink: "text-emerald-600 hover:text-emerald-700",
                card: "shadow-none",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "auto",
                showOptionalFields: false,
              },
            }}
            signUpUrl="/sign-up"
            afterSignInUrl={redirectUrl || '/dashboard'}
          />
        </div>
      </div>
    </div>
  )
}
