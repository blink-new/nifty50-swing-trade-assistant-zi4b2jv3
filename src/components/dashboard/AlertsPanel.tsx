import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, X, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Alert } from '@/types/trading';

interface AlertsPanelProps {
  alerts: Alert[];
  onAddAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  onRemoveAlert: (id: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAddAlert,
  onRemoveAlert
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price' as 'price' | 'volume' | 'rsi',
    condition: 'above' as 'above' | 'below',
    value: '',
    message: ''
  });

  const handleAddAlert = () => {
    if (newAlert.symbol && newAlert.value) {
      onAddAlert({
        ...newAlert,
        value: parseFloat(newAlert.value),
        isActive: true,
        triggered: false
      });
      setNewAlert({
        symbol: '',
        type: 'price',
        condition: 'above',
        value: '',
        message: ''
      });
      setShowAddForm(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="h-4 w-4" />;
      case 'volume':
        return <TrendingDown className="h-4 w-4" />;
      case 'rsi':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (alert: Alert) => {
    if (alert.triggered) return 'destructive';
    if (!alert.isActive) return 'secondary';
    return 'default';
  };

  const activeAlerts = (alerts || []).filter(alert => alert.isActive && !alert.triggered);
  const triggeredAlerts = (alerts || []).filter(alert => alert.triggered);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" />
          Custom Alerts
        </CardTitle>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Alert
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Symbol (e.g., RELIANCE)"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
              />
              <select
                className="px-3 py-2 border rounded-md bg-background"
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
              >
                <option value="price">Price Alert</option>
                <option value="volume">Volume Alert</option>
                <option value="rsi">RSI Alert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="px-3 py-2 border rounded-md bg-background"
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as any })}
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
              <Input
                type="number"
                placeholder="Value"
                value={newAlert.value}
                onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
              />
            </div>
            <Input
              placeholder="Custom message (optional)"
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddAlert}>
                Create Alert
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {triggeredAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">🔔 Triggered Alerts</h4>
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5 border-destructive/20"
              >
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <div>
                    <div className="font-medium text-sm">
                      {alert.symbol} {alert.condition} ₹{alert.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {alert.message || `${alert.type} alert triggered`}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Alerts ({activeAlerts.length})</h4>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active alerts</p>
              <p className="text-xs">Create custom alerts to monitor your stocks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {alert.symbol} {alert.condition} ₹{alert.value}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.message || `${alert.type} alert`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getAlertColor(alert)} className="text-xs">
                      {alert.type}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveAlert(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Price alerts trigger when stock reaches target price</p>
            <p>• Volume alerts trigger on unusual volume activity</p>
            <p>• RSI alerts trigger on overbought/oversold conditions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};