import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Volume2,
  Target
} from 'lucide-react'
import { TechnicalIndicator } from '@/types/trading'

interface TechnicalAnalysisPanelProps {
  indicators: TechnicalIndicator[]
  marketStrength: number
}

export function TechnicalAnalysisPanel({ 
  indicators, 
  marketStrength 
}: TechnicalAnalysisPanelProps) {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'bg-success text-success-foreground'
      case 'sell': return 'bg-destructive text-destructive-foreground'
      default: return 'bg-warning text-warning-foreground'
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-3 w-3" />
      case 'sell': return <TrendingDown className="h-3 w-3" />
      default: return <Activity className="h-3 w-3" />
    }
  }

  const getMarketStrengthColor = (strength: number) => {
    if (strength >= 70) return 'text-success'
    if (strength >= 40) return 'text-warning'
    return 'text-destructive'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Market Strength Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <span>Market Strength</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Strength</span>
              <span className={`text-lg font-bold ${getMarketStrengthColor(marketStrength)}`}>
                {marketStrength}%
              </span>
            </div>
            <Progress value={marketStrength} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div className="text-sm font-medium">Bullish Signals</div>
                <div className="text-lg font-bold text-success">
                  {indicators.filter(i => i.signal === 'buy').length}
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <div className="text-sm font-medium">Bearish Signals</div>
                <div className="text-lg font-bold text-destructive">
                  {indicators.filter(i => i.signal === 'sell').length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Technical Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-accent" />
            <span>Key Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {indicators.slice(0, 6).map((indicator, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={getSignalColor(indicator.signal)}>
                    {getSignalIcon(indicator.signal)}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">{indicator.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {indicator.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {typeof indicator.value === 'number' 
                      ? indicator.value.toFixed(2) 
                      : indicator.value
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-accent" />
            <span>Volume Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">2.3x</div>
                <div className="text-xs text-muted-foreground">Avg Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">₹1,247Cr</div>
                <div className="text-xs text-muted-foreground">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">68%</div>
                <div className="text-xs text-muted-foreground">Delivery %</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Volume Surge Stocks</span>
                <Badge variant="secondary">12 stocks</Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Stocks with volume 2x+ above 20-day average
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-accent" />
            <span>Risk Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-success">2.4:1</div>
                <div className="text-xs text-muted-foreground">Avg R:R Ratio</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold text-warning">3.2%</div>
                <div className="text-xs text-muted-foreground">Avg Stop Loss</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>High Conviction (80%+)</span>
                <span className="font-medium">3 stocks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Medium Conviction (60-79%)</span>
                <span className="font-medium">2 stocks</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Conservative (40-59%)</span>
                <span className="font-medium">0 stocks</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}