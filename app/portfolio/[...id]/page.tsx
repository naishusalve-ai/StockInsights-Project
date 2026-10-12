'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PortfolioItemPage({
  params,
}: {
  params: { id: string[] }
}) {
  const router = useRouter()

  useEffect(() => {
    router.push('/portfolio')
  }, [router])

  return null
}