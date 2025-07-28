import { StockRecommendation, MarketOverview, TechnicalIndicator, NewsItem } from '@/types/trading'

export const mockMarketData: MarketOverview = {
  nifty50: {
    value: 24685.75,
    change: 156.25,
    changePercent: 0.64
  },
  marketSentiment: 'bullish',
  totalVolume: 124700000000,
  advanceDecline: {
    advances: 32,
    declines: 15,
    unchanged: 3
  },
  lastUpdated: new Date().toISOString()
}

export const mockRecommendations: StockRecommendation[] = [
  {
    id: '1',
    stockName: 'Reliance Industries',
    ticker: 'RELIANCE',
    sector: 'Oil & Gas',
    entryPriceRange: { min: 2850, max: 2880 },
    target: 3150,
    stopLoss: 2720,
    riskRewardRatio: 2.1,
    technicalSetup: 'Bullish breakout from ascending triangle pattern with strong volume surge (2.8x avg). MACD bullish crossover confirmed.',
    fundamentalSummary: 'Strong Q3 results with 18% YoY EPS growth. Jio and retail segments showing robust performance.',
    newsEventTrigger: 'Announced ₹75,000 Cr capex for green energy transition. Institutional buying observed.',
    reasonForInclusion: 'Multi-factor alignment: Technical breakout + Strong fundamentals + Positive news catalyst',
    confidenceScore: 87,
    volume: 15600000,
    currentPrice: 2865,
    technicalIndicators: {
      rsi: 64,
      macd: { signal: 'bullish', crossover: true },
      dma: { above20: true, above50: true, above200: true },
      volumeRatio: 2.8
    },
    fundamentalMetrics: {
      epsGrowth: 18,
      roe: 16.2,
      debtToEquity: 0.45,
      promoterHolding: 50.3
    },
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    stockName: 'HDFC Bank',
    ticker: 'HDFCBANK',
    sector: 'Banking',
    entryPriceRange: { min: 1720, max: 1740 },
    target: 1920,
    stopLoss: 1650,
    riskRewardRatio: 2.4,
    technicalSetup: 'Cup & handle pattern completion. RSI in momentum zone. Volume pickup observed.',
    fundamentalSummary: 'NIM expansion expected post-merger integration. Credit growth momentum strong at 14% YoY.',
    newsEventTrigger: 'Management guidance upgrade for FY25. FII buying increased by 2.3% in Q3.',
    reasonForInclusion: 'Banking sector rotation + Technical pattern + Strong deposit franchise',
    confidenceScore: 82,
    volume: 12400000,
    currentPrice: 1735,
    technicalIndicators: {
      rsi: 61,
      macd: { signal: 'bullish', crossover: true },
      dma: { above20: true, above50: true, above200: true },
      volumeRatio: 1.9
    },
    fundamentalMetrics: {
      epsGrowth: 16,
      roe: 17.8,
      debtToEquity: 0.12,
      promoterHolding: 0
    },
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    stockName: 'Infosys',
    ticker: 'INFY',
    sector: 'IT Services',
    entryPriceRange: { min: 1890, max: 1910 },
    target: 2080,
    stopLoss: 1820,
    riskRewardRatio: 2.2,
    technicalSetup: 'Flag pattern breakout with increasing volumes. All DMAs aligned bullishly.',
    fundamentalSummary: 'Deal wins momentum strong. Large deal TCV at $2.4B in Q3. Margin expansion guidance.',
    newsEventTrigger: 'Signed $1.5B deal with European bank. Upgraded by 3 brokerages post Q3 results.',
    reasonForInclusion: 'IT sector revival + Strong deal pipeline + Technical breakout confirmation',
    confidenceScore: 79,
    volume: 8900000,
    currentPrice: 1895,
    technicalIndicators: {
      rsi: 58,
      macd: { signal: 'bullish', crossover: false },
      dma: { above20: true, above50: true, above200: true },
      volumeRatio: 2.1
    },
    fundamentalMetrics: {
      epsGrowth: 15,
      roe: 28.4,
      debtToEquity: 0.08,
      promoterHolding: 13.2
    },
    timestamp: new Date().toISOString()
  },
  {
    id: '4',
    stockName: 'Bharti Airtel',
    ticker: 'BHARTIARTL',
    sector: 'Telecom',
    entryPriceRange: { min: 1580, max: 1600 },
    target: 1780,
    stopLoss: 1520,
    riskRewardRatio: 2.3,
    technicalSetup: 'Bullish pennant formation. RSI showing positive divergence. Volume surge on breakout.',
    fundamentalSummary: 'ARPU improvement trajectory strong. Africa operations turning profitable. 5G rollout accelerating.',
    newsEventTrigger: 'Tariff hike announcement. Spectrum auction participation confirmed. Debt reduction ahead of schedule.',
    reasonForInclusion: 'Telecom sector tailwinds + ARPU expansion + Technical momentum',
    confidenceScore: 75,
    volume: 6700000,
    currentPrice: 1590,
    technicalIndicators: {
      rsi: 66,
      macd: { signal: 'bullish', crossover: true },
      dma: { above20: true, above50: true, above200: false },
      volumeRatio: 2.4
    },
    fundamentalMetrics: {
      epsGrowth: 22,
      roe: 15.6,
      debtToEquity: 0.78,
      promoterHolding: 56.2
    },
    timestamp: new Date().toISOString()
  },
  {
    id: '5',
    stockName: 'Tata Consultancy Services',
    ticker: 'TCS',
    sector: 'IT Services',
    entryPriceRange: { min: 4180, max: 4220 },
    target: 4580,
    stopLoss: 4050,
    riskRewardRatio: 2.1,
    technicalSetup: 'Inverse head & shoulders pattern. Strong support at 4150. Volume confirmation pending.',
    fundamentalSummary: 'Order book visibility strong. BFSI vertical recovery signs. Margin guidance maintained.',
    newsEventTrigger: 'Q3 results beat estimates. Dividend announcement. Share buyback program approved.',
    reasonForInclusion: 'Market leader positioning + Consistent execution + Technical reversal pattern',
    confidenceScore: 73,
    volume: 4200000,
    currentPrice: 4195,
    technicalIndicators: {
      rsi: 59,
      macd: { signal: 'bullish', crossover: false },
      dma: { above20: true, above50: true, above200: true },
      volumeRatio: 1.7
    },
    fundamentalMetrics: {
      epsGrowth: 12,
      roe: 42.1,
      debtToEquity: 0.03,
      promoterHolding: 72.3
    },
    timestamp: new Date().toISOString()
  }
]

