"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  symbol: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  avgPrice: z.coerce.number().positive(),
})
type FormValues = z.infer<typeof schema>

export function PortfolioForm({ onCreated }: { onCreated?: () => void }) {
  const [pending, setPending] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setPending(true)
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, symbol: data.symbol.toUpperCase() }),
      })
      if (res.ok) {
        reset()
        onCreated?.()
      } else {
        console.error(await res.json())
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <div>
        <Input placeholder="Symbol (e.g., AAPL)" {...register("symbol")} />
        {errors.symbol && <p className="mt-1 text-xs text-red-500">{errors.symbol.message}</p>}
      </div>
      <div>
        <Input type="number" placeholder="Quantity" {...register("quantity")} />
        {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
      </div>
      <div>
        <Input type="number" step="0.01" placeholder="Avg. Price" {...register("avgPrice")} />
        {errors.avgPrice && <p className="mt-1 text-xs text-red-500">{errors.avgPrice.message}</p>}
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Adding..." : "Add Investment"}
        </Button>
      </div>
    </form>
  )
}
