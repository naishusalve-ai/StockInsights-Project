"use client"

import { SignUp } from "@clerk/nextjs"
import Image from "next/image"


export default function Page() {
  return (
    <div className="min-h-svh grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-700" />
        <Image
          src="/financial-dashboard-ui-mock.jpg"
          alt="Financial dashboard mock"
          fill
          className="object-cover mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">Join StockInsights</h1>
            <p className="mt-2 text-white/80">Your data-driven investment co‑pilot.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <SignUp
            appearance={{
              elements: { formButtonPrimary: "bg-emerald-600 hover:bg-emerald-700" },
            }}
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  )
}
