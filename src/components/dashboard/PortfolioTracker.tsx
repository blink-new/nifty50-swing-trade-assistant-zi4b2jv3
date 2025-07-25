import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  X, 
  PieChart, 
  DollarSign,
  Target,
  AlertCircle
} from 'lucide-react';
import { PortfolioPosition } from '@/types/trading';

interface PortfolioTrackerProps {
  positions: PortfolioPosition[];
  onAddPosition: (position: Omit<PortfolioPosition, 'id' | 'currentPrice' | 'pnl' | 'pnlPercent'>) => void;
  onRemovePosition: (id: string) => void;
  onUpdatePosition: (id: string, updates: Partial<PortfolioPosition>) => void;
}

export const PortfolioTracker: React.FC<PortfolioTrackerProps> = ({
  positions,
  onAddPosition,
  onRemovePosition,
  onUpdatePosition
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    quantity: '',
    entryPrice: '',
    targetPrice: '',
    stopLoss: ''
  });

  const handleAddPosition = () => {
    if (newPosition.symbol && newPosition.quantity && newPosition.entryPrice) {
      onAddPosition({
        symbol: newPosition.symbol.toUpperCase(),
        quantity: parseInt(newPosition.quantity),
        entryPrice: parseFloat(newPosition.entryPrice),
        targetPrice: newPosition.targetPrice ? parseFloat(newPosition.targetPrice) : undefined,
        stopLoss: newPosition.stopLoss ? parseFloat(newPosition.stopLoss) : undefined,
        entryDate: new Date().toISOString()
      });
      setNewPosition({
        symbol: '',
        quantity: '',
        entryPrice: '',
        targetPrice: '',
        stopLoss: ''
      });
      setShowAddForm(false);
    }
  };

  // Calculate portfolio metrics
  const totalInvestment = (positions || []).reduce((sum, pos) => sum + (pos.entryPrice * pos.quantity), 0);
  const totalCurrentValue = (positions || []).reduce((sum, pos) => sum + (pos.currentPrice * pos.quantity), 0);
  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

  const winners = (positions || []).filter(pos => pos.pnl > 0);
  const losers = (positions || []).filter(pos => pos.pnl < 0);

  const getPositionStatus = (position: PortfolioPosition) => {
    if (position.targetPrice && position.currentPrice >= position.targetPrice) {
      return { status: 'target-hit', color: 'bg-green-500', text: 'Target Hit' };
    }
    if (position.stopLoss && position.currentPrice <= position.stopLoss) {
      return { status: 'stop-loss', color: 'bg-red-500', text: 'Stop Loss' };
    }
    if (position.pnl > 0) {
      return { status: 'profit', color: 'bg-green-500', text: 'In Profit' };
    }
    if (position.pnl < 0) {
      return { status: 'loss', color: 'bg-red-500', text: 'In Loss' };
    }
    return { status: 'neutral', color: 'bg-gray-500', text: 'Neutral' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <PieChart className="h-5 w-5 text-accent" />
          Portfolio Tracker
        </CardTitle>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Position
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Value</span>
            </div>
            <div className="text-lg font-bold">{formatCurrency(totalCurrentValue)}</div>
            <div className="text-xs text-muted-foreground">
              Investment: {formatCurrency(totalInvestment)}
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">P&L</span>
            </div>
            <div className={`text-lg font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <div className={`text-xs ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Win/Loss Ratio */}
        <div className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Win Rate</span>
            <span className="text-sm text-muted-foreground">
              {winners.length}W / {losers.length}L
            </span>
          </div>
          <Progress 
            value={(positions || []).length > 0 ? (winners.length / (positions || []).length) * 100 : 0} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {(positions || []).length > 0 ? ((winners.length / (positions || []).length) * 100).toFixed(1) : 0}% success rate
          </div>
        </div>

        {/* Add Position Form */}
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Symbol (e.g., RELIANCE)"
                value={newPosition.symbol}
                onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newPosition.quantity}
                onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Entry Price"
                value={newPosition.entryPrice}
                onChange={(e) => setNewPosition({ ...newPosition, entryPrice: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Target (optional)"
                value={newPosition.targetPrice}
                onChange={(e) => setNewPosition({ ...newPosition, targetPrice: e.target.value })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Stop Loss (optional)"
                value={newPosition.stopLoss}
                onChange={(e) => setNewPosition({ ...newPosition, stopLoss: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddPosition}>
                Add Position
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Positions List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Positions ({(positions || []).length})</h4>
          {(positions || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No positions tracked</p>
              <p className="text-xs">Add your positions to track performance</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(positions || []).map((position) => {
                const status = getPositionStatus(position);
                return (
                  <div
                    key={position.id}
                    className="p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{position.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {position.quantity} shares
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemovePosition(position.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Entry</div>
                        <div className="font-medium">₹{position.entryPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current</div>
                        <div className="font-medium">₹{position.currentPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">P&L</div>
                        <div className={`font-medium ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(position.pnl)} ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    {(position.targetPrice || position.stopLoss) && (
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        {position.targetPrice && (
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-green-500" />
                            <span className="text-muted-foreground">Target:</span>
                            <span>₹{position.targetPrice.toFixed(2)}</span>
                          </div>
                        )}
                        {position.stopLoss && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-muted-foreground">SL:</span>
                            <span>₹{position.stopLoss.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};