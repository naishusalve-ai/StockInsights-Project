import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { ensureUserInDb } from "@/lib/user"

/**
 * POST /api/auth
 * Verifies session via Clerk and ensures a corresponding user exists in Prisma.
 * Returns the app user record.
 */
export async function POST() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appUser = await ensureUserInDb({
      clerkId: user.id,
      email: user.emailAddresses?.[0]?.emailAddress ?? null,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
    })

    return NextResponse.json({ user: appUser })
  } catch (err) {
    console.error("Auth sync error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
