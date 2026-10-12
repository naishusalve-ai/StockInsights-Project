"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronsUpDown,
  Clock,
  DollarSign,
  Edit,
  Save,
  Settings,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioPerformanceLive } from "@/components/portfolio-performance-live"
import { PortfolioForm } from "@/components/portfolio-form"
import { AuthSync } from "@/components/auth-sync"
import { Header } from "@/components/header-nav"

type Item = {
  id: string
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice?: number | null
  createdAt: string
}

export default function Portfolio() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Item>>({})
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/portfolio")
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to load portfolio")
      }
      const json = await res.json()
      setItems(json.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => items.filter((i) => i.symbol.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, searchQuery],
  )

  const beginEdit = (row: Item) => {
    setEditingId(row.id)
    setEditDraft({ symbol: row.symbol, quantity: row.quantity, avgPrice: row.avgPrice })
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editDraft),
      })
      if (res.ok) {
        await load()
        setEditingId(null)
        setEditDraft({})
      }
    } catch (e) {
      console.error(e)
    }
  }

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" })
      if (res.ok) {
        setItems((prev) => prev.filter((x) => x.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="holdings" className="flex items-center gap-2">
              <ChevronsUpDown className="h-4 w-4" />
              Holdings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Computed from your holdings</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PortfolioPerformanceLive />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Change estimates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Total holdings</span>
                      <span className="text-sm">{items.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Winners today</span>
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> —
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Losers today</span>
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" /> —
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="holdings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Investment</CardTitle>
                <CardDescription>Create a new portfolio entry</CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioForm onCreated={load} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Holdings</CardTitle>
                  <CardDescription>All stocks in your portfolio</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8 gap-1 bg-transparent">
                  <ChevronsUpDown className="h-4 w-4" />
                  Filter
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 border-b px-4 py-3 font-medium">
                    <div>Symbol</div>
                    <div>Shares</div>
                    <div>Avg. Cost</div>
                    <div>Current Price</div>
                    <div>Actions</div>
                    <div className="text-right">Created</div>
                  </div>
                  {loading ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">Loading...</div>
                  ) : error ? (
                    <div className="px-4 py-6 text-sm text-red-500">{error}</div>
                  ) : filtered.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground">No holdings yet.</div>
                  ) : (
                    filtered.map((row) => {
                      const isEditing = editingId === row.id
                      return (
                        <div className="grid grid-cols-6 border-b px-4 py-3" key={row.id}>
                          <div className="font-medium">
                            {isEditing ? (
                              <Input
                                value={editDraft.symbol ?? ""}
                                onChange={(e) => setEditDraft((d) => ({ ...d, symbol: e.target.value.toUpperCase() }))}
                              />
                            ) : (
                              row.symbol
                            )}
                          </div>
                          <div>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={String(editDraft.quantity ?? "")}
                                onChange={(e) => setEditDraft((d) => ({ ...d, quantity: Number(e.target.value) || 0 }))}
                              />
                            ) : (
                              row.quantity
                            )}
                          </div>
                          <div>
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                value={String(editDraft.avgPrice ?? "")}
                                onChange={(e) => setEditDraft((d) => ({ ...d, avgPrice: Number(e.target.value) || 0 }))}
                              />
                            ) : (
                              `$${row.avgPrice.toFixed(2)}`
                            )}
                          </div>
                          <div>{row.currentPrice ? `$${row.currentPrice.toFixed(2)}` : "—"}</div>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <Button size="sm" onClick={() => saveEdit(row.id)} className="gap-1">
                                <Save className="h-4 w-4" />
                                Save
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => beginEdit(row)} className="gap-1">
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => remove(row.id)} className="gap-1">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {new Date(row.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
