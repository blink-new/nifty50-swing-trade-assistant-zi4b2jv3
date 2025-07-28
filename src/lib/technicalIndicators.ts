import { MarketDataPoint, TechnicalIndicators } from './marketDataService';

export class TechnicalAnalysis {
  // Simple Moving Average
  static calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Exponential Moving Average
  static calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstSMA);
    
    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
      ema.push(currentEMA);
    }
    
    return ema;
  }

  // Relative Strength Index
  static calculateRSI(prices: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    // Calculate RSI for the first period
    let rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));

    // Calculate RSI for remaining periods
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }

    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    // Align arrays (slowEMA starts later)
    const startIndex = slowPeriod - fastPeriod;
    const alignedFastEMA = fastEMA.slice(startIndex);
    
    // Calculate MACD line
    const macd = alignedFastEMA.map((fast, i) => fast - slowEMA[i]);
    
    // Calculate signal line (EMA of MACD)
    const signal = this.calculateEMA(macd, signalPeriod);
    
    // Calculate histogram (MACD - Signal)
    const histogramStartIndex = signalPeriod - 1;
    const histogram = macd.slice(histogramStartIndex).map((macdVal, i) => macdVal - signal[i]);
    
    return {
      macd: macd.slice(histogramStartIndex),
      signal,
      histogram
    };
  }

  // Bollinger Bands
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      upper.push(mean + (standardDeviation * stdDev));
      lower.push(mean - (standardDeviation * stdDev));
    }

    return {
      upper,
      middle: sma,
      lower
    };
  }

  // Volume analysis
  static analyzeVolume(data: MarketDataPoint[], period: number = 20): {
    avgVolume: number;
    volumeRatio: number;
    isVolumeSpike: boolean;
  } {
    if (data.length < period) {
      return { avgVolume: 0, volumeRatio: 0, isVolumeSpike: false };
    }

    const recentVolumes = data.slice(-period).map(d => d.volume);
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / period;
    const currentVolume = data[data.length - 1].volume;
    const volumeRatio = currentVolume / avgVolume;

    return {
      avgVolume,
      volumeRatio,
      isVolumeSpike: volumeRatio >= 1.5 // 1.5x above average
    };
  }

  // Support and Resistance levels
  static findSupportResistance(data: MarketDataPoint[], lookback: number = 20): {
    support: number[];
    resistance: number[];
  } {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const support: number[] = [];
    const resistance: number[] = [];

    // Find local minima (support) and maxima (resistance)
    for (let i = lookback; i < data.length - lookback; i++) {
      const currentHigh = highs[i];
      const currentLow = lows[i];
      
      // Check if current high is a local maximum
      const isLocalMax = highs.slice(i - lookback, i + lookback + 1).every(h => h <= currentHigh);
      if (isLocalMax) {
        resistance.push(currentHigh);
      }
      
      // Check if current low is a local minimum
      const isLocalMin = lows.slice(i - lookback, i + lookback + 1).every(l => l >= currentLow);
      if (isLocalMin) {
        support.push(currentLow);
      }
    }

    return { support, resistance };
  }

  // Comprehensive technical analysis
  static analyzeTechnicals(data: MarketDataPoint[]): TechnicalIndicators | null {
    if (data.length < 50) return null; // Need sufficient data

    const closes = data.map(d => d.close);
    const volumes = data.map(d => d.volume);

    // Calculate indicators
    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const sma200 = this.calculateSMA(closes, 200);
    const volumeAvg20 = this.calculateSMA(volumes, 20);
    const bollinger = this.calculateBollingerBands(closes);

    // Get latest values
    const latest = {
      rsi: rsi[rsi.length - 1] || 0,
      macd: {
        macd: macd.macd[macd.macd.length - 1] || 0,
        signal: macd.signal[macd.signal.length - 1] || 0,
        histogram: macd.histogram[macd.histogram.length - 1] || 0
      },
      sma20: sma20[sma20.length - 1] || 0,
      sma50: sma50[sma50.length - 1] || 0,
      sma200: sma200[sma200.length - 1] || 0,
      volumeAvg20: volumeAvg20[volumeAvg20.length - 1] || 0,
      bollinger: {
        upper: bollinger.upper[bollinger.upper.length - 1] || 0,
        middle: bollinger.middle[bollinger.middle.length - 1] || 0,
        lower: bollinger.lower[bollinger.lower.length - 1] || 0
      }
    };

    return latest;
  }

  // Pattern recognition
  static detectPatterns(data: MarketDataPoint[]): {
    pattern: string;
    confidence: number;
    description: string;
  }[] {
    const patterns: { pattern: string; confidence: number; description: string }[] = [];
    
    if (data.length < 10) return patterns;

    const closes = data.map(d => d.close);
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const volumes = data.map(d => d.volume);

    // Bullish Flag Pattern
    const recentCloses = closes.slice(-10);
    const isUptrend = recentCloses[0] < recentCloses[recentCloses.length - 1];
    const consolidation = Math.max(...recentCloses.slice(-5)) - Math.min(...recentCloses.slice(-5));
    const avgPrice = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
    
    if (isUptrend && consolidation < avgPrice * 0.05) {
      patterns.push({
        pattern: 'Bullish Flag',
        confidence: 0.75,
        description: 'Price consolidating after uptrend, potential breakout'
      });
    }

    // Volume Breakout
    const avgVolume = volumes.slice(-20, -1).reduce((a, b) => a + b, 0) / 19;
    const currentVolume = volumes[volumes.length - 1];
    
    if (currentVolume > avgVolume * 2) {
      patterns.push({
        pattern: 'Volume Breakout',
        confidence: 0.8,
        description: 'Significant volume spike indicating strong interest'
      });
    }

    // Cup and Handle (simplified)
    if (data.length >= 30) {
      const cupData = closes.slice(-30, -10);
      const handleData = closes.slice(-10);
      const cupLow = Math.min(...cupData);
      const cupHigh = Math.max(...cupData.slice(0, 5).concat(cupData.slice(-5)));
      const handleHigh = Math.max(...handleData);
      
      if (handleHigh < cupHigh * 0.95 && closes[closes.length - 1] > handleHigh) {
        patterns.push({
          pattern: 'Cup and Handle',
          confidence: 0.7,
          description: 'Classic bullish continuation pattern'
        });
      }
    }

    return patterns;
  }

  // Calculate confidence score for swing trading
  static calculateSwingScore(
    data: MarketDataPoint[],
    technicals: TechnicalIndicators,
    fundamentals: any
  ): number {
    let score = 0;
    const currentPrice = data[data.length - 1].close;

    // Technical scoring (40% weight)
    // RSI in momentum zone (55-70)
    if (technicals.rsi >= 55 && technicals.rsi <= 70) score += 10;
    else if (technicals.rsi > 70) score -= 5; // Overbought penalty

    // Price above moving averages
    if (currentPrice > technicals.sma20) score += 8;
    if (currentPrice > technicals.sma50) score += 6;
    if (currentPrice > technicals.sma200) score += 4;

    // MACD bullish crossover
    if (technicals.macd.macd > technicals.macd.signal && technicals.macd.histogram > 0) score += 8;

    // Volume analysis
    const volumeAnalysis = this.analyzeVolume(data);
    if (volumeAnalysis.isVolumeSpike) score += 6;

    // Pattern recognition
    const patterns = this.detectPatterns(data);
    score += patterns.length * 3;

    // Fundamental scoring (30% weight) - if available
    if (fundamentals) {
      if (fundamentals.roe > 15) score += 5;
      if (fundamentals.debtToEquity < 1) score += 5;
      if (fundamentals.earningsGrowth > 15) score += 8;
      if (fundamentals.promoterHolding > 50) score += 3;
    }

    // News/Event scoring (30% weight) - placeholder
    // This would be enhanced with actual news sentiment
    score += 5; // Base news score

    return Math.min(score, 100); // Cap at 100
  }
}