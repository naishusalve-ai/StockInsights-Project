"use client"

interface MarketNewsProps {
  stockSymbol: string
}

export function MarketNews({ stockSymbol }: MarketNewsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Fed Signals Potential Rate Cut in September</h3>
        <p className="text-sm text-muted-foreground">
          Federal Reserve officials indicated they could begin cutting interest rates as soon as September if inflation
          continues to cool.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Bloomberg • 2 hours ago</p>
          <button className="text-xs text-primary">Read more</button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Tech Earnings Beat Expectations</h3>
        <p className="text-sm text-muted-foreground">
          Major tech companies reported stronger-than-expected earnings for Q2, driven by AI investments and cloud
          growth.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">CNBC • 5 hours ago</p>
          <button className="text-xs text-primary">Read more</button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Oil Prices Rise on Supply Concerns</h3>
        <p className="text-sm text-muted-foreground">
          Crude oil prices climbed as geopolitical tensions in the Middle East raised concerns about potential supply
          disruptions.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Reuters • 8 hours ago</p>
          <button className="text-xs text-primary">Read more</button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Retail Sales Show Resilient Consumer Spending</h3>
        <p className="text-sm text-muted-foreground">
          U.S. retail sales increased more than expected in June, suggesting consumer spending remains strong despite
          inflation concerns.
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Wall Street Journal • 1 day ago</p>
          <button className="text-xs text-primary">Read more</button>
        </div>
      </div>
    </div>
  )
}
