import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
}

interface StockIndicators {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  indicators: {
    momentum: TechnicalIndicator[];
    trend: TechnicalIndicator[];
    volume: TechnicalIndicator[];
    volatility: TechnicalIndicator[];
  };
  overallSignal: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

export const AdvancedIndicators: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [stockData, setStockData] = useState<StockIndicators | null>(null);
  const [loading, setLoading] = useState(true);

  const nifty50Stocks = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
    'BHARTIARTL', 'ITC', 'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'MARUTI', 'AXISBANK',
    'LT', 'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'WIPRO', 'SUNPHARMA'
  ];

  const loadStockIndicators = async (symbol: string) => {
    try {
      setLoading(true);
      
      // Mock advanced technical indicators data
      const mockData: StockIndicators = {
        symbol,
        name: `${symbol} Ltd`,
        price: 2520,
        change: 35.50,
        changePercent: 1.43,
        indicators: {
          momentum: [
            {
              name: 'RSI (14)',
              value: 65.2,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Above 60, indicating strong momentum but not overbought'
            },
            {
              name: 'Stochastic %K',
              value: 72.8,
              signal: 'bullish',
              strength: 'strong',
              description: 'Above 70, showing strong upward momentum'
            },
            {
              name: 'Williams %R',
              value: -25.4,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Above -30, indicating bullish momentum'
            },
            {
              name: 'CCI (20)',
              value: 145.6,
              signal: 'bullish',
              strength: 'strong',
              description: 'Above 100, strong bullish momentum'
            }
          ],
          trend: [
            {
              name: 'MACD Signal',
              value: 12.5,
              signal: 'bullish',
              strength: 'strong',
              description: 'MACD line above signal line, bullish crossover'
            },
            {
              name: 'ADX (14)',
              value: 28.3,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Above 25, indicating strong trend strength'
            },
            {
              name: 'Parabolic SAR',
              value: 2485,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Below current price, trend is up'
            },
            {
              name: 'Ichimoku Cloud',
              value: 2510,
              signal: 'bullish',
              strength: 'strong',
              description: 'Price above cloud, strong bullish trend'
            }
          ],
          volume: [
            {
              name: 'Volume SMA Ratio',
              value: 1.85,
              signal: 'bullish',
              strength: 'strong',
              description: '85% above average volume, strong participation'
            },
            {
              name: 'A/D Line',
              value: 125000,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Accumulation/Distribution line trending up'
            },
            {
              name: 'OBV Trend',
              value: 2.3,
              signal: 'bullish',
              strength: 'moderate',
              description: 'On-Balance Volume showing accumulation'
            },
            {
              name: 'VWAP Position',
              value: 2505,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Price above VWAP, institutional buying'
            }
          ],
          volatility: [
            {
              name: 'Bollinger Position',
              value: 0.75,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Price in upper 75% of Bollinger Bands'
            },
            {
              name: 'ATR %',
              value: 2.1,
              signal: 'neutral',
              strength: 'moderate',
              description: 'Average True Range at 2.1%, normal volatility'
            },
            {
              name: 'Volatility Index',
              value: 18.5,
              signal: 'bullish',
              strength: 'weak',
              description: 'Low volatility, potential for breakout'
            },
            {
              name: 'Keltner Position',
              value: 0.68,
              signal: 'bullish',
              strength: 'moderate',
              description: 'Price in upper portion of Keltner Channel'
            }
          ]
        },
        overallSignal: 'bullish',
        confidence: 78
      };

      setStockData(mockData);
    } catch (error) {
      console.error('Error loading stock indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStockIndicators(selectedStock);
  }, [selectedStock]);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSignalBadge = (signal: string, strength: string) => {
    const color = signal === 'bullish' ? 'bg-green-100 text-green-800' : 
                  signal === 'bearish' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${color} border-0`}>
        {signal.toUpperCase()} ({strength})
      </Badge>
    );
  };

  const getOverallSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || !stockData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Technical Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Selector and Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Technical Analysis</CardTitle>
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {nifty50Stocks.map(stock => (
                  <SelectItem key={stock} value={stock}>{stock}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stock Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{stockData.symbol}</h3>
              <p className="text-2xl font-bold">₹{stockData.price.toLocaleString()}</p>
              <p className={`text-sm ${stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stockData.change >= 0 ? '+' : ''}₹{stockData.change} ({stockData.changePercent}%)
              </p>
            </div>

            {/* Overall Signal */}
            <div className={`p-4 rounded-lg border-2 ${getOverallSignalColor(stockData.overallSignal)}`}>
              <div className="flex items-center gap-2 mb-2">
                {getSignalIcon(stockData.overallSignal)}
                <h4 className="font-semibold">Overall Signal</h4>
              </div>
              <p className="text-lg font-bold capitalize">{stockData.overallSignal}</p>
              <p className="text-sm opacity-75">Multi-factor analysis</p>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Confidence Score</h4>
                <span className={`text-2xl font-bold ${getConfidenceColor(stockData.confidence)}`}>
                  {stockData.confidence}%
                </span>
              </div>
              <Progress value={stockData.confidence} className="h-3" />
              <p className="text-sm text-gray-600">
                Based on {Object.values(stockData.indicators || {}).flat().length} indicators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Indicators Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="momentum" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="momentum">Momentum</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="volatility">Volatility</TabsTrigger>
            </TabsList>
            
            {Object.entries(stockData.indicators || {}).map(([category, indicators]) => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid gap-4">
                  {(indicators || []).map((indicator, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getSignalIcon(indicator.signal)}
                          <h4 className="font-semibold">{indicator.name}</h4>
                          {getSignalBadge(indicator.signal, indicator.strength)}
                        </div>
                        <p className="text-sm text-gray-600">{indicator.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {typeof indicator.value === 'number' ? 
                            (indicator.value > 1000 ? indicator.value.toLocaleString() : indicator.value.toFixed(1)) : 
                            indicator.value
                          }
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {indicator.signal === 'bullish' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {indicator.signal === 'bearish' && <XCircle className="h-4 w-4 text-red-600" />}
                          {indicator.signal === 'neutral' && <AlertCircle className="h-4 w-4 text-gray-600" />}
                          <span className="text-xs text-gray-500 capitalize">{indicator.strength}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Category Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">{category.charAt(0).toUpperCase() + category.slice(1)} Summary</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">
                        Bullish: {(indicators || []).filter(i => i.signal === 'bullish').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">
                        Bearish: {(indicators || []).filter(i => i.signal === 'bearish').length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">
                        Neutral: {(indicators || []).filter(i => i.signal === 'neutral').length}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};