"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"

export function StockSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  // Mock suggestions - replace with actual API call
  const getSuggestions = (query: string) => {
    const mockStocks = [
      "AAPL - Apple Inc.",
      "MSFT - Microsoft Corporation",
      "GOOGL - Alphabet Inc.",
      "AMZN - Amazon.com Inc.",
      "META - Meta Platforms Inc.",
      "TSLA - Tesla Inc.",
    ]
    return mockStocks.filter(stock => 
      stock.toLowerCase().includes(query.toLowerCase())
    )
  }

  useEffect(() => {
    if (query) {
      setSuggestions(getSuggestions(query))
      setIsOpen(true)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (stockSymbol: string = query) => {
    const symbol = stockSymbol.split(" - ")[0]
    if (symbol) {
      router.push(`/stocks/${symbol}`)
      setQuery("")
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full max-w-sm" ref={searchRef}>
      <div className="relative flex w-full">
        <Input
          type="text"
          placeholder="Search stocks (e.g., AAPL)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pr-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => handleSearch()}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute mt-1 w-full z-50 max-h-60 overflow-auto">
          <ul className="p-2">
            {suggestions.map((stock, index) => (
              <li
                key={index}
                className="px-3 py-2 hover:bg-accent cursor-pointer rounded-md"
                onClick={() => handleSearch(stock)}
              >
                {stock}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}