import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

/**
 * Optional helper API:
 * GET /api/portfolio/performance
 * Computes a naive performance time series (mocked with current holdings).
 */
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const appUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!appUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const holdings = await prisma.portfolio.findMany({ where: { userId: appUser.id } })

  const base = 10000
  // Simple mock series influenced by number of holdings
  const now = new Date()
  const points: { date: string; value: number }[] = []
  let value = base + holdings.length * 500
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const noise = (Math.random() - 0.5) * 100
    value = Math.max(1000, value + noise)
    points.push({ date: d.toISOString().slice(0, 10), value: Number(value.toFixed(2)) })
  }

  return NextResponse.json({ series: points })
}
