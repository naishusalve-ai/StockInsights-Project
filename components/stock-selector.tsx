"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface StockSelectorProps {
  selectedStock: string
  onSelect: (symbol: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const popularStocks = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "META", name: "Meta Platforms Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "JNJ", name: "Johnson & Johnson" },
  { symbol: "WMT", name: "Walmart Inc." },
  { symbol: "PG", name: "Procter & Gamble Co." },
  { symbol: "MA", name: "Mastercard Inc." },
  { symbol: "UNH", name: "UnitedHealth Group Inc." },
  { symbol: "HD", name: "The Home Depot Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "PYPL", name: "PayPal Holdings Inc." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CRM", name: "Salesforce Inc." },
]

export function StockSelector({ selectedStock, onSelect, open, onOpenChange }: StockSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<typeof popularStocks>([])
  const router = useRouter()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  // Filter stocks based on search
  useEffect(() => {
    if (searchValue) {
      const filtered = popularStocks.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchValue.toLowerCase())
      )
      setSearchResults(filtered)
    } else {
      setSearchResults(popularStocks)
    }
  }, [searchValue])

  const handleSelect = useCallback((symbol: string) => {
    onSelect(symbol)
    setIsOpen(false)
    setSearchValue("")
  }, [onSelect, setIsOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="h-8 gap-1"
        >
          <ChevronsUpDown className="h-4 w-4" />
          Change Stock
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search stocks..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-4 text-center text-sm">
                <p className="text-muted-foreground mb-2">No stock found.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (searchValue) {
                      handleSelect(searchValue.toUpperCase())
                    }
                  }}
                >
                  Use "{searchValue.toUpperCase()}"
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Popular Stocks">
              {searchResults.map((stock) => (
                <CommandItem
                  key={stock.symbol}
                  value={`${stock.symbol} ${stock.name}`}
                  onSelect={() => handleSelect(stock.symbol)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStock === stock.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">{stock.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
