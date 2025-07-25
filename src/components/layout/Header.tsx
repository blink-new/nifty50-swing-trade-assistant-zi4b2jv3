import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw, 
  Settings,
  Moon,
  Sun,
  Wifi,
  WifiOff
} from 'lucide-react'
import { MarketOverview } from '@/types/trading'

interface HeaderProps {
  marketData: MarketOverview
  onRefresh: () => void
  isRefreshing: boolean
  dataSource?: 'loading' | 'real' | 'simulated' | 'error'
}

export function Header({ marketData, onRefresh, isRefreshing, dataSource = 'loading' }: HeaderProps) {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bg-success text-success-foreground'
      case 'bearish': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-warning text-warning-foreground'
    }
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-accent" />
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Nifty 50 Swing Assistant
                </h1>
                <p className="text-xs text-muted-foreground">
                  Institutional-Grade Trading Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">NIFTY 50</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold">
                      {marketData.nifty50.value.toLocaleString()}
                    </span>
                    {marketData.nifty50.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={marketData.nifty50.change >= 0 ? 'text-success' : 'text-destructive'}>
                    {marketData.nifty50.change >= 0 ? '+' : ''}{marketData.nifty50.change.toFixed(2)}
                  </span>
                  <span className={marketData.nifty50.change >= 0 ? 'text-success' : 'text-destructive'}>
                    ({marketData.nifty50.changePercent >= 0 ? '+' : ''}{marketData.nifty50.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="text-center">
                <Badge className={getSentimentColor(marketData.marketSentiment)}>
                  {marketData.marketSentiment.toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  A/D: {marketData.advanceDecline.advances}/{marketData.advanceDecline.declines}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Last Updated & Status */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Last updated: {new Date(marketData.lastUpdated).toLocaleString()}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />
                  <span className="text-xs text-yellow-500">Fetching Real Data...</span>
                </>
              ) : (
                <>
                  {dataSource === 'real' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">REAL Market Data</span>
                    </>
                  )}
                  {dataSource === 'loading' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="text-xs text-yellow-600">Loading APIs...</span>
                    </>
                  )}
                  {dataSource === 'error' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600">APIs Unavailable</span>
                    </>
                  )}
                  {dataSource === 'simulated' && (
                    <>
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-600">Simulated Data</span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Auto-refresh: 2min
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}