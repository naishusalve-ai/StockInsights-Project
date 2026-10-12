import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { updatePortfolioSchema } from "@/lib/validators"

/**
 * GET /api/portfolio/:id - get item
 * PUT /api/portfolio/:id - update item
 * DELETE /api/portfolio/:id - delete item
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params
    const item = await prisma.portfolio.findFirst({
      where: { id, userId: user.id }
    })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ item })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params
    const body = await request.json()
    const parsed = updatePortfolioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.portfolio.findFirst({ where: { id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const updated = await prisma.portfolio.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json({ item: updated })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params
    
    // Ensure ownership
    const existing = await prisma.portfolio.findFirst({ where: { id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.portfolio.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
