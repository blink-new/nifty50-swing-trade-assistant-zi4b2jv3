import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  Target, 
  DollarSign,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface RiskMetrics {
  portfolioValue: number
  totalRisk: number
  maxDrawdown: number
  sharpeRatio: number
  volatility: number
  beta: number
  var95: number // Value at Risk 95%
  expectedShortfall: number
}

interface RiskSettings {
  maxPositionSize: number // Percentage of portfolio
  maxSectorExposure: number // Percentage of portfolio
  stopLossPercentage: number
  maxDailyLoss: number // Percentage
  riskRewardRatio: number
  maxOpenPositions: number
  enableAutoStopLoss: boolean
  enablePositionSizing: boolean
  enableSectorLimits: boolean
}

interface RiskAlert {
  id: string
  type: 'warning' | 'critical' | 'info'
  title: string
  description: string
  timestamp: string
  acknowledged: boolean
  action?: string
}

interface RiskManagementPanelProps {
  portfolioPositions?: any[]
  recommendations?: any[]
}

export function RiskManagementPanel({ portfolioPositions = [], recommendations = [] }: RiskManagementPanelProps) {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    portfolioValue: 1250000,
    totalRisk: 15.2,
    maxDrawdown: -8.5,
    sharpeRatio: 1.34,
    volatility: 18.7,
    beta: 1.12,
    var95: -45000,
    expectedShortfall: -62000
  })

  const [riskSettings, setRiskSettings] = useState<RiskSettings>({
    maxPositionSize: 10,
    maxSectorExposure: 25,
    stopLossPercentage: 5,
    maxDailyLoss: 2,
    riskRewardRatio: 1.5,
    maxOpenPositions: 8,
    enableAutoStopLoss: true,
    enablePositionSizing: true,
    enableSectorLimits: true
  })

  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([
    {
      id: 'alert_001',
      type: 'warning',
      title: 'High Sector Concentration',
      description: 'IT sector exposure (32%) exceeds recommended limit of 25%',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      acknowledged: false,
      action: 'Reduce IT sector positions'
    },
    {
      id: 'alert_002',
      type: 'critical',
      title: 'Position Size Limit Exceeded',
      description: 'RELIANCE position (12%) exceeds maximum position size of 10%',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false,
      action: 'Trim RELIANCE position'
    },
    {
      id: 'alert_003',
      type: 'info',
      title: 'Stop Loss Triggered',
      description: 'TATAMOTORS position closed at 5% loss as per risk settings',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: true
    }
  ])

  const [selectedTimeframe, setSelectedTimeframe] = useState('1month')

  const calculateRiskScore = () => {
    let score = 100
    
    // Deduct points for high risk factors
    if (riskMetrics.totalRisk > 20) score -= 20
    else if (riskMetrics.totalRisk > 15) score -= 10
    
    if (riskMetrics.maxDrawdown < -10) score -= 15
    else if (riskMetrics.maxDrawdown < -5) score -= 5
    
    if (riskMetrics.volatility > 25) score -= 15
    else if (riskMetrics.volatility > 20) score -= 8
    
    if (riskMetrics.sharpeRatio < 1) score -= 10
    else if (riskMetrics.sharpeRatio > 1.5) score += 5
    
    return Math.max(score, 0)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' }
    if (score >= 60) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'High', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const acknowledgeAlert = (alertId: string) => {
    setRiskAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const updateRiskSetting = (key: keyof RiskSettings, value: any) => {
    setRiskSettings(prev => ({ ...prev, [key]: value }))
  }

  const riskScore = calculateRiskScore()
  const riskLevel = getRiskLevel(riskScore)

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-3xl font-bold ${riskLevel.color}`}>
                {riskScore}
              </div>
              <Badge className={`${riskLevel.bg} ${riskLevel.color}`}>
                {riskLevel.level} Risk
              </Badge>
            </div>
            <Progress value={riskScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio VaR (95%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{Math.abs(riskMetrics.var95).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Maximum 1-day loss (95% confidence)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              riskMetrics.sharpeRatio > 1.5 ? 'text-green-600' : 
              riskMetrics.sharpeRatio > 1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {riskMetrics.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {riskMetrics.maxDrawdown.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Peak-to-trough decline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Risk Alerts
          </CardTitle>
          <CardDescription>
            Active risk monitoring and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {riskAlerts.filter(alert => !alert.acknowledged).map(alert => (
              <div key={alert.id} className={`p-4 border rounded-lg ${
                alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {alert.type === 'critical' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : alert.type === 'warning' ? (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium">{alert.title}</span>
                      <Badge variant={
                        alert.type === 'critical' ? 'destructive' :
                        alert.type === 'warning' ? 'secondary' : 'default'
                      }>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    {alert.action && (
                      <p className="text-sm font-medium text-blue-600">
                        Recommended: {alert.action}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
            
            {riskAlerts.filter(alert => !alert.acknowledged).length === 0 && (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-600">All Clear</h3>
                <p className="text-sm text-muted-foreground">
                  No active risk alerts at this time
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Management Tabs */}
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Risk Settings</TabsTrigger>
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-accent" />
                Risk Management Settings
              </CardTitle>
              <CardDescription>
                Configure your risk management parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Position Sizing */}
              <div className="space-y-4">
                <h3 className="font-medium">Position Sizing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Position Size (%)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[riskSettings.maxPositionSize]}
                        onValueChange={(value) => updateRiskSetting('maxPositionSize', value[0])}
                        max={20}
                        min={1}
                        step={0.5}
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {riskSettings.maxPositionSize}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Sector Exposure (%)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[riskSettings.maxSectorExposure]}
                        onValueChange={(value) => updateRiskSetting('maxSectorExposure', value[0])}
                        max={50}
                        min={10}
                        step={1}
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {riskSettings.maxSectorExposure}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stop Loss Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Stop Loss & Risk Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Stop Loss (%)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[riskSettings.stopLossPercentage]}
                        onValueChange={(value) => updateRiskSetting('stopLossPercentage', value[0])}
                        max={15}
                        min={2}
                        step={0.5}
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {riskSettings.stopLossPercentage}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Daily Loss (%)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[riskSettings.maxDailyLoss]}
                        onValueChange={(value) => updateRiskSetting('maxDailyLoss', value[0])}
                        max={10}
                        min={0.5}
                        step={0.25}
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {riskSettings.maxDailyLoss}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk-Reward Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Risk-Reward Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Risk-Reward Ratio</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[riskSettings.riskRewardRatio]}
                        onValueChange={(value) => updateRiskSetting('riskRewardRatio', value[0])}
                        max={5}
                        min={1}
                        step={0.1}
                      />
                      <div className="text-sm text-muted-foreground">
                        Current: {riskSettings.riskRewardRatio.toFixed(1)}:1
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Open Positions</Label>
                    <Input
                      type="number"
                      value={riskSettings.maxOpenPositions}
                      onChange={(e) => updateRiskSetting('maxOpenPositions', parseInt(e.target.value))}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>

              {/* Automation Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Automation Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Stop Loss</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically place stop loss orders
                      </p>
                    </div>
                    <Switch
                      checked={riskSettings.enableAutoStopLoss}
                      onCheckedChange={(checked) => updateRiskSetting('enableAutoStopLoss', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Position Sizing</Label>
                      <p className="text-sm text-muted-foreground">
                        Auto-calculate position sizes based on risk
                      </p>
                    </div>
                    <Switch
                      checked={riskSettings.enablePositionSizing}
                      onCheckedChange={(checked) => updateRiskSetting('enablePositionSizing', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sector Limits</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce sector exposure limits
                      </p>
                    </div>
                    <Switch
                      checked={riskSettings.enableSectorLimits}
                      onCheckedChange={(checked) => updateRiskSetting('enableSectorLimits', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Portfolio Volatility</span>
                  <span className="font-medium">{riskMetrics.volatility.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Beta (vs Nifty 50)</span>
                  <span className="font-medium">{riskMetrics.beta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Shortfall</span>
                  <span className="font-medium text-red-600">
                    ₹{Math.abs(riskMetrics.expectedShortfall).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Risk Exposure</span>
                  <span className="font-medium">{riskMetrics.totalRisk.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Composition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>IT Sector</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Banking</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>FMCG</span>
                    <span>18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Auto</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Others</span>
                    <span>10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>
                Historical risk alerts and actions taken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {alert.type === 'critical' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="font-medium">{alert.title}</span>
                          <Badge variant={
                            alert.type === 'critical' ? 'destructive' :
                            alert.type === 'warning' ? 'secondary' : 'default'
                          }>
                            {alert.type}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline">Acknowledged</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}