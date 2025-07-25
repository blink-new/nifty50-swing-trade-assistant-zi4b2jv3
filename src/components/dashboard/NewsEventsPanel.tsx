import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { NewsItem } from '@/types/trading'
import { formatDistanceToNow } from 'date-fns'

interface NewsEventsPanelProps {
  newsItems: NewsItem[]
  onNewsClick?: (newsItem: NewsItem) => void
}

export function NewsEventsPanel({ newsItems, onNewsClick }: NewsEventsPanelProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success'
      case 'negative': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />
      case 'negative': return <TrendingDown className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/10 text-success border-success/20'
      case 'negative': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-warning/10 text-warning border-warning/20'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Newspaper className="h-5 w-5 text-accent" />
          <span>Market News & Events</span>
          <Badge variant="secondary" className="ml-auto">
            {newsItems.length} Updates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {newsItems.map((news) => (
            <div
              key={news.id}
              className="p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onNewsClick?.(news)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={getSentimentBadge(news.sentiment)}>
                    {getSentimentIcon(news.sentiment)}
                    <span className="ml-1 capitalize">{news.sentiment}</span>
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(news.timestamp), { addSuffix: true })}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              <h4 className="font-medium text-sm mb-2 line-clamp-2">
                {news.headline}
              </h4>
              
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {news.summary}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    Source: {news.source}
                  </span>
                </div>
                
                {news.relatedStocks.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {news.relatedStocks.slice(0, 3).map((stock, index) => (
                      <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                        {stock}
                      </Badge>
                    ))}
                    {news.relatedStocks.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{news.relatedStocks.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {newsItems.length === 0 && (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recent News</h3>
            <p className="text-muted-foreground text-sm">
              News and events will appear here as they become available.
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-success">
                {newsItems.filter(n => n.sentiment === 'positive').length}
              </div>
              <div className="text-xs text-muted-foreground">Positive</div>
            </div>
            <div>
              <div className="text-lg font-bold text-muted-foreground">
                {newsItems.filter(n => n.sentiment === 'neutral').length}
              </div>
              <div className="text-xs text-muted-foreground">Neutral</div>
            </div>
            <div>
              <div className="text-lg font-bold text-destructive">
                {newsItems.filter(n => n.sentiment === 'negative').length}
              </div>
              <div className="text-xs text-muted-foreground">Negative</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}