import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react'

interface BacktestResult {
  id: string
  strategy: string
  period: string
  totalTrades: number
  winRate: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio: number
  avgHoldingPeriod: number
  profitFactor: number
  trades: BacktestTrade[]
  equityCurve: EquityPoint[]
  monthlyReturns: MonthlyReturn[]
}

interface BacktestTrade {
  id: string
  symbol: string
  entryDate: string
  exitDate: string
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  holdingDays: number
  reason: string
}

interface EquityPoint {
  date: string
  equity: number
  drawdown: number
}

interface MonthlyReturn {
  month: string
  return: number
  trades: number
}

interface BacktestingPanelProps {
  recommendations?: any[]
}

export function BacktestingPanel({ recommendations = [] }: BacktestingPanelProps) {
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('swing-momentum')
  const [backtestPeriod, setBacktestPeriod] = useState('1year')
  const [initialCapital, setInitialCapital] = useState('1000000')
  const [maxPositions, setMaxPositions] = useState('5')

  // Mock backtest data for demonstration
  const mockBacktestResult: BacktestResult = {
    id: 'bt_001',
    strategy: 'Swing Momentum Strategy',
    period: '1 Year (2023-2024)',
    totalTrades: 47,
    winRate: 68.1,
    totalReturn: 24.7,
    maxDrawdown: -8.3,
    sharpeRatio: 1.42,
    avgHoldingPeriod: 6.2,
    profitFactor: 2.1,
    trades: [
      {
        id: 'trade_001',
        symbol: 'RELIANCE',
        entryDate: '2024-01-15',
        exitDate: '2024-01-22',
        entryPrice: 2850,
        exitPrice: 2920,
        quantity: 35,
        pnl: 2450,
        pnlPercent: 2.46,
        holdingDays: 7,
        reason: 'Target reached'
      },
      {
        id: 'trade_002',
        symbol: 'TCS',
        entryDate: '2024-01-18',
        exitDate: '2024-01-25',
        entryPrice: 3650,
        exitPrice: 3580,
        quantity: 27,
        pnl: -1890,
        pnlPercent: -1.92,
        holdingDays: 7,
        reason: 'Stop loss hit'
      },
      {
        id: 'trade_003',
        symbol: 'HDFCBANK',
        entryDate: '2024-01-20',
        exitDate: '2024-01-28',
        entryPrice: 1580,
        exitPrice: 1650,
        quantity: 63,
        pnl: 4410,
        pnlPercent: 4.43,
        holdingDays: 8,
        reason: 'Target reached'
      }
    ],
    equityCurve: Array.from({ length: 252 }, (_, i) => ({
      date: new Date(2023, 0, 1 + i).toISOString().split('T')[0],
      equity: 1000000 + (Math.random() - 0.3) * 50000 + i * 1000,
      drawdown: Math.random() * -10
    })),
    monthlyReturns: [
      { month: 'Jan 2024', return: 3.2, trades: 4 },
      { month: 'Feb 2024', return: -1.1, trades: 3 },
      { month: 'Mar 2024', return: 5.7, trades: 5 },
      { month: 'Apr 2024', return: 2.1, trades: 4 },
      { month: 'May 2024', return: -0.8, trades: 2 },
      { month: 'Jun 2024', return: 4.3, trades: 6 }
    ]
  }

  const runBacktest = async () => {
    setIsRunning(true)
    
    // Simulate backtest execution
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setBacktestResults([mockBacktestResult])
    setIsRunning(false)
  }

  const strategies = [
    { value: 'swing-momentum', label: 'Swing Momentum Strategy' },
    { value: 'mean-reversion', label: 'Mean Reversion Strategy' },
    { value: 'breakout', label: 'Breakout Strategy' },
    { value: 'multi-factor', label: 'Multi-Factor Strategy' }
  ]

  const periods = [
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: '3years', label: '3 Years' }
  ]

  return (
    <div className="space-y-6">
      {/* Backtest Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Strategy Backtesting
          </CardTitle>
          <CardDescription>
            Test your trading strategies against historical market data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy</Label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies.map(strategy => (
                    <SelectItem key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Backtest Period</Label>
              <Select value={backtestPeriod} onValueChange={setBacktestPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capital">Initial Capital (₹)</Label>
              <Input
                id="capital"
                value={initialCapital}
                onChange={(e) => setInitialCapital(e.target.value)}
                placeholder="1000000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="positions">Max Positions</Label>
              <Input
                id="positions"
                value={maxPositions}
                onChange={(e) => setMaxPositions(e.target.value)}
                placeholder="5"
              />
            </div>
          </div>
          
          <Button 
            onClick={runBacktest} 
            disabled={isRunning}
            className="w-full md:w-auto"
          >
            {isRunning ? 'Running Backtest...' : 'Run Backtest'}
          </Button>
        </CardContent>
      </Card>

      {/* Backtest Results */}
      {backtestResults.length > 0 && (
        <div className="space-y-6">
          {backtestResults.map(result => (
            <div key={result.id} className="space-y-6">
              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{result.strategy}</CardTitle>
                  <CardDescription>{result.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.totalReturn.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Total Return</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.winRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {result.maxDrawdown.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.totalTrades}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.avgHoldingPeriod.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Days</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.profitFactor.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Profit Factor</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        A+
                      </div>
                      <div className="text-sm text-muted-foreground">Grade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <Tabs defaultValue="equity" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                  <TabsTrigger value="trades">Trade History</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="equity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Equity Curve & Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={result.equityCurve}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'equity' ? `₹${Number(value).toLocaleString()}` : `${Number(value).toFixed(2)}%`,
                                name === 'equity' ? 'Portfolio Value' : 'Drawdown'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="equity" 
                              stroke="#00d4aa" 
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="drawdown" 
                              stroke="#ef4444" 
                              strokeWidth={1}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="trades" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trade History</CardTitle>
                      <CardDescription>
                        Detailed breakdown of all trades executed during the backtest
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.trades.map(trade => (
                          <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="font-medium">{trade.symbol}</div>
                                <div className="text-sm text-muted-foreground">
                                  {trade.entryDate} → {trade.exitDate}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Entry/Exit</div>
                                <div className="font-medium">
                                  ₹{trade.entryPrice} → ₹{trade.exitPrice}
                                </div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Quantity</div>
                                <div className="font-medium">{trade.quantity}</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Days</div>
                                <div className="font-medium">{trade.holdingDays}</div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className={`text-lg font-bold ${trade.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trade.pnl > 0 ? '+' : ''}₹{trade.pnl.toLocaleString()}
                              </div>
                              <div className={`text-sm ${trade.pnlPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                              </div>
                              <Badge variant={trade.pnl > 0 ? 'default' : 'destructive'} className="mt-1">
                                {trade.reason}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="monthly" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.monthlyReturns}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'return' ? `${Number(value).toFixed(1)}%` : value,
                                name === 'return' ? 'Monthly Return' : 'Trades'
                              ]}
                            />
                            <Bar 
                              dataKey="return" 
                              fill="#00d4aa"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analysis" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Maximum Drawdown</span>
                          <span className="font-medium text-red-600">{result.maxDrawdown.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sharpe Ratio</span>
                          <span className="font-medium">{result.sharpeRatio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Profit Factor</span>
                          <span className="font-medium">{result.profitFactor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Win Rate</span>
                          <span className="font-medium">{result.winRate.toFixed(1)}%</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Trade Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Trades</span>
                          <span className="font-medium">{result.totalTrades}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Winning Trades</span>
                          <span className="font-medium text-green-600">
                            {Math.round(result.totalTrades * result.winRate / 100)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Losing Trades</span>
                          <span className="font-medium text-red-600">
                            {result.totalTrades - Math.round(result.totalTrades * result.winRate / 100)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Holding Period</span>
                          <span className="font-medium">{result.avgHoldingPeriod.toFixed(1)} days</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      )}

      {/* Running Backtest Indicator */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-pulse-glow">
                <TrendingUp className="h-12 w-12 text-accent mx-auto" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Running Backtest...</h3>
                <p className="text-muted-foreground">
                  Analyzing historical data and executing strategy
                </p>
              </div>
              <Progress value={66} className="w-full max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}