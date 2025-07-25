import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@blinkdotnew/sdk";

// Initialize Blink client for server-side operations
const blink = createClient({
  projectId: Deno.env.get('BLINK_PROJECT_ID') || '',
  authRequired: false
});

interface ScreeningRequest {
  symbols?: string[];
  criteria?: {
    technical: {
      rsiMin: number;
      rsiMax: number;
      requireMacdBullish: boolean;
      requirePriceAboveSMA: boolean;
      minVolumeRatio: number;
    };
    fundamental: {
      minROE: number;
      maxDebtToEquity: number;
      minEarningsGrowth: number;
      minPromoterHolding: number;
      minMarketCap: number;
    };
    news: {
      requirePositiveSentiment: boolean;
      minNewsImpactScore: number;
    };
  };
}

interface TechnicalIndicators {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  sma200: number;
  volumeAvg20: number;
}

// Technical analysis functions
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(firstSMA);
  
  for (let i = period; i < data.length; i++) {
    const currentEMA = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(currentEMA);
  }
  
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  let rs = avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rs = avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
}

function calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(prices, 12);
  const slowEMA = calculateEMA(prices, 26);
  
  const startIndex = 26 - 12;
  const alignedFastEMA = fastEMA.slice(startIndex);
  
  const macd = alignedFastEMA.map((fast, i) => fast - slowEMA[i]);
  const signal = calculateEMA(macd, 9);
  
  const histogramStartIndex = 9 - 1;
  const histogram = macd.slice(histogramStartIndex).map((macdVal, i) => macdVal - signal[i]);
  
  return {
    macd: macd.slice(histogramStartIndex),
    signal,
    histogram
  };
}

