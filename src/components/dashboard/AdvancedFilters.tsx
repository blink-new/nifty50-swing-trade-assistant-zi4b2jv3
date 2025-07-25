import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, X, Search, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { StockRecommendation } from '@/types/trading'

interface AdvancedFiltersProps {
  recommendations: StockRecommendation[]
  onFilteredResults: (filtered: StockRecommendation[]) => void
}

interface FilterCriteria {
  searchTerm: string
  sectors: string[]
  confidenceRange: [number, number]
  riskRewardMin: number
  marketCapRange: string
  technicalSignals: string[]
  priceRange: [number, number]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ recommendations, onFilteredResults }) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: '',
    sectors: [],
    confidenceRange: [60, 100],
    riskRewardMin: 1.5,
    marketCapRange: 'all',
    technicalSignals: [],
    priceRange: [0, 5000],
    sortBy: 'confidence',
    sortOrder: 'desc'
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const sectors = ['IT', 'Banking', 'FMCG', 'Auto', 'Pharma', 'Energy', 'Metals', 'Telecom', 'Realty', 'Cement']
  const technicalSignals = ['Bullish Breakout', 'MACD Crossover', 'RSI Momentum', 'Volume Surge', 'Support Bounce']
  const marketCapRanges = [
    { value: 'all', label: 'All Market Caps' },
    { value: 'large', label: 'Large Cap (>₹20,000 Cr)' },
    { value: 'mid', label: 'Mid Cap (₹5,000-20,000 Cr)' },
    { value: 'small', label: 'Small Cap (<₹5,000 Cr)' }
  ]

  const sortOptions = [
    { value: 'confidence', label: 'Confidence Score' },
    { value: 'riskReward', label: 'Risk-Reward Ratio' },
    { value: 'target', label: 'Target Price' },
    { value: 'companyName', label: 'Company Name' },
    { value: 'sector', label: 'Sector' }
  ]

  const applyFilters = React.useCallback(() => {
    let filtered = [...recommendations]

    // Search term filter
    if (filters.searchTerm) {
      filtered = filtered.filter(stock => 
        stock.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    // Sector filter
    if (filters.sectors.length > 0) {
      filtered = filtered.filter(stock => filters.sectors.includes(stock.sector))
    }

    // Confidence range filter
    filtered = filtered.filter(stock => 
      stock.confidence >= filters.confidenceRange[0] && 
      stock.confidence <= filters.confidenceRange[1]
    )

    // Risk-reward filter
    filtered = filtered.filter(stock => 
      parseFloat(stock.riskReward.split(':')[0]) >= filters.riskRewardMin
    )

    // Market cap filter
    if (filters.marketCapRange !== 'all') {
      filtered = filtered.filter(stock => {
        const marketCap = stock.marketCap || 0
        switch (filters.marketCapRange) {
          case 'large': return marketCap > 20000
          case 'mid': return marketCap >= 5000 && marketCap <= 20000
          case 'small': return marketCap < 5000
          default: return true
        }
      })
    }

    // Technical signals filter
    if (filters.technicalSignals.length > 0) {
      filtered = filtered.filter(stock => 
        filters.technicalSignals.some(signal => 
          stock.technicals.toLowerCase().includes(signal.toLowerCase())
        )
      )
    }

    // Price range filter
    filtered = filtered.filter(stock => {
      const avgPrice = (stock.entryRange.min + stock.entryRange.max) / 2
      return avgPrice >= filters.priceRange[0] && avgPrice <= filters.priceRange[1]
    })

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'confidence':
          aValue = a.confidence
          bValue = b.confidence
          break
        case 'riskReward':
          aValue = parseFloat(a.riskReward.split(':')[0])
          bValue = parseFloat(b.riskReward.split(':')[0])
          break
        case 'target':
          aValue = a.target
          bValue = b.target
          break
        case 'companyName':
          aValue = a.companyName
          bValue = b.companyName
          break
        case 'sector':
          aValue = a.sector
          bValue = b.sector
          break
        default:
          aValue = a.confidence
          bValue = b.confidence
      }

      if (typeof aValue === 'string') {
        return filters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    onFilteredResults(filtered)
    
    // Count active filters
    let count = 0
    if (filters.searchTerm) count++
    if (filters.sectors.length > 0) count++
    if (filters.confidenceRange[0] > 60 || filters.confidenceRange[1] < 100) count++
    if (filters.riskRewardMin > 1.5) count++
    if (filters.marketCapRange !== 'all') count++
    if (filters.technicalSignals.length > 0) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++
    
    setActiveFiltersCount(count)
  }, [filters, recommendations, onFilteredResults])

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      sectors: [],
      confidenceRange: [60, 100],
      riskRewardMin: 1.5,
      marketCapRange: 'all',
      technicalSignals: [],
      priceRange: [0, 5000],
      sortBy: 'confidence',
      sortOrder: 'desc'
    })
    setActiveFiltersCount(0)
    onFilteredResults(recommendations)
  }

  const toggleSector = (sector: string) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }))
  }

  const toggleTechnicalSignal = (signal: string) => {
    setFilters(prev => ({
      ...prev,
      technicalSignals: prev.technicalSignals.includes(signal)
        ? prev.technicalSignals.filter(s => s !== signal)
        : [...prev.technicalSignals, signal]
    }))
  }

  React.useEffect(() => {
    applyFilters()
  }, [applyFilters])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">{activeFiltersCount} active</Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Filter and sort stock recommendations based on your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search Stocks</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company name, symbol, or sector..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="text-sm font-medium mb-3 block">Sectors</label>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <Badge
                  key={sector}
                  variant={filters.sectors.includes(sector) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSector(sector)}
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>

          {/* Confidence Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Confidence Score: {filters.confidenceRange[0]}% - {filters.confidenceRange[1]}%
            </label>
            <Slider
              value={filters.confidenceRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, confidenceRange: value as [number, number] }))}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Risk-Reward Minimum */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Minimum Risk-Reward Ratio: {filters.riskRewardMin}:1
            </label>
            <Slider
              value={[filters.riskRewardMin]}
              onValueChange={(value) => setFilters(prev => ({ ...prev, riskRewardMin: value[0] }))}
              min={1.0}
              max={5.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Market Cap */}
          <div>
            <label className="text-sm font-medium mb-2 block">Market Capitalization</label>
            <Select 
              value={filters.marketCapRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, marketCapRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marketCapRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Technical Signals */}
          <div>
            <label className="text-sm font-medium mb-3 block">Technical Signals</label>
            <div className="flex flex-wrap gap-2">
              {technicalSignals.map((signal) => (
                <Badge
                  key={signal}
                  variant={filters.technicalSignals.includes(signal) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTechnicalSignal(signal)}
                >
                  {signal}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
              min={0}
              max={5000}
              step={50}
              className="w-full"
            />
          </div>

          {/* Sorting */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select 
                value={filters.sortBy} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Order</label>
              <Select 
                value={filters.sortOrder} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortOrder: value as 'asc' | 'desc' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Highest First</SelectItem>
                  <SelectItem value="asc">Lowest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing filtered results</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>High Confidence</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>Strong R:R</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  <span>Technical Edge</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedFilters