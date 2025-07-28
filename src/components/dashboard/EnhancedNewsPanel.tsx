import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink, 
  Search, 
  Filter,
  Newspaper,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react'

interface EnhancedNewsItem {
  id: string
  title: string
  summary: string
  source: string
  timestamp: string
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number
  impact: 'high' | 'medium' | 'low'
  category: 'market' | 'sector' | 'stock' | 'economic' | 'regulatory'
  relatedStocks: string[]
  tags: string[]
  readTime: number
  credibilityScore: number
}

interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral'
  score: number
  breakdown: {
    positive: number
    negative: number
    neutral: number
  }
  trending: {
    direction: 'up' | 'down' | 'stable'
    change: number
  }
}

interface EnhancedNewsPanelProps {
  onNewsClick?: (news: EnhancedNewsItem) => void
}

// Mock enhanced news data
const mockNewsData: EnhancedNewsItem[] = [
    {
      id: 'news_001',
      title: 'RBI Maintains Repo Rate at 6.5%, Signals Cautious Stance on Inflation',
      summary: 'Reserve Bank of India keeps key policy rate unchanged for the eighth consecutive meeting, citing persistent inflation concerns and global economic uncertainties.',
      source: 'Economic Times',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      url: 'https://economictimes.com/news/economy/policy/rbi-repo-rate',
      sentiment: 'neutral',
      sentimentScore: 0.1,
      impact: 'high',
      category: 'economic',
      relatedStocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK'],
      tags: ['RBI', 'Interest Rates', 'Monetary Policy', 'Banking'],
      readTime: 3,
      credibilityScore: 95
    },
    {
      id: 'news_002',
      title: 'Reliance Industries Q3 Results Beat Estimates, Retail Segment Shows Strong Growth',
      summary: 'RIL reports 12% YoY growth in net profit driven by robust performance in retail and digital services, exceeding analyst expectations.',
      source: 'Business Standard',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      url: 'https://business-standard.com/companies/news/reliance-q3-results',
      sentiment: 'positive',
      sentimentScore: 0.7,
      impact: 'high',
      category: 'stock',
      relatedStocks: ['RELIANCE'],
      tags: ['Earnings', 'Retail', 'Digital Services', 'Q3 Results'],
      readTime: 4,
      credibilityScore: 92
    },
    {
      id: 'news_003',
      title: 'IT Sector Faces Headwinds as Global Tech Spending Slows, Analysts Downgrade Outlook',
      summary: 'Major IT companies expected to report muted growth in Q3 as enterprise clients delay technology investments amid economic uncertainty.',
      source: 'Mint',
      timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      url: 'https://livemint.com/companies/news/it-sector-headwinds',
      sentiment: 'negative',
      sentimentScore: -0.6,
      impact: 'medium',
      category: 'sector',
      relatedStocks: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM'],
      tags: ['IT Sector', 'Global Slowdown', 'Tech Spending', 'Earnings Outlook'],
      readTime: 5,
      credibilityScore: 88
    },
    {
      id: 'news_004',
      title: 'SEBI Introduces New Regulations for Algorithmic Trading, Enhanced Surveillance Measures',
      summary: 'Market regulator announces stricter norms for algo trading systems and real-time monitoring to prevent market manipulation.',
      source: 'Reuters',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      url: 'https://reuters.com/markets/india/sebi-algo-trading-regulations',
      sentiment: 'neutral',
      sentimentScore: -0.1,
      impact: 'medium',
      category: 'regulatory',
      relatedStocks: ['NSE', 'BSE'],
      tags: ['SEBI', 'Algorithmic Trading', 'Market Regulation', 'Surveillance'],
      readTime: 3,
      credibilityScore: 96
    },
    {
      id: 'news_005',
      title: 'Auto Sector Rally Continues as EV Sales Surge 45% YoY in December',
      summary: 'Electric vehicle adoption accelerates with government incentives and improved charging infrastructure driving consumer demand.',
      source: 'Financial Express',
      timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      url: 'https://financialexpress.com/auto/ev-news/auto-sector-ev-sales-surge',
      sentiment: 'positive',
      sentimentScore: 0.8,
      impact: 'medium',
      category: 'sector',
      relatedStocks: ['MARUTI', 'TATAMOTORS', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO'],
      tags: ['Auto Sector', 'Electric Vehicles', 'Sales Growth', 'Government Policy'],
      readTime: 4,
      credibilityScore: 85
    },
    {
      id: 'news_006',
      title: 'Foreign Institutional Investors Turn Net Buyers After 3 Months, Inflow Reaches ₹8,500 Cr',
      summary: 'FIIs show renewed confidence in Indian markets with significant buying in banking and IT stocks amid global risk-on sentiment.',
      source: 'Moneycontrol',
      timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
      url: 'https://moneycontrol.com/news/business/markets/fii-inflows-january',
      sentiment: 'positive',
      sentimentScore: 0.6,
      impact: 'high',
      category: 'market',
      relatedStocks: ['NIFTY50', 'SENSEX'],
      tags: ['FII Flows', 'Foreign Investment', 'Market Sentiment', 'Banking', 'IT'],
      readTime: 3,
      credibilityScore: 90
    }
  ]

export function EnhancedNewsPanel({ onNewsClick }: EnhancedNewsPanelProps) {
  const [newsItems, setNewsItems] = useState<EnhancedNewsItem[]>([])
  const [filteredNews, setFilteredNews] = useState<EnhancedNewsItem[]>([])
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: 'neutral',
    score: 52,
    breakdown: { positive: 45, negative: 25, neutral: 30 },
    trending: { direction: 'up', change: 3.2 }
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSentiment, setSelectedSentiment] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setNewsItems(mockNewsData)
    setFilteredNews(mockNewsData)
  }, [])

  useEffect(() => {
    let filtered = newsItems

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        news.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // Filter by sentiment
    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(news => news.sentiment === selectedSentiment)
    }

    setFilteredNews(filtered)
  }, [newsItems, searchTerm, selectedCategory, selectedSentiment])

  const refreshNews = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update timestamps to simulate fresh news
    const updatedNews = mockNewsData.map(news => ({
      ...news,
      timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString()
    }))
    
    setNewsItems(updatedNews)
    setIsLoading(false)
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'negative':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Sentiment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Market Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                marketSentiment.overall === 'bullish' ? 'text-green-600' :
                marketSentiment.overall === 'bearish' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {marketSentiment.score}
              </div>
              <div className="text-sm text-muted-foreground">Sentiment Score</div>
              <Badge className={`mt-1 ${
                marketSentiment.overall === 'bullish' ? 'bg-green-100 text-green-800' :
                marketSentiment.overall === 'bearish' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {marketSentiment.overall.toUpperCase()}
              </Badge>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {marketSentiment.breakdown.positive}%
              </div>
              <div className="text-sm text-muted-foreground">Positive News</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {marketSentiment.breakdown.negative}%
              </div>
              <div className="text-sm text-muted-foreground">Negative News</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {marketSentiment.breakdown.neutral}%
              </div>
              <div className="text-sm text-muted-foreground">Neutral News</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-accent" />
              Market News & Analysis
            </div>
            <Button onClick={refreshNews} disabled={isLoading} size="sm">
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news, stocks, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="sector">Sector</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="economic">Economic</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* News Items */}
          <div className="space-y-4">
            {filteredNews.map(news => (
              <Card key={news.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(news.sentiment)}
                        <Badge variant="outline" className={getSentimentColor(news.sentiment)}>
                          {news.sentiment}
                        </Badge>
                        <Badge variant="outline" className={getImpactColor(news.impact)}>
                          {news.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {news.category}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {news.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {news.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(news.timestamp)}
                        </div>
                        <div>{news.source}</div>
                        <div>{news.readTime} min read</div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          {news.credibilityScore}% credible
                        </div>
                      </div>
                      
                      {news.relatedStocks.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-muted-foreground">Related:</span>
                          <div className="flex gap-1">
                            {news.relatedStocks.slice(0, 4).map(stock => (
                              <Badge key={stock} variant="secondary" className="text-xs">
                                {stock}
                              </Badge>
                            ))}
                            {news.relatedStocks.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{news.relatedStocks.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {news.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNewsClick?.(news)}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Read
                      </Button>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          news.sentimentScore > 0 ? 'text-green-600' :
                          news.sentimentScore < 0 ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {news.sentimentScore > 0 ? '+' : ''}{(news.sentimentScore * 100).toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">sentiment</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredNews.length === 0 && (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}