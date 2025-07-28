export interface StockRecommendation {
  id: string
  symbol: string
  companyName: string
  sector: string
  entryRange: {
    min: number
    max: number
  }
  target: number
  stopLoss: number
  riskRewardRatio: number
  technicalSetup: string
  fundamentalSummary: string
  newsEvent: string
  reasoning: string
  confidenceScore: number
  volume: number
  currentPrice: number
  marketCap: number
  pe: number
  technicals: {
    rsi: number
    macd: {
      signal: 'bullish' | 'bearish'
      crossover: boolean
    }
    dma: {
      above20: boolean
      above50: boolean
      above200: boolean
    }
    volumeRatio: number
  }
  fundamentalMetrics: {
    epsGrowth: number
    roe: number
    debtToEquity: number
    promoterHolding: number
  }
  timestamp: string
}

export interface MarketOverview {
  nifty50: {
    value: number
    change: number
    changePercent: number
  }
  marketSentiment: 'bullish' | 'bearish' | 'neutral'
  totalVolume: number
  advanceDecline: {
    advances: number
    declines: number
    unchanged: number
  }
  lastUpdated: string
}

export interface TechnicalIndicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  description: string
}

export interface NewsItem {
  id: string
  headline: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
  timestamp: string
  relatedStocks: string[]
}

export interface Alert {
  id: string
  symbol: string
  type: 'price' | 'volume' | 'rsi'
  condition: 'above' | 'below'
  value: number
  message?: string
  isActive: boolean
  triggered: boolean
  createdAt: string
}

export interface PortfolioPosition {
  id: string
  symbol: string
  quantity: number
  entryPrice: number
  currentPrice: number
  targetPrice?: number
  stopLoss?: number
  entryDate: string
  pnl: number
  pnlPercent: number
}