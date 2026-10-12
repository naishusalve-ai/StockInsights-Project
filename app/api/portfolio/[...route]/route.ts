import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { updatePortfolioSchema, type UpdatePortfolioInput } from "@/lib/validators"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const appUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!appUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { route } = await params
    const [id] = route
    if (!id) return NextResponse.json({ error: "Invalid route" }, { status: 400 })

    const item = await prisma.portfolio.findFirst({ where: { id, userId: appUser.id } })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ item })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const appUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!appUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { route } = await params
    const [id] = route
    if (!id) return NextResponse.json({ error: "Invalid route" }, { status: 400 })

    const body = (await request.json()) as UpdatePortfolioInput
    const parsed = updatePortfolioSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.portfolio.findFirst({ where: { id, userId: appUser.id } })
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
  request: Request,
  { params }: { params: Promise<{ route: string[] }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const appUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!appUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { route } = await params
    const [id] = route
    if (!id) return NextResponse.json({ error: "Invalid route" }, { status: 400 })

    const existing = await prisma.portfolio.findFirst({ where: { id, userId: appUser.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.portfolio.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}