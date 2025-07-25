import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  BarChart3,
  Info,
  ExternalLink
} from 'lucide-react'
import { StockRecommendation } from '@/types/trading'

interface StockRecommendationsTableProps {
  recommendations: StockRecommendation[]
  onStockSelect?: (stock: StockRecommendation) => void
}

export function StockRecommendationsTable({ 
  recommendations, 
  onStockSelect 
}: StockRecommendationsTableProps) {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-muted-foreground'
  }

  const getRiskRewardColor = (ratio: number) => {
    if (ratio >= 2.5) return 'text-success'
    if (ratio >= 1.5) return 'text-warning'
    return 'text-destructive'
  }

  const handleRowClick = (stock: StockRecommendation) => {
    setSelectedStock(selectedStock === stock.id ? null : stock.id)
    onStockSelect?.(stock)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <span>Top Swing Trade Recommendations</span>
          <Badge variant="secondary" className="ml-auto">
            {recommendations.length} Stocks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Entry Range</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Stop Loss</TableHead>
                <TableHead>R:R</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Technical</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recommendations.map((stock, index) => (
                <>
                  <TableRow
                    key={stock.id}
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedStock === stock.id ? 'bg-accent/10' : ''
                    }`}
                    onClick={() => handleRowClick(stock)}
                  >
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge 
                          variant={index < 3 ? 'default' : 'secondary'}
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{stock.companyName}</div>
                        <div className="text-sm text-muted-foreground">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          ₹{stock.currentPrice.toFixed(2)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {stock.sector}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        ₹{stock.entryRange.min.toFixed(2)} - ₹{stock.entryRange.max.toFixed(2)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3 text-success" />
                        <span className="text-success font-medium">₹{stock.target.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-destructive" />
                        <span className="text-destructive font-medium">₹{stock.stopLoss.toFixed(2)}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className={`font-medium ${getRiskRewardColor(stock.riskRewardRatio)}`}>
                        {stock.riskRewardRatio.toFixed(1)}:1
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={stock.confidenceScore} className="w-12 h-2" />
                        <span className={`text-sm font-medium ${getConfidenceColor(stock.confidenceScore)}`}>
                          {stock.confidenceScore}%
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          {stock.technicals.dma.above20 && (
                            <div className="w-2 h-2 bg-success rounded-full" title="Above 20 DMA" />
                          )}
                          {stock.technicals.dma.above50 && (
                            <div className="w-2 h-2 bg-success rounded-full" title="Above 50 DMA" />
                          )}
                          {stock.technicals.dma.above200 && (
                            <div className="w-2 h-2 bg-success rounded-full" title="Above 200 DMA" />
                          )}
                        </div>
                        <div className="text-xs">
                          RSI: {stock.technicals.rsi.toFixed(0)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {selectedStock === stock.id && (
                    <TableRow>
                      <TableCell colSpan={10} className="p-0">
                        <div className="p-4 bg-muted/30 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Technical Setup
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {stock.technicalSetup}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                Fundamental Summary
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {stock.fundamentalSummary}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center">
                                <Info className="h-4 w-4 mr-1" />
                                News Catalyst
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {stock.newsEvent}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium text-sm mb-2">Reason for High-Conviction Inclusion</h4>
                            <p className="text-sm text-muted-foreground">
                              {stock.reasoning}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Recommendations Available</h3>
            <p className="text-muted-foreground">
              Market analysis is in progress. Please check back in a few minutes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}