import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/layout/Header'
import { StockRecommendationsTable } from '@/components/dashboard/StockRecommendationsTable'
import { TechnicalAnalysisPanel } from '@/components/dashboard/TechnicalAnalysisPanel'
import { NewsEventsPanel } from '@/components/dashboard/NewsEventsPanel'
import { StatusPanel } from '@/components/dashboard/StatusPanel'
import { PortfolioTracker } from '@/components/dashboard/PortfolioTracker'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { AdvancedIndicators } from '@/components/dashboard/AdvancedIndicators'
import { BacktestingPanel } from '@/components/dashboard/BacktestingPanel'
import { EnhancedNewsPanel } from '@/components/dashboard/EnhancedNewsPanel'
import { RiskManagementPanel } from '@/components/dashboard/RiskManagementPanel'
import AdvancedCharting from '@/components/dashboard/AdvancedCharting'
import AutomatedSignals from '@/components/dashboard/AutomatedSignals'
import ExportPanel from '@/components/dashboard/ExportPanel'
import AdvancedFilters from '@/components/dashboard/AdvancedFilters'
import { EmptyDataState } from '@/components/dashboard/EmptyDataState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { blink } from '@/lib/blink'
import { workingMarketDataService } from '@/lib/workingMarketDataService'
import { workingScreeningService } from '@/lib/workingScreeningService'
import { newsService } from '@/lib/newsService'
import { 
  mockTechnicalIndicators, 
  mockNewsItems 
} from '@/lib/mockData'
import { StockRecommendation, MarketOverview, TechnicalIndicator, NewsItem, PortfolioPosition, Alert } from '@/types/trading'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState<MarketOverview>({
    nifty50: { value: 24587.50, change: 125.75, changePercent: 0.51 },
    marketSentiment: 'bullish',
    totalVolume: 145000000000,
    advanceDecline: { advances: 32, declines: 15, unchanged: 3 },
    lastUpdated: new Date().toISOString()
  })
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([])
  const [dataSource, setDataSource] = useState<'loading' | 'real' | 'simulated' | 'error'>('loading')
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator[]>(mockTechnicalIndicators)
  const [newsItems, setNewsItems] = useState<NewsItem[]>(mockNewsItems)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [portfolioPositions, setPortfolioPositions] = useState<PortfolioPosition[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filteredRecommendations, setFilteredRecommendations] = useState<StockRecommendation[]>([])
  const { toast } = useToast()

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    setDataSource('loading')
    console.log('🔄 Starting real market data fetch...')
    
    try {
      console.log('🚀 Attempting to fetch REAL market data from APIs...')
      
      // Try to fetch real market data with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 15000)
      )
      
      const dataPromise = Promise.allSettled([
        workingMarketDataService.getRealNifty50Overview(),
        workingScreeningService.runRealScreening(),
        newsService.getMarketNews()
      ])
      
      const results = await Promise.race([dataPromise, timeoutPromise]) as PromiseSettledResult<any>[]
      const [niftyResult, screeningResult, newsResult] = results

      let hasRealData = false

      // Update market data with real Nifty 50 data
      if (niftyResult.status === 'fulfilled' && niftyResult.value) {
        console.log('✅ REAL Nifty 50 data fetched successfully:', niftyResult.value)
        setMarketData(niftyResult.value)
        hasRealData = true
      } else {
        console.log('❌ Nifty 50 API failed, reason:', niftyResult.status === 'rejected' ? niftyResult.reason : 'No data')
      }

      // Update recommendations with REAL screening results
      if (screeningResult.status === 'fulfilled' && screeningResult.value && screeningResult.value.length > 0) {
        console.log('✅ REAL screening completed successfully:', screeningResult.value.length, 'recommendations')
        setRecommendations(screeningResult.value)
        hasRealData = true
        
        // Log each real recommendation
        screeningResult.value.forEach((rec: StockRecommendation, index: number) => {
          console.log(`${index + 1}. ${rec.symbol} (${rec.sector}) - Confidence: ${rec.confidenceScore}% - R:R: ${rec.riskRewardRatio.toFixed(1)}:1`)
        })
        
        setDataSource('real')
        toast({
          title: "✅ REAL Market Data Loaded",
          description: `${screeningResult.value.length} live recommendations from institutional screening`,
        })
      } else {
        console.log('❌ Real screening failed, reason:', screeningResult.status === 'rejected' ? screeningResult.reason : 'No recommendations')
        throw new Error('No real recommendations available')
      }

      // Update news items
      if (newsResult.status === 'fulfilled' && newsResult.value && newsResult.value.length > 0) {
        console.log('✅ Real news data fetched:', newsResult.value.length, 'articles')
        setNewsItems(newsResult.value)
      }

      if (hasRealData) {
        console.log('🎯 SUCCESS: Real market data integration complete')
      }

    } catch (error) {
      console.error('❌ REAL DATA FETCH FAILED:', error)
      console.log('⚠️ Falling back to simulated data due to API issues')
      
      setDataSource('error')
      
      toast({
        title: "⚠️ Real Data Unavailable",
        description: "APIs are currently unavailable. Please try again later.",
        variant: "destructive",
      })
      
      // Show empty state instead of fake data
      setRecommendations([])
      setMarketData(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString()
      }))
    }
    
    setIsRefreshing(false)
  }, [toast])

  // Initial data load when user is authenticated
  useEffect(() => {
    if (!loading && user) {
      console.log('🚀 User authenticated, attempting to fetch real market data...')
      handleRefresh()
    }
  }, [loading, user, handleRefresh])

  // Simulate real-time price updates for portfolio positions
  useEffect(() => {
    if (portfolioPositions.length === 0) return

    const interval = setInterval(() => {
      setPortfolioPositions(prev => prev.map(position => {
        // Simulate price movement (±2% random change)
        const priceChange = (Math.random() - 0.5) * 0.04 * position.entryPrice
        const newCurrentPrice = Math.max(position.currentPrice + priceChange, position.entryPrice * 0.5)
        
        const newPnl = (newCurrentPrice - position.entryPrice) * position.quantity
        const newPnlPercent = ((newCurrentPrice - position.entryPrice) / position.entryPrice) * 100
        
        return {
          ...position,
          currentPrice: newCurrentPrice,
          pnl: newPnl,
          pnlPercent: newPnlPercent
        }
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [portfolioPositions.length])

  // Check alerts against current market conditions
  useEffect(() => {
    if (alerts.length === 0) return

    const checkAlerts = () => {
      setAlerts(prev => prev.map(alert => {
        if (alert.triggered || !alert.isActive) return alert

        // Simulate checking alert conditions
        // In real implementation, this would check against live market data
        const shouldTrigger = Math.random() < 0.01 // 1% chance per check

        if (shouldTrigger) {
          toast({
            title: "🔔 Alert Triggered!",
            description: `${alert.symbol} ${alert.condition} ₹${alert.value}`,
            variant: "destructive",
          })
          return { ...alert, triggered: true }
        }

        return alert
      }))
    }

    const interval = setInterval(checkAlerts, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [alerts.length, toast])

  const handleStockSelect = (stock: StockRecommendation) => {
    console.log('Selected stock:', stock)
    // Here you could open a detailed view, chart, or external link
  }

  const handleNewsClick = (newsItem: NewsItem) => {
    console.log('News clicked:', newsItem)
    // Here you could open the full article or show more details
  }

  // Portfolio management handlers
  const handleAddPosition = (position: Omit<PortfolioPosition, 'id' | 'currentPrice' | 'pnl' | 'pnlPercent'>) => {
    const newPosition: PortfolioPosition = {
      ...position,
      id: `pos_${Date.now()}`,
      currentPrice: position.entryPrice + (Math.random() - 0.5) * 100, // Mock current price
      pnl: 0,
      pnlPercent: 0
    }
    
    // Calculate P&L
    newPosition.pnl = (newPosition.currentPrice - newPosition.entryPrice) * newPosition.quantity
    newPosition.pnlPercent = ((newPosition.currentPrice - newPosition.entryPrice) / newPosition.entryPrice) * 100
    
    setPortfolioPositions(prev => [...prev, newPosition])
    toast({
      title: "Position Added",
      description: `Added ${position.symbol} to your portfolio`,
    })
  }

  const handleRemovePosition = (id: string) => {
    setPortfolioPositions(prev => prev.filter(pos => pos.id !== id))
    toast({
      title: "Position Removed",
      description: "Position removed from portfolio",
    })
  }

  const handleUpdatePosition = (id: string, updates: Partial<PortfolioPosition>) => {
    setPortfolioPositions(prev => prev.map(pos => 
      pos.id === id ? { ...pos, ...updates } : pos
    ))
  }

  // Alerts management handlers
  const handleAddAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    
    setAlerts(prev => [...prev, newAlert])
    toast({
      title: "Alert Created",
      description: `Alert set for ${alert.symbol} ${alert.condition} ₹${alert.value}`,
    })
  }

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
    toast({
      title: "Alert Removed",
      description: "Alert has been deleted",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-glow mb-4">
            <div className="h-12 w-12 bg-accent rounded-full mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Trading Dashboard</h2>
          <p className="text-muted-foreground">Initializing market data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N50</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient mb-2">
              Nifty 50 Swing Assistant
            </h1>
            <p className="text-muted-foreground">
              Institutional-grade trading intelligence for swing trades
            </p>
          </div>
          
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-lg font-semibold mb-4">Please Sign In</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Access professional trading recommendations and market analysis
            </p>
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        marketData={marketData}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        dataSource={dataSource}
      />
      
      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommendations" className="space-y-6">
            {recommendations.length > 0 ? (
              <StockRecommendationsTable 
                recommendations={recommendations}
                onStockSelect={handleStockSelect}
              />
            ) : (
              <EmptyDataState 
                dataSource={dataSource}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-6">
            <TechnicalAnalysisPanel 
              indicators={technicalIndicators}
              marketStrength={75}
            />
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <AdvancedIndicators />
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-6">
            <AdvancedCharting selectedStock="RELIANCE" />
          </TabsContent>
          
          <TabsContent value="signals" className="space-y-6">
            <AutomatedSignals />
          </TabsContent>
          
          <TabsContent value="portfolio" className="space-y-6">
            <PortfolioTracker 
              positions={portfolioPositions}
              onAddPosition={handleAddPosition}
              onRemovePosition={handleRemovePosition}
              onUpdatePosition={handleUpdatePosition}
            />
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-6">
            <AlertsPanel 
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onRemoveAlert={handleRemoveAlert}
            />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EnhancedNewsPanel 
                  onNewsClick={handleNewsClick}
                />
              </div>
              <div className="space-y-6">
                {/* Status Panel */}
                <StatusPanel 
                  isRefreshing={isRefreshing}
                  lastUpdated={marketData.lastUpdated}
                  onRefresh={handleRefresh}
                />
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <h3 className="font-medium mb-2">Market Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Active Recommendations</span>
                        <span className="font-medium">{recommendations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Confidence</span>
                        <span className="font-medium">
                          {recommendations.length > 0 ? Math.round(recommendations.reduce((acc, r) => acc + r.confidenceScore, 0) / recommendations.length) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg R:R Ratio</span>
                        <span className="font-medium">
                          {recommendations.length > 0 ? (recommendations.reduce((acc, r) => acc + r.riskRewardRatio, 0) / recommendations.length).toFixed(1) : 0}:1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backtest" className="space-y-6">
            <BacktestingPanel 
              recommendations={recommendations}
            />
          </TabsContent>
          
          <TabsContent value="risk" className="space-y-6">
            <RiskManagementPanel 
              portfolioPositions={portfolioPositions}
              recommendations={recommendations}
            />
          </TabsContent>
          
          <TabsContent value="filters" className="space-y-6">
            <AdvancedFilters 
              recommendations={recommendations}
              onFilteredResults={setFilteredRecommendations}
            />
            {filteredRecommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Filtered Results ({filteredRecommendations.length} stocks)
                </h3>
                <StockRecommendationsTable 
                  recommendations={filteredRecommendations}
                  onStockSelect={handleStockSelect}
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            <ExportPanel 
              recommendations={recommendations}
              positions={portfolioPositions}
              alerts={alerts}
            />
          </TabsContent>
        </Tabs>
      </main>
      <Toaster />
    </div>
  )
}

export default App