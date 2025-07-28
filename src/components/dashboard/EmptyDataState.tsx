import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface EmptyDataStateProps {
  dataSource: 'loading' | 'real' | 'simulated' | 'error'
  onRefresh: () => void
  isRefreshing: boolean
}

export function EmptyDataState({ dataSource, onRefresh, isRefreshing }: EmptyDataStateProps) {
  if (dataSource === 'loading') {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4" />
          <h3 className="text-lg font-semibold mb-2">Fetching Real Market Data</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Connecting to live market APIs to fetch institutional-grade Nifty 50 analysis...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (dataSource === 'error') {
    return (
      <Card className="w-full border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Real Market Data Unavailable</CardTitle>
          <CardDescription>
            Unable to connect to live market data APIs. This could be due to:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
              <span>API rate limits or temporary outages</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
              <span>Network connectivity issues</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-1.5 w-1.5 bg-muted-foreground rounded-full" />
              <span>Market data provider maintenance</span>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Retry Connection'}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              Real market data requires active API connections to NSE, Yahoo Finance, and Alpha Vantage
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // This shouldn't happen, but just in case
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          No market data is currently available. Please refresh to try again.
        </p>
        <Button onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardContent>
    </Card>
  )
}