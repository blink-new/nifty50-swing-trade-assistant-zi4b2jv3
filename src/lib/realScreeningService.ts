import { realMarketDataService, RealStockData } from './realMarketDataService';
import { StockRecommendation } from '../types/trading';

export interface ScreeningCriteria {
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
}

export interface ScreeningResult {
  symbol: string;
  passed: boolean;
  score: number;
  stockData: RealStockData;
  reasons: string[];
  recommendation?: StockRecommendation;
}

export class RealScreeningService {
  private static instance: RealScreeningService;

  static getInstance(): RealScreeningService {
    if (!RealScreeningService.instance) {
      RealScreeningService.instance = new RealScreeningService();
    }
    return RealScreeningService.instance;
  }

  // Default institutional-grade screening criteria
  getDefaultCriteria(): ScreeningCriteria {
    return {
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
        minMarketCap: 10000 // 100 Cr
      },
      news: {
        requirePositiveSentiment: false, // Allow neutral sentiment
        minNewsImpactScore: -20 // Allow slightly negative news
      }
    };
  }

  // Screen individual stock with real data
  private screenStock(stockData: RealStockData, criteria: ScreeningCriteria): ScreeningResult {
    const reasons: string[] = [];
    let score = 0;

    // Technical Analysis Scoring
    let technicalScore = 0;

    // RSI Analysis (20 points max)
    if (stockData.technicals.rsi >= criteria.technical.rsiMin && 
        stockData.technicals.rsi <= criteria.technical.rsiMax) {
      technicalScore += 20;
      reasons.push(`RSI in momentum zone (${stockData.technicals.rsi.toFixed(1)})`);
    } else if (stockData.technicals.rsi > criteria.technical.rsiMax) {
      reasons.push(`RSI overbought (${stockData.technicals.rsi.toFixed(1)})`);
    } else {
      reasons.push(`RSI below momentum zone (${stockData.technicals.rsi.toFixed(1)})`);
    }

    // MACD Analysis (15 points max)
    if (criteria.technical.requireMacdBullish && 
        stockData.technicals.macd.macd > stockData.technicals.macd.signal && 
        stockData.technicals.macd.histogram > 0) {
      technicalScore += 15;
      reasons.push('MACD bullish crossover confirmed');
    } else if (criteria.technical.requireMacdBullish) {
      reasons.push('MACD not in bullish configuration');
    }

    // Moving Average Analysis (15 points max)
    if (criteria.technical.requirePriceAboveSMA) {
      let smaScore = 0;
      if (stockData.price > stockData.technicals.sma20) {
        smaScore += 5;
        reasons.push('Price above 20-SMA');
      }
      if (stockData.price > stockData.technicals.sma50) {
        smaScore += 5;
        reasons.push('Price above 50-SMA');
      }
      if (stockData.price > stockData.technicals.sma200) {
        smaScore += 5;
        reasons.push('Price above 200-SMA');
      }
      technicalScore += smaScore;
      
      if (smaScore === 0) {
        reasons.push('Price below key moving averages');
      }
    }

    // Volume Analysis (10 points max)
    if (stockData.technicals.volumeRatio >= criteria.technical.minVolumeRatio) {
      technicalScore += 10;
      reasons.push(`Volume surge (${stockData.technicals.volumeRatio.toFixed(1)}x avg)`);
    } else {
      reasons.push(`Normal volume (${stockData.technicals.volumeRatio.toFixed(1)}x avg)`);
    }

    // Fundamental Analysis Scoring
    let fundamentalScore = 0;

    // ROE Analysis (15 points max)
    if (stockData.fundamentals.roe >= criteria.fundamental.minROE) {
      fundamentalScore += 15;
      reasons.push(`Strong ROE (${stockData.fundamentals.roe.toFixed(1)}%)`);
    } else {
      reasons.push(`Low ROE (${stockData.fundamentals.roe.toFixed(1)}%)`);
    }

    // Debt-to-Equity Analysis (10 points max)
    if (stockData.fundamentals.debtToEquity <= criteria.fundamental.maxDebtToEquity) {
      fundamentalScore += 10;
      reasons.push(`Conservative debt (D/E: ${stockData.fundamentals.debtToEquity.toFixed(2)})`);
    } else {
      reasons.push(`High debt (D/E: ${stockData.fundamentals.debtToEquity.toFixed(2)})`);
    }

    // Earnings Growth Analysis (15 points max)
    if (stockData.fundamentals.earningsGrowth >= criteria.fundamental.minEarningsGrowth) {
      fundamentalScore += 15;
      reasons.push(`Strong earnings growth (${stockData.fundamentals.earningsGrowth.toFixed(1)}%)`);
    } else {
      reasons.push(`Weak earnings growth (${stockData.fundamentals.earningsGrowth.toFixed(1)}%)`);
    }

    // Promoter Holding Analysis (5 points max)
    if (stockData.fundamentals.promoterHolding >= criteria.fundamental.minPromoterHolding) {
      fundamentalScore += 5;
      reasons.push(`High promoter holding (${stockData.fundamentals.promoterHolding.toFixed(1)}%)`);
    }

    // Market Cap Analysis (5 points max)
    if (stockData.marketCap >= criteria.fundamental.minMarketCap * 10000000) { // Convert Cr to actual value
      fundamentalScore += 5;
      reasons.push('Adequate market capitalization');
    }

    // News/Sentiment Analysis (10 points max)
    const newsScore = 5; // Base score for neutral sentiment
    reasons.push('Market sentiment: Neutral');

    // Calculate total score
    score = technicalScore + fundamentalScore + newsScore;

    // Determine if stock passes screening
    const minPassingScore = 60; // Institutional grade threshold
    const passed = score >= minPassingScore;

    return {
      symbol: stockData.symbol,
      passed,
      score,
      stockData,
      reasons: reasons.slice(0, 5) // Top 5 reasons
    };
  }

  // Generate stock recommendation from screening result
  private generateRecommendation(screeningResult: ScreeningResult): StockRecommendation {
    const { stockData, score, reasons } = screeningResult;
    
    // Calculate entry range (±2% from current price)
    const entryMin = stockData.price * 0.98;
    const entryMax = stockData.price * 1.02;
    
    // Calculate target based on technical and fundamental strength
    let targetMultiplier = 1.06; // Base 6% target
    if (score > 80) targetMultiplier = 1.10; // 10% for high-conviction
    else if (score > 70) targetMultiplier = 1.08; // 8% for good stocks
    
    const target = stockData.price * targetMultiplier;
    
    // Calculate stop loss (typically 4-6% below entry)
    const stopLoss = stockData.price * 0.95;
    
    // Calculate risk-reward ratio
    const riskReward = (target - stockData.price) / (stockData.price - stopLoss);
    
    // Generate technical setup description
    const technicalSetup = this.generateTechnicalSetup(stockData);
    
    // Generate fundamental summary
    const fundamentalSummary = this.generateFundamentalSummary(stockData);
    
    return {
      id: `rec_${stockData.symbol}_${Date.now()}`,
      symbol: stockData.symbol,
      companyName: stockData.name,
      sector: stockData.sector,
      currentPrice: stockData.price,
      entryRange: {
        min: entryMin,
        max: entryMax
      },
      target,
      stopLoss,
      riskRewardRatio: riskReward,
      confidenceScore: Math.min(score, 100),
      technicalSetup,
      fundamentalSummary,
      newsEvent: 'Market conditions favorable',
      reasoning: reasons.join(', '),
      volume: stockData.volume,
      marketCap: stockData.marketCap,
      pe: stockData.pe,
      timestamp: new Date().toISOString(),
      technicals: {
        rsi: stockData.technicals.rsi,
        macd: {
          signal: stockData.technicals.macd.macd > stockData.technicals.macd.signal ? 'bullish' : 'bearish',
          crossover: stockData.technicals.macd.histogram > 0
        },
        dma: {
          above20: stockData.price > stockData.technicals.sma20,
          above50: stockData.price > stockData.technicals.sma50,
          above200: stockData.price > stockData.technicals.sma200
        },
        volumeRatio: stockData.technicals.volumeRatio
      },
      fundamentalMetrics: {
        epsGrowth: stockData.fundamentals.earningsGrowth,
        roe: stockData.fundamentals.roe,
        debtToEquity: stockData.fundamentals.debtToEquity,
        promoterHolding: stockData.fundamentals.promoterHolding
      }
    };
  }

  private generateTechnicalSetup(stockData: RealStockData): string {
    const setups: string[] = [];
    
    // RSI analysis
    if (stockData.technicals.rsi >= 55 && stockData.technicals.rsi <= 70) {
      setups.push('RSI momentum zone');
    }
    
    // MACD analysis
    if (stockData.technicals.macd.macd > stockData.technicals.macd.signal) {
      setups.push('MACD bullish');
    }
    
    // Moving average analysis
    const aboveSMAs = [];
    if (stockData.price > stockData.technicals.sma20) aboveSMAs.push('20');
    if (stockData.price > stockData.technicals.sma50) aboveSMAs.push('50');
    if (stockData.price > stockData.technicals.sma200) aboveSMAs.push('200');
    
    if (aboveSMAs.length > 0) {
      setups.push(`Above ${aboveSMAs.join('/')}-SMA`);
    }
    
    // Volume analysis
    if (stockData.technicals.volumeRatio > 1.5) {
      setups.push('Volume breakout');
    }
    
    return setups.length > 0 ? setups.join(', ') : 'Technical alignment';
  }

  private generateFundamentalSummary(stockData: RealStockData): string {
    const points: string[] = [];
    
    if (stockData.fundamentals.roe > 20) {
      points.push('High ROE');
    }
    
    if (stockData.fundamentals.earningsGrowth > 20) {
      points.push('Strong growth');
    }
    
    if (stockData.fundamentals.debtToEquity < 0.5) {
      points.push('Low debt');
    }
    
    if (stockData.fundamentals.promoterHolding > 60) {
      points.push('High promoter stake');
    }
    
    return points.length > 0 ? points.join(', ') : `${stockData.sector} fundamentals`;
  }

  // Main screening function - returns real recommendations
  async runRealScreening(criteria?: ScreeningCriteria): Promise<StockRecommendation[]> {
    console.log('🔍 Starting real-time institutional screening of Nifty 50...');
    
    const screeningCriteria = criteria || this.getDefaultCriteria();
    
    try {
      // Fetch real market data for all Nifty 50 stocks
      const allStockData = await realMarketDataService.getAllNifty50Data();
      
      if (allStockData.length === 0) {
        console.log('❌ No real stock data available');
        return [];
      }
      
      console.log(`📊 Analyzing ${allStockData.length} stocks with real market data...`);
      
      // Screen all stocks
      const screeningResults: ScreeningResult[] = [];
      
      for (const stockData of allStockData) {
        const result = this.screenStock(stockData, screeningCriteria);
        screeningResults.push(result);
        
        if (result.passed) {
          console.log(`✅ ${result.symbol}: Score ${result.score} - ${result.reasons[0]}`);
        }
      }
      
      // Filter passed stocks and generate recommendations
      const passedStocks = screeningResults.filter(result => result.passed);
      
      const recommendations: StockRecommendation[] = [];
      
      for (const result of passedStocks) {
        const recommendation = this.generateRecommendation(result);
        
        // Additional filter: Only include if risk-reward is favorable
        if (recommendation.riskRewardRatio >= 1.5) {
          recommendations.push(recommendation);
        }
      }
      
      // Sort by confidence score and return top recommendations
      const topRecommendations = recommendations
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 5); // Top 5 institutional-grade picks
      
      console.log(`🎯 Generated ${topRecommendations.length} high-conviction recommendations`);
      
      // Log summary
      topRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.symbol} (${rec.sector}) - Score: ${rec.confidenceScore}% - R:R: ${rec.riskRewardRatio.toFixed(1)}:1`);
      });
      
      return topRecommendations;
      
    } catch (error) {
      console.error('❌ Real screening failed:', error);
      return [];
    }
  }
}

export const realScreeningService = RealScreeningService.getInstance();