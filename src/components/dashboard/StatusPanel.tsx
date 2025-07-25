import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Newspaper,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface StatusPanelProps {
  isRefreshing: boolean
  lastUpdated: string
  onRefresh: () => void
}

export function StatusPanel({ isRefreshing, lastUpdated, onRefresh }: StatusPanelProps) {
  const [systemStatus, setSystemStatus] = useState({
    marketData: 'active',
    screening: 'active', 
    newsAnalysis: 'active',
    technicalIndicators: 'active'
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground'
      case 'warning':
        return 'bg-warning text-warning-foreground'
      case 'error':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Activity className="h-5 w-5 text-accent" />
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Market Data API</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.marketData)}
              <Badge className={getStatusColor(systemStatus.marketData)}>
                {systemStatus.marketData.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Screening Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.screening)}
              <Badge className={getStatusColor(systemStatus.screening)}>
                {systemStatus.screening.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">News Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.newsAnalysis)}
              <Badge className={getStatusColor(systemStatus.newsAnalysis)}>
                {systemStatus.newsAnalysis.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Technical Indicators</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(systemStatus.technicalIndicators)}
              <Badge className={getStatusColor(systemStatus.technicalIndicators)}>
                {systemStatus.technicalIndicators.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Last Update</span>
            <span className="text-xs text-muted-foreground">
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          </div>
          
          <Button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-full"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-semibold text-accent">5min</div>
              <div className="text-muted-foreground">Auto Refresh</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-semibold text-accent">50</div>
              <div className="text-muted-foreground">Stocks Tracked</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-semibold text-accent">3-5</div>
              <div className="text-muted-foreground">Daily Picks</div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="font-semibold text-accent">1.5:1</div>
              <div className="text-muted-foreground">Min R:R</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}