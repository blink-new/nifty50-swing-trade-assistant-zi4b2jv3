import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, CandlestickChart, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap } from 'lucide-react'

interface ChartData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  rsi: number
  macd: number
  signal: number
  sma20: number
  sma50: number
  sma200: number
}

interface TradingSignal {
  id: string
  type: 'BUY' | 'SELL' | 'HOLD'
  strength: number
  timestamp: string
  price: number
  reason: string
  confidence: number
}

interface AdvancedChartingProps {
  selectedStock?: string
}

const AdvancedCharting: React.FC<AdvancedChartingProps> = ({ selectedStock = 'RELIANCE' }) => {
  const [chartType, setChartType] = useState<'candlestick' | 'line' | 'area'>('candlestick')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M')
  const [indicators, setIndicators] = useState<string[]>(['SMA20', 'SMA50', 'RSI'])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate realistic chart data
  const generateChartData = (stock: string, timeframe: string): ChartData[] => {
    const days = timeframe === '1D' ? 1 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : timeframe === '3M' ? 90 : 365
    const data: ChartData[] = []
    let basePrice = 2500 + Math.random() * 1000 // Random base price between 2500-3500
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      
      // Generate realistic price movement
      const volatility = 0.02 + Math.random() * 0.03 // 2-5% daily volatility
      const trend = Math.sin(i / 10) * 0.01 // Slight trending component
      const randomChange = (Math.random() - 0.5) * volatility + trend
      
      const open = basePrice
      const close = open * (1 + randomChange)
      const high = Math.max(open, close) * (1 + Math.random() * 0.02)
      const low = Math.min(open, close) * (1 - Math.random() * 0.02)
      const volume = 1000000 + Math.random() * 5000000
      
      // Calculate technical indicators
      const rsi = 30 + Math.random() * 40 // RSI between 30-70
      const macd = (Math.random() - 0.5) * 20
      const signal = macd * 0.8 + (Math.random() - 0.5) * 5
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(volume),
        rsi: Math.round(rsi * 100) / 100,
        macd: Math.round(macd * 100) / 100,
        signal: Math.round(signal * 100) / 100,
        sma20: Math.round((basePrice * 0.98 + Math.random() * basePrice * 0.04) * 100) / 100,
        sma50: Math.round((basePrice * 0.96 + Math.random() * basePrice * 0.08) * 100) / 100,
        sma200: Math.round((basePrice * 0.92 + Math.random() * basePrice * 0.16) * 100) / 100
      })
      
      basePrice = close
    }
    
    return data
  }

  // Generate trading signals
  const generateTradingSignals = (data: ChartData[]): TradingSignal[] => {
    const signals: TradingSignal[] = []
    
    for (let i = 5; i < data.length; i++) {
      const current = data[i]
      const prev = data[i - 1]
      
      // MACD Bullish Crossover
      if (prev.macd < prev.signal && current.macd > current.signal && current.rsi > 50) {
        signals.push({
          id: `signal_${i}_buy`,
          type: 'BUY',
          strength: 85 + Math.random() * 10,
          timestamp: current.date,
          price: current.close,
          reason: 'MACD Bullish Crossover + RSI > 50',
          confidence: 82 + Math.random() * 15
        })
      }
      
      // Price above SMA20 and SMA50
      if (current.close > current.sma20 && current.close > current.sma50 && current.rsi < 70) {
        signals.push({
          id: `signal_${i}_momentum`,
          type: 'BUY',
          strength: 75 + Math.random() * 15,
          timestamp: current.date,
          price: current.close,
          reason: 'Price above SMA20 & SMA50, RSI not overbought',
          confidence: 78 + Math.random() * 12
        })
      }
      
      // Bearish signals
      if (current.rsi > 75 && prev.rsi <= 75) {
        signals.push({
          id: `signal_${i}_sell`,
          type: 'SELL',
          strength: 70 + Math.random() * 20,
          timestamp: current.date,
          price: current.close,
          reason: 'RSI Overbought (>75)',
          confidence: 65 + Math.random() * 20
        })
      }
    }
    
    return signals.slice(-10) // Keep only last 10 signals
  }

  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const data = generateChartData(selectedStock, timeframe)
      const signals = generateTradingSignals(data)
      
      setChartData(data)
      setTradingSignals(signals)
      setIsLoading(false)
    }
    
    loadChartData()
  }, [selectedStock, timeframe])

  const toggleIndicator = (indicator: string) => {
    setIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    )
  }

  const latestPrice = chartData[chartData.length - 1]?.close || 0
  const priceChange = chartData.length > 1 ? latestPrice - chartData[chartData.length - 2].close : 0
  const priceChangePercent = chartData.length > 1 ? (priceChange / chartData[chartData.length - 2].close) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Charting - {selectedStock}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={priceChange >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
                {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                ₹{latestPrice.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* Chart Type */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Chart:</span>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candlestick">Candlestick</SelectItem>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Timeframe:</span>
              <div className="flex gap-1">
                {['1D', '1W', '1M', '3M', '1Y'].map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(tf as any)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            {/* Indicators */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Indicators:</span>
              <div className="flex gap-1">
                {['SMA20', 'SMA50', 'SMA200', 'RSI', 'MACD'].map((indicator) => (
                  <Button
                    key={indicator}
                    variant={indicators.includes(indicator) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleIndicator(indicator)}
                  >
                    {indicator}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-96 mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
                  <Tooltip />
                  <Legend />
                  
                  {/* Price Line */}
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#1a365d" 
                    strokeWidth={2}
                    name="Price"
                    dot={false}
                  />
                  
                  {/* Moving Averages */}
                  {indicators.includes('SMA20') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma20" 
                      stroke="#00d4aa" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="SMA 20"
                      dot={false}
                    />
                  )}
                  {indicators.includes('SMA50') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma50" 
                      stroke="#f59e0b" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="SMA 50"
                      dot={false}
                    />
                  )}
                  {indicators.includes('SMA200') && (
                    <Line 
                      type="monotone" 
                      dataKey="sma200" 
                      stroke="#ef4444" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="SMA 200"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* RSI Chart */}
          {indicators.includes('RSI') && (
            <div className="h-32 mb-6">
              <h4 className="text-sm font-medium mb-2">RSI (14)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="rsi" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="RSI"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MACD Chart */}
          {indicators.includes('MACD') && (
            <div className="h-32">
              <h4 className="text-sm font-medium mb-2">MACD</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#6b7280" />
                  <Line 
                    type="monotone" 
                    dataKey="macd" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="MACD"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="signal" 
                    stroke="#f59e0b" 
                    strokeWidth={1}
                    name="Signal"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trading Signals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tradingSignals.map((signal) => (
              <div key={signal.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={signal.type === 'BUY' ? "default" : signal.type === 'SELL' ? "destructive" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {signal.type === 'BUY' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {signal.type}
                  </Badge>
                  <div>
                    <p className="font-medium">₹{signal.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{signal.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Confidence: {signal.confidence.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">{signal.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedCharting