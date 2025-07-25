import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, TrendingUp, TrendingDown, Zap, Settings, Activity, Target, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface AutomatedSignal {
  id: string
  stock: string
  type: 'BUY' | 'SELL' | 'HOLD'
  strategy: string
  confidence: number
  strength: number
  entry: number
  target: number
  stopLoss: number
  riskReward: number
  timestamp: string
  status: 'active' | 'triggered' | 'expired'
  reasoning: string[]
}

interface SignalStrategy {
  id: string
  name: string
  description: string
  enabled: boolean
  successRate: number
  avgReturn: number
  maxDrawdown: number
  signals: number
}

const AutomatedSignals: React.FC = () => {
  const [signals, setSignals] = useState<AutomatedSignal[]>([])
  const [strategies, setStrategies] = useState<SignalStrategy[]>([])
  const [autoTrading, setAutoTrading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string>('')

  // Initialize strategies
  useEffect(() => {
    const initialStrategies: SignalStrategy[] = [
      {
        id: 'momentum_breakout',
        name: 'Momentum Breakout',
        description: 'Identifies stocks breaking above resistance with high volume',
        enabled: true,
        successRate: 78.5,
        avgReturn: 12.3,
        maxDrawdown: 8.2,
        signals: 156
      },
      {
        id: 'mean_reversion',
        name: 'Mean Reversion',
        description: 'Finds oversold stocks with strong fundamentals',
        enabled: true,
        successRate: 72.1,
        avgReturn: 9.8,
        maxDrawdown: 6.5,
        signals: 203
      },
      {
        id: 'trend_following',
        name: 'Trend Following',
        description: 'Follows established trends with momentum confirmation',
        enabled: false,
        successRate: 68.9,
        avgReturn: 15.7,
        maxDrawdown: 12.1,
        signals: 89
      },
      {
        id: 'gap_trading',
        name: 'Gap Trading',
        description: 'Trades gap ups/downs with volume confirmation',
        enabled: true,
        successRate: 65.4,
        avgReturn: 8.9,
        maxDrawdown: 9.8,
        signals: 134
      },
      {
        id: 'earnings_momentum',
        name: 'Earnings Momentum',
        description: 'Captures post-earnings momentum moves',
        enabled: false,
        successRate: 81.2,
        avgReturn: 18.4,
        maxDrawdown: 11.3,
        signals: 67
      }
    ]
    
    setStrategies(initialStrategies)
  }, [])

  // Generate automated signals
  const generateSignals = (): AutomatedSignal[] => {
    const nifty50Stocks = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
      'BHARTIARTL', 'ITC', 'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'MARUTI', 'HCLTECH',
      'AXISBANK', 'LT', 'DMART', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO'
    ]
    
    const strategies = ['momentum_breakout', 'mean_reversion', 'gap_trading']
    const newSignals: AutomatedSignal[] = []
    
    // Generate 3-5 new signals
    const signalCount = 3 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < signalCount; i++) {
      const stock = nifty50Stocks[Math.floor(Math.random() * nifty50Stocks.length)]
      const strategy = strategies[Math.floor(Math.random() * strategies.length)]
      const type = Math.random() > 0.7 ? 'SELL' : 'BUY'
      const entry = 2000 + Math.random() * 2000
      const confidence = 65 + Math.random() * 30
      const strength = 70 + Math.random() * 25
      
      let target, stopLoss
      if (type === 'BUY') {
        target = entry * (1.05 + Math.random() * 0.1) // 5-15% upside
        stopLoss = entry * (0.95 - Math.random() * 0.05) // 5-10% downside
      } else {
        target = entry * (0.95 - Math.random() * 0.1) // 5-15% downside
        stopLoss = entry * (1.05 + Math.random() * 0.05) // 5-10% upside
      }
      
      const riskReward = Math.abs(target - entry) / Math.abs(entry - stopLoss)
      
      const reasoning = []
      if (strategy === 'momentum_breakout') {
        reasoning.push('Price broke above 20-day resistance')
        reasoning.push('Volume 2.3x above average')
        reasoning.push('RSI showing strong momentum (68)')
      } else if (strategy === 'mean_reversion') {
        reasoning.push('Stock oversold with RSI at 32')
        reasoning.push('Strong support at current levels')
        reasoning.push('Positive earnings revision')
      } else {
        reasoning.push('Gap up with volume confirmation')
        reasoning.push('Pre-market strength')
        reasoning.push('Sector rotation into this space')
      }
      
      newSignals.push({
        id: `signal_${Date.now()}_${i}`,
        stock,
        type,
        strategy: strategy.replace('_', ' ').toUpperCase(),
        confidence: Math.round(confidence),
        strength: Math.round(strength),
        entry: Math.round(entry * 100) / 100,
        target: Math.round(target * 100) / 100,
        stopLoss: Math.round(stopLoss * 100) / 100,
        riskReward: Math.round(riskReward * 100) / 100,
        timestamp: new Date().toLocaleTimeString(),
        status: 'active',
        reasoning
      })
    }
    
    return newSignals
  }

  // Run automated scan
  const runScan = useCallback(async () => {
    setIsScanning(true)
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newSignals = generateSignals()
    setSignals(prev => [...newSignals, ...prev.slice(0, 15)]) // Keep last 15 signals
    setLastScan(new Date().toLocaleTimeString())
    setIsScanning(false)
    
    toast.success(`Generated ${newSignals.length} new trading signals`)
  }, [])

  // Auto-scan every 5 minutes when enabled
  useEffect(() => {
    if (!autoTrading) return
    
    const interval = setInterval(() => {
      runScan()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [autoTrading, runScan])

  const toggleStrategy = (strategyId: string) => {
    setStrategies(prev => prev.map(s => 
      s.id === strategyId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const executeSignal = (signalId: string) => {
    setSignals(prev => prev.map(s => 
      s.id === signalId ? { ...s, status: 'triggered' } : s
    ))
    toast.success('Signal executed successfully!')
  }

  const dismissSignal = (signalId: string) => {
    setSignals(prev => prev.filter(s => s.id !== signalId))
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automated Trading Signals
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Auto Trading:</span>
                <Switch 
                  checked={autoTrading} 
                  onCheckedChange={setAutoTrading}
                />
              </div>
              <Button 
                onClick={runScan} 
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    Scan Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{signals.filter(s => s.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Active Signals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{signals.filter(s => s.type === 'BUY').length}</p>
              <p className="text-sm text-muted-foreground">Buy Signals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{signals.filter(s => s.type === 'SELL').length}</p>
              <p className="text-sm text-muted-foreground">Sell Signals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{lastScan || 'Never'}</p>
              <p className="text-sm text-muted-foreground">Last Scan</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signals">Active Signals</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Active Signals */}
        <TabsContent value="signals" className="space-y-4">
          {signals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No Active Signals</p>
                <p className="text-muted-foreground mb-4">Run a scan to generate new trading signals</p>
                <Button onClick={runScan} disabled={isScanning}>
                  {isScanning ? 'Scanning...' : 'Start Scanning'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {signals.map((signal) => (
                <Card key={signal.id} className={`${signal.status === 'triggered' ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={signal.type === 'BUY' ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {signal.type === 'BUY' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {signal.type}
                        </Badge>
                        <h3 className="text-lg font-semibold">{signal.stock}</h3>
                        <Badge variant="outline">{signal.strategy}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Confidence: {signal.confidence}%
                        </Badge>
                        <span className="text-sm text-muted-foreground">{signal.timestamp}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Entry</p>
                        <p className="font-semibold">₹{signal.entry}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Target</p>
                        <p className="font-semibold text-green-600">₹{signal.target}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stop Loss</p>
                        <p className="font-semibold text-red-600">₹{signal.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">R:R Ratio</p>
                        <p className="font-semibold">{signal.riskReward}:1</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Strength</p>
                        <div className="flex items-center gap-2">
                          <Progress value={signal.strength} className="flex-1" />
                          <span className="text-sm">{signal.strength}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Reasoning:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {signal.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {signal.status === 'active' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => executeSignal(signal.id)}
                          className="flex items-center gap-2"
                        >
                          <Target className="h-4 w-4" />
                          Execute Trade
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => dismissSignal(signal.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Strategies */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="grid gap-4">
            {strategies.map((strategy) => (
              <Card key={strategy.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{strategy.name}</h3>
                        <Switch 
                          checked={strategy.enabled} 
                          onCheckedChange={() => toggleStrategy(strategy.id)}
                        />
                      </div>
                      <p className="text-muted-foreground">{strategy.description}</p>
                    </div>
                    <Badge variant={strategy.enabled ? "default" : "secondary"}>
                      {strategy.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-lg font-semibold text-green-600">{strategy.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Return</p>
                      <p className="text-lg font-semibold text-blue-600">{strategy.avgReturn}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                      <p className="text-lg font-semibold text-red-600">{strategy.maxDrawdown}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Signals</p>
                      <p className="text-lg font-semibold">{strategy.signals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Strategy Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">74.2%</p>
                  <p className="text-sm text-muted-foreground">Overall Success Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">13.1%</p>
                  <p className="text-sm text-muted-foreground">Average Return</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">9.2%</p>
                  <p className="text-sm text-muted-foreground">Maximum Drawdown</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Strategy Comparison</h4>
                <div className="space-y-4">
                  {strategies.map((strategy) => (
                    <div key={strategy.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{strategy.name}</p>
                        <p className="text-sm text-muted-foreground">{strategy.signals} signals generated</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{strategy.successRate}% success</p>
                        <p className="text-sm text-blue-600">{strategy.avgReturn}% avg return</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AutomatedSignals