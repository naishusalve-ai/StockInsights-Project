/**
 * Ensures a Clerk user exists in our Prisma database.
 * Call this from server components or API routes after verifying auth.
 */
import { prisma } from "@/lib/db"

export async function ensureUserInDb(params: { clerkId: string; email?: string | null; name?: string | null }) {
  const { clerkId, email, name } = params

  if (!clerkId) throw new Error("Missing clerkId")

  // Try to find by clerkId first
  const existing = await prisma.user.findUnique({ where: { clerkId } })
  if (existing) return existing

  // If we have email, ensure uniqueness by email as well
  if (email) {
    const byEmail = await prisma.user.findUnique({ where: { email } })
    if (byEmail) {
      // backfill clerkId if needed
      if (!byEmail.clerkId) {
        return prisma.user.update({ where: { email }, data: { clerkId } })
      }
      return byEmail
    }
  }

  // Create a new user
  return prisma.user.create({
    data: {
      clerkId,
      email: email ?? `${clerkId}@example.local`,
      name: name ?? null,
    },
  })
}