export const mockTechnicalIndicators: TechnicalIndicator[] = [
  {
    name: 'Nifty RSI',
    value: 62.4,
    signal: 'buy',
    description: 'Momentum zone, not overbought'
  },
  {
    name: 'MACD Signal',
    value: 1.2,
    signal: 'buy',
    description: 'Bullish crossover confirmed'
  },
  {
    name: 'ADX Trend',
    value: 28.6,
    signal: 'buy',
    description: 'Strong trending market'
  },
  {
    name: 'VIX Level',
    value: 14.2,
    signal: 'neutral',
    description: 'Low volatility environment'
  },
  {
    name: 'Put-Call Ratio',
    value: 0.78,
    signal: 'buy',
    description: 'Bullish sentiment indicator'
  },
  {
    name: 'FII Flow',
    value: 2847,
    signal: 'buy',
    description: 'Net buying by institutions'
  }
]

export const mockNewsItems: NewsItem[] = [
  {
    id: '1',
    headline: 'RBI maintains repo rate at 6.5%, signals dovish stance for H2 FY25',
    summary: 'Reserve Bank of India keeps key policy rates unchanged but hints at potential easing in second half of fiscal year amid moderating inflation.',
    sentiment: 'positive',
    source: 'Economic Times',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['HDFCBANK', 'ICICIBANK', 'SBIN']
  },
  {
    id: '2',
    headline: 'Reliance Industries announces ₹75,000 Cr green energy capex',
    summary: 'RIL commits massive investment in renewable energy infrastructure, targeting net-zero emissions by 2035.',
    sentiment: 'positive',
    source: 'Business Standard',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['RELIANCE']
  },
  {
    id: '3',
    headline: 'IT sector sees revival in deal wins, large contracts surge 40% QoQ',
    summary: 'Major IT companies report significant improvement in deal pipeline with focus on digital transformation projects.',
    sentiment: 'positive',
    source: 'Mint',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH']
  },
  {
    id: '4',
    headline: 'Telecom tariff hikes expected to boost ARPU by 15-20% in FY25',
    summary: 'Industry analysts predict significant revenue per user improvement following recent tariff adjustments by major operators.',
    sentiment: 'positive',
    source: 'Financial Express',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['BHARTIARTL', 'RJIO']
  },
  {
    id: '5',
    headline: 'Global crude oil prices decline 3% on demand concerns',
    summary: 'Brent crude falls below $85/barrel amid worries about global economic slowdown and reduced energy demand.',
    sentiment: 'negative',
    source: 'Reuters',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['RELIANCE', 'ONGC', 'IOC']
  },
  {
    id: '6',
    headline: 'FII inflows surge to ₹12,500 Cr in January, highest in 6 months',
    summary: 'Foreign institutional investors show renewed confidence in Indian markets with significant equity inflows.',
    sentiment: 'positive',
    source: 'Bloomberg Quint',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    relatedStocks: ['NIFTY50']
  }
]