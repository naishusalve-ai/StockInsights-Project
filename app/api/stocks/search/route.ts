import { NextResponse } from "next/server"

/**
 * GET /api/stocks/search?q=AAPL
 * Search for stocks by symbol or name
 */

const allStocks = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE" },
  { symbol: "PG", name: "Procter & Gamble Co.", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Inc.", exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", exchange: "NYSE" },
  { symbol: "HD", name: "The Home Depot Inc.", exchange: "NYSE" },
  { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ" },
  { symbol: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ" },
  { symbol: "CRM", name: "Salesforce Inc.", exchange: "NYSE" },
  { symbol: "INTC", name: "Intel Corporation", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices Inc.", exchange: "NASDAQ" },
  { symbol: "CSCO", name: "Cisco Systems Inc.", exchange: "NASDAQ" },
  { symbol: "PEP", name: "PepsiCo Inc.", exchange: "NASDAQ" },
  { symbol: "KO", name: "The Coca-Cola Company", exchange: "NYSE" },
  { symbol: "NKE", name: "Nike Inc.", exchange: "NYSE" },
  { symbol: "MCD", name: "McDonald's Corporation", exchange: "NYSE" },
  { symbol: "COST", name: "Costco Wholesale Corporation", exchange: "NASDAQ" },
  { symbol: "ABBV", name: "AbbVie Inc.", exchange: "NYSE" },
  { symbol: "TMO", name: "Thermo Fisher Scientific Inc.", exchange: "NYSE" },
  { symbol: "ACN", name: "Accenture plc", exchange: "NYSE" },
  { symbol: "AVGO", name: "Broadcom Inc.", exchange: "NASDAQ" },
  { symbol: "TXN", name: "Texas Instruments Inc.", exchange: "NASDAQ" },
  { symbol: "QCOM", name: "QUALCOMM Inc.", exchange: "NASDAQ" },
  { symbol: "ORCL", name: "Oracle Corporation", exchange: "NYSE" },
  { symbol: "IBM", name: "International Business Machines", exchange: "NYSE" },
  { symbol: "GE", name: "General Electric Company", exchange: "NYSE" },
  { symbol: "BA", name: "The Boeing Company", exchange: "NYSE" },
  { symbol: "CAT", name: "Caterpillar Inc.", exchange: "NYSE" },
  { symbol: "MMM", name: "3M Company", exchange: "NYSE" },
  { symbol: "GS", name: "The Goldman Sachs Group Inc.", exchange: "NYSE" },
  { symbol: "MS", name: "Morgan Stanley", exchange: "NYSE" },
  { symbol: "AXP", name: "American Express Company", exchange: "NYSE" },
  { symbol: "C", name: "Citigroup Inc.", exchange: "NYSE" },
  { symbol: "BAC", name: "Bank of America Corporation", exchange: "NYSE" },
  { symbol: "WFC", name: "Wells Fargo & Company", exchange: "NYSE" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial Average ETF", exchange: "NYSE" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", exchange: "NYSE" },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get("q") || "").toLowerCase().trim()
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  if (!query) {
    // Return popular stocks if no query
    return NextResponse.json({
      results: allStocks.slice(0, limit),
      total: allStocks.length,
    })
  }

  // Search by symbol or name
  const results = allStocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
    )
    .slice(0, limit)

  return NextResponse.json({
    results,
    total: results.length,
    query,
  })
}