// Fetch stock data from Yahoo Finance
async function fetchStockData(symbol: string) {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`);
    const data = await response.json();
    
    if (data.chart?.result?.[0]) {
      const result = data.chart.result[0];
      const meta = result.meta;
      const quotes = result.indicators.quote[0];
      const timestamps = result.timestamp;
      
      const historicalData = timestamps.map((timestamp: number, i: number) => ({
        timestamp: timestamp * 1000,
        open: quotes.open[i] || 0,
        high: quotes.high[i] || 0,
        low: quotes.low[i] || 0,
        close: quotes.close[i] || 0,
        volume: quotes.volume[i] || 0
      })).filter((d: any) => d.close > 0);

      return {
        symbol,
        currentPrice: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice - meta.previousClose) || 0,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
        volume: meta.regularMarketVolume || 0,
        marketCap: meta.marketCap || 0,
        pe: meta.trailingPE || 0,
        historicalData
      };
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
  }
  return null;
}

// Calculate technical indicators
function analyzeTechnicals(historicalData: any[]): TechnicalIndicators | null {
  if (historicalData.length < 50) return null;

  const closes = historicalData.map(d => d.close);
  const volumes = historicalData.map(d => d.volume);

  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);
  const volumeAvg20 = calculateSMA(volumes, 20);

  return {
    rsi: rsi[rsi.length - 1] || 0,
    macd: {
      macd: macd.macd[macd.macd.length - 1] || 0,
      signal: macd.signal[macd.signal.length - 1] || 0,
      histogram: macd.histogram[macd.histogram.length - 1] || 0
    },
    sma20: sma20[sma20.length - 1] || 0,
    sma50: sma50[sma50.length - 1] || 0,
    sma200: sma200[sma200.length - 1] || 0,
    volumeAvg20: volumeAvg20[volumeAvg20.length - 1] || 0
  };
}

// Screen individual stock
async function screenStock(symbol: string, criteria: any) {
  const stockData = await fetchStockData(symbol);
  if (!stockData || !stockData.historicalData || stockData.historicalData.length < 50) {
    return null;
  }

  const technicals = analyzeTechnicals(stockData.historicalData);
  if (!technicals) return null;

  let score = 0;
  const reasons: string[] = [];

  // Technical screening
  if (technicals.rsi >= criteria.technical.rsiMin && technicals.rsi <= criteria.technical.rsiMax) {
    score += 20;
    reasons.push(`RSI in momentum zone (${technicals.rsi.toFixed(1)})`);
  }

  if (criteria.technical.requireMacdBullish && 
      technicals.macd.macd > technicals.macd.signal && 
      technicals.macd.histogram > 0) {
    score += 15;
    reasons.push('MACD bullish crossover');
  }

  if (criteria.technical.requirePriceAboveSMA) {
    if (stockData.currentPrice > technicals.sma20) {
      score += 8;
      reasons.push('Price above 20-SMA');
    }
    if (stockData.currentPrice > technicals.sma50) {
      score += 6;
      reasons.push('Price above 50-SMA');
    }
    if (stockData.currentPrice > technicals.sma200) {
      score += 4;
      reasons.push('Price above 200-SMA');
    }
  }

  // Volume analysis
  const volumeRatio = stockData.volume / technicals.volumeAvg20;
  if (volumeRatio >= criteria.technical.minVolumeRatio) {
    score += 10;
    reasons.push(`Volume spike (${volumeRatio.toFixed(1)}x)`);
  }

  // Mock fundamental data (in real implementation, fetch from financial APIs)
  const fundamentals = {
    roe: 15 + Math.random() * 20,
    debtToEquity: 0.3 + Math.random() * 1.0,
    earningsGrowth: 10 + Math.random() * 30,
    promoterHolding: 50 + Math.random() * 30
  };

  // Fundamental screening
  if (fundamentals.roe >= criteria.fundamental.minROE) {
    score += 15;
    reasons.push(`Strong ROE (${fundamentals.roe.toFixed(1)}%)`);
  }

  if (fundamentals.debtToEquity <= criteria.fundamental.maxDebtToEquity) {
    score += 10;
    reasons.push(`Low debt (D/E: ${fundamentals.debtToEquity.toFixed(2)})`);
  }

  if (fundamentals.earningsGrowth >= criteria.fundamental.minEarningsGrowth) {
    score += 15;
    reasons.push(`Strong earnings growth (${fundamentals.earningsGrowth.toFixed(1)}%)`);
  }

  // Calculate risk-reward
  const target = stockData.currentPrice * 1.08;
  const stopLoss = stockData.currentPrice * 0.95;
  const riskReward = (target - stockData.currentPrice) / (stockData.currentPrice - stopLoss);

  if (score >= 50 && riskReward >= 1.5) {
    return {
      symbol,
      currentPrice: stockData.currentPrice,
      target,
      stopLoss,
      riskRewardRatio: riskReward,
      confidenceScore: Math.min(score, 100),
      reasons: reasons.slice(0, 3),
      technicals,
      fundamentals,
      volume: stockData.volume,
      marketCap: stockData.marketCap
    };
  }

  return null;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { symbols, criteria }: ScreeningRequest = await req.json();
    
    const defaultSymbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
      'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'NESTLEIND',
      'HCLTECH', 'BAJFINANCE', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'SUNPHARMA', 'ONGC',
      'NTPC', 'TECHM', 'POWERGRID', 'TATAMOTORS', 'BAJAJFINSV', 'DRREDDY', 'JSWSTEEL'
    ];

    const defaultCriteria = {
      technical: {
        rsiMin: 55,
        rsiMax: 70,
        requireMacdBullish: true,
        requirePriceAboveSMA: true,
        minVolumeRatio: 1.5
      },
      fundamental: {
        minROE: 15,
        maxDebtToEquity: 1.0,
        minEarningsGrowth: 15,
        minPromoterHolding: 50,
        minMarketCap: 10000
      },
      news: {
        requirePositiveSentiment: false,
        minNewsImpactScore: -20
      }
    };

    const stocksToScreen = symbols || defaultSymbols.slice(0, 10); // Limit for demo
    const screeningCriteria = criteria || defaultCriteria;

    console.log(`Screening ${stocksToScreen.length} stocks...`);

    const recommendations = [];
    
    // Process stocks in batches
    for (let i = 0; i < stocksToScreen.length; i += 3) {
      const batch = stocksToScreen.slice(i, i + 3);
      const batchPromises = batch.map(symbol => screenStock(symbol, screeningCriteria));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          recommendations.push(result.value);
        }
      });

      // Add delay between batches
      if (i + 3 < stocksToScreen.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Sort by confidence score
    const sortedRecommendations = recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 5);

    console.log(`Found ${sortedRecommendations.length} recommendations`);

    return new Response(JSON.stringify({
      success: true,
      recommendations: sortedRecommendations,
      timestamp: new Date().toISOString(),
      screened: stocksToScreen.length,
      found: sortedRecommendations.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Screening error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});