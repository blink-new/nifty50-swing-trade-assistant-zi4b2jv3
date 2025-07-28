import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Table, BarChart3, Calendar, Filter } from 'lucide-react'
import { StockRecommendation, PortfolioPosition, Alert } from '@/types/trading'

interface ExportPanelProps {
  recommendations: StockRecommendation[]
  positions: PortfolioPosition[]
  alerts: Alert[]
}

const ExportPanel: React.FC<ExportPanelProps> = ({ recommendations, positions, alerts }) => {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('recommendations')
  const [includeCharts, setIncludeCharts] = useState(false)
  const [dateRange, setDateRange] = useState('7d')
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    { value: 'recommendations', label: 'Stock Recommendations', icon: BarChart3, count: recommendations.length },
    { value: 'portfolio', label: 'Portfolio Positions', icon: Table, count: positions.length },
    { value: 'alerts', label: 'Active Alerts', icon: Filter, count: alerts.length },
    { value: 'performance', label: 'Performance Report', icon: Calendar, count: 1 }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV Spreadsheet', description: 'Excel-compatible format' },
    { value: 'pdf', label: 'PDF Report', description: 'Professional document' },
    { value: 'json', label: 'JSON Data', description: 'Raw data format' }
  ]

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '')]
        return typeof value === 'string' ? `"${value}"` : value
      }).join(','))
    ].join('\n')
    
    return csvContent
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      
      if (exportType === 'recommendations') {
        const headers = ['Symbol', 'Company Name', 'Sector', 'Entry Min', 'Entry Max', 'Target', 'Stop Loss', 'Risk Reward', 'Confidence', 'Technical Setup', 'Fundamental Summary']
        const data = recommendations.map(rec => ({
          symbol: rec.symbol,
          companyname: rec.companyName,
          sector: rec.sector,
          entrymin: rec.entryRange.min,
          entrymax: rec.entryRange.max,
          target: rec.target,
          stoploss: rec.stopLoss,
          riskreward: rec.riskReward,
          confidence: `${rec.confidence}%`,
          technicalsetup: rec.technicals,
          fundamentalsummary: rec.fundamentalSummary
        }))
        
        if (exportFormat === 'csv') {
          const csv = generateCSV(data, headers)
          downloadFile(csv, `nifty50-recommendations-${timestamp}.csv`, 'text/csv')
        }
      } else if (exportType === 'portfolio') {
        const headers = ['Symbol', 'Quantity', 'Entry Price', 'Current Price', 'P&L', 'P&L %', 'Target', 'Stop Loss', 'Status']
        const data = positions.map(pos => ({
          symbol: pos.symbol,
          quantity: pos.quantity,
          entryprice: pos.entryPrice,
          currentprice: pos.currentPrice,
          pl: pos.pnl,
          'pl%': pos.pnlPercentage,
          target: pos.target,
          stoploss: pos.stopLoss,
          status: pos.status
        }))
        
        if (exportFormat === 'csv') {
          const csv = generateCSV(data, headers)
          downloadFile(csv, `portfolio-positions-${timestamp}.csv`, 'text/csv')
        }
      } else if (exportType === 'alerts') {
        const headers = ['Symbol', 'Type', 'Condition', 'Target Value', 'Current Value', 'Status', 'Created']
        const data = alerts.map(alert => ({
          symbol: alert.symbol,
          type: alert.type,
          condition: alert.condition,
          targetvalue: alert.targetValue,
          currentvalue: alert.currentValue,
          status: alert.isActive ? 'Active' : 'Inactive',
          created: new Date(alert.createdAt).toLocaleDateString()
        }))
        
        if (exportFormat === 'csv') {
          const csv = generateCSV(data, headers)
          downloadFile(csv, `trading-alerts-${timestamp}.csv`, 'text/csv')
        }
      }
      
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Trading Data
          </CardTitle>
          <CardDescription>
            Export your trading analysis, portfolio, and alerts in various formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Select Data to Export</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      exportType === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportType(option.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">{option.count}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Export Format</label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-sm text-gray-500">{format.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <label className="text-sm font-medium block">Additional Options</label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts" 
                checked={includeCharts}
                onCheckedChange={setIncludeCharts}
              />
              <label htmlFor="charts" className="text-sm">
                Include charts and visualizations (PDF only)
              </label>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
              size="lg"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {exportOptions.find(opt => opt.value === exportType)?.label}
                </>
              )}
            </Button>
          </div>

          {/* Export Statistics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{recommendations.length}</div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{positions.length}</div>
              <div className="text-sm text-gray-600">Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{alerts.length}</div>
              <div className="text-sm text-gray-600">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ExportPanel