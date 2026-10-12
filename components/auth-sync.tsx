'use client'

import { useEffect, useState } from "react"

/**
 * Client helper to call /api/auth once after sign-in to ensure the user exists in Prisma.
 * Place in protected pages if desired.
 */

export function AuthSync() {
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    fetch("/api/auth", { method: "POST" })
      .then(() => setSynced(true))
      .catch(() => setSynced(true)) // Set synced even on error to prevent infinite loading
  }, [])

  if (!synced) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div role="status" className="animate-spin h-8 w-8 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  return null
}
