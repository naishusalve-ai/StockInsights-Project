"use client"

import { AlertTriangle, Info, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

/**
 * Financial Disclaimer Component
 * 
 * Provides legally compliant disclaimers for financial applications
 * in accordance with SEBI (India), SEC (US), and general fintech regulations.
 */

interface DisclaimerProps {
  variant?: 'full' | 'compact' | 'inline' | 'banner'
  showSebi?: boolean
  showPrediction?: boolean
  className?: string
}

export function FinancialDisclaimer({ 
  variant = 'compact',
  showSebi = true,
  showPrediction = false,
  className = ''
}: DisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className={`text-xs text-muted-foreground ${className}`}>
        <Info className="inline h-3 w-3 mr-1" />
        Not investment advice. Past performance doesn't guarantee future results.
      </p>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-yellow-50 dark:bg-yellow-950 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 ${className}`}>
        <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
          <AlertTriangle className="inline h-3 w-3 mr-1" />
          Investment in securities market are subject to market risks. Read all related documents carefully before investing.
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Alert variant="default" className={`border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/50 ${className}`}>
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">Investment Disclaimer</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
          This platform provides analytics for informational purposes only. It does not constitute 
          investment advice. Always consult a qualified financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    )
  }

  // Full disclaimer
  return (
    <div className={`space-y-4 ${className}`}>
      <Alert variant="destructive" className="border-red-500/50 bg-red-50/50 dark:bg-red-950/50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important Risk Disclosure</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>
            <strong>No Investment Advice:</strong> StockInsight is an analytics platform that provides 
            market data, technical indicators, and educational tools. Nothing on this platform constitutes 
            investment advice, recommendation, or endorsement.
          </p>
          <p>
            <strong>Market Risk:</strong> Investment in securities market is subject to market risks. 
            Past performance is not indicative of future results. The value of investments can go up 
            or down, and you may lose some or all of your invested capital.
          </p>
        </AlertDescription>
      </Alert>

      {showSebi && (
        <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Regulatory Notice (India)</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm space-y-2 mt-2">
            <p>
              <strong>SEBI Registration:</strong> StockInsight is not registered as an Investment Advisor, 
              Research Analyst, or Stock Broker with the Securities and Exchange Board of India (SEBI).
            </p>
            <p>
              <strong>No Stock Tips:</strong> We do not provide stock tips, buy/sell recommendations, 
              or portfolio management services. All analyses are algorithmic and for educational purposes only.
            </p>
            <p>
              <strong>User Responsibility:</strong> Users must conduct their own research and due diligence 
              before making any investment decisions. Consider consulting a SEBI-registered Investment Advisor.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {showPrediction && (
        <Alert className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">Prediction Disclaimer</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300 text-sm space-y-2 mt-2">
            <p>
              <strong>Algorithm-Based Forecasts:</strong> Price predictions are generated using mathematical 
              models (linear regression, exponential smoothing) based on historical price data only.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> These predictions do not account for market news, 
              company fundamentals, macroeconomic factors, or unforeseen events. They should never be 
              used as the sole basis for investment decisions.
            </p>
            <p>
              <strong>Accuracy Limitations:</strong> Historical backtesting accuracy does not guarantee 
              future prediction accuracy. Markets are inherently unpredictable.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          By using StockInsight, you acknowledge that you have read and understood these disclaimers 
          and agree to our <a href="/terms" className="underline">Terms of Service</a> and{" "}
          <a href="/privacy" className="underline">Privacy Policy</a>.
        </p>
        <p>
          © {new Date().getFullYear()} StockInsight. Data may be delayed. Not for trading purposes.
        </p>
      </div>
    </div>
  )
}

/**
 * Prediction-specific disclaimer text
 */
export const PREDICTION_DISCLAIMER = `
IMPORTANT DISCLAIMER: These predictions are generated by mathematical models using historical price data only. 
They do not constitute investment advice and should not be used as the sole basis for any investment decision. 
Stock markets are inherently unpredictable and past performance does not guarantee future results. 
Always consult a qualified financial advisor before investing. StockInsight is not responsible for any 
financial losses incurred based on these predictions.
`

/**
 * Portfolio disclaimer text
 */
export const PORTFOLIO_DISCLAIMER = `
Portfolio values are calculated using real-time market data which may be delayed by up to 15 minutes. 
P&L figures are for informational purposes only and may not reflect actual gains/losses after taxes, 
fees, and other charges. This is not a substitute for official brokerage statements.
`

/**
 * Backtesting disclaimer text
 */
export const BACKTESTING_DISCLAIMER = `
Backtesting results are based on historical data and do not guarantee future performance. 
Actual trading may differ due to slippage, market conditions, and execution delays. 
Transaction costs used in simulations may not reflect actual brokerage charges.
`

export default FinancialDisclaimer
