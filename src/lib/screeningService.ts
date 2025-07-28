import { marketDataService, StockQuote, TechnicalIndicators } from './marketDataService';
import { TechnicalAnalysis } from './technicalIndicators';
import { newsService, NewsArticle } from './newsService';
import { StockRecommendation } from '../types/trading';

export interface FundamentalData {
  roe: number;
  debtToEquity: number;
  earningsGrowth: number;
  promoterHolding: number;
  marketCap: number;
  pe: number;
  pbv: number;
  dividendYield: number;
  cashFlow: number;
  sector: string;
}

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

export class ScreeningService {
  private static instance: ScreeningService;
  private nifty50Symbols = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
    'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'NESTLEIND',
    'HCLTECH', 'BAJFINANCE', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'SUNPHARMA', 'ONGC',
    'NTPC', 'TECHM', 'POWERGRID', 'TATAMOTORS', 'BAJAJFINSV', 'DRREDDY', 'JSWSTEEL',
    'GRASIM', 'INDUSINDBK', 'ADANIENT', 'TATASTEEL', 'CIPLA', 'COALINDIA', 'HINDALCO',
    'BRITANNIA', 'EICHERMOT', 'HEROMOTOCO', 'UPL', 'APOLLOHOSP', 'DIVISLAB', 'TATACONSUM',
    'BAJAJ-AUTO', 'BPCL', 'ADANIPORTS', 'LTIM', 'HDFCLIFE', 'SBILIFE', 'SHRIRAMFIN'
  ];

  private sectorMapping: { [key: string]: string } = {
    'RELIANCE': 'Oil & Gas',
    'TCS': 'IT Services',
    'HDFCBANK': 'Banking',
    'INFY': 'IT Services',
    'HINDUNILVR': 'FMCG',
    'ICICIBANK': 'Banking',
    'KOTAKBANK': 'Banking',
    'BHARTIARTL': 'Telecom',
    'ITC': 'FMCG',
    'SBIN': 'Banking',
    'LT': 'Engineering',
    'ASIANPAINT': 'Paints',
    'AXISBANK': 'Banking',
    'MARUTI': 'Auto',
    'NESTLEIND': 'FMCG',
    'HCLTECH': 'IT Services',
    'BAJFINANCE': 'NBFC',
    'TITAN': 'Jewellery',
    'ULTRACEMCO': 'Cement',
    'WIPRO': 'IT Services',
    'SUNPHARMA': 'Pharma',
    'ONGC': 'Oil & Gas',
    'NTPC': 'Power',
    'TECHM': 'IT Services',
    'POWERGRID': 'Power',
    'TATAMOTORS': 'Auto',
    'BAJAJFINSV': 'Financial Services',
    'DRREDDY': 'Pharma',
    'JSWSTEEL': 'Steel',
    'GRASIM': 'Cement',
    'INDUSINDBK': 'Banking',
    'ADANIENT': 'Diversified',
    'TATASTEEL': 'Steel',
    'CIPLA': 'Pharma',
    'COALINDIA': 'Mining',
    'HINDALCO': 'Metals',
    'BRITANNIA': 'FMCG',
    'EICHERMOT': 'Auto',
    'HEROMOTOCO': 'Auto',
    'UPL': 'Chemicals',
    'APOLLOHOSP': 'Healthcare',
    'DIVISLAB': 'Pharma',
    'TATACONSUM': 'FMCG',
    'BAJAJ-AUTO': 'Auto',
    'BPCL': 'Oil & Gas',
    'ADANIPORTS': 'Infrastructure',
    'LTIM': 'IT Services',
    'HDFCLIFE': 'Insurance',
    'SBILIFE': 'Insurance',
    'SHRIRAMFIN': 'NBFC'
  };

  static getInstance(): ScreeningService {
    if (!ScreeningService.instance) {
      ScreeningService.instance = new ScreeningService();
    }
    return ScreeningService.instance;
  }

  // Default screening criteria for swing trading
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

  // Generate mock fundamental data (in real implementation, this would come from financial APIs)
  private generateFundamentalData(symbol: string, quote: StockQuote): FundamentalData {
    // Mock data generation based on symbol characteristics
    const baseROE = 12 + Math.random() * 20;
    const baseDE = 0.3 + Math.random() * 1.2;
    const baseEG = -10 + Math.random() * 40;
    const basePH = 45 + Math.random() * 30;

    // Adjust based on sector
    const sector = this.sectorMapping[symbol] || 'Diversified';
    let roeMultiplier = 1;
    let deMultiplier = 1;
    let egMultiplier = 1;

    switch (sector) {
      case 'IT Services':
        roeMultiplier = 1.3;
        deMultiplier = 0.5;
        egMultiplier = 1.2;
        break;
      case 'Banking':
        roeMultiplier = 1.1;
        deMultiplier = 3.0; // Banks have higher leverage
        egMultiplier = 0.8;
        break;
      case 'FMCG':
        roeMultiplier = 1.2;
        deMultiplier = 0.7;
        egMultiplier = 1.0;
        break;
      case 'Pharma':
        roeMultiplier = 1.4;
        deMultiplier = 0.6;
        egMultiplier = 1.3;
        break;
    }

    return {
      roe: Math.round(baseROE * roeMultiplier * 100) / 100,
      debtToEquity: Math.round(baseDE * deMultiplier * 100) / 100,
      earningsGrowth: Math.round(baseEG * egMultiplier * 100) / 100,
      promoterHolding: Math.round(basePH * 100) / 100,
      marketCap: quote.marketCap || 50000,
      pe: quote.pe || 20,
      pbv: 2 + Math.random() * 8,
      dividendYield: Math.random() * 3,
      cashFlow: 1000 + Math.random() * 5000,
      sector
    };
  }

  // Screen individual stock
  private async screenStock(symbol: string, criteria: ScreeningCriteria): Promise<{
    symbol: string;
    passed: boolean;
    score: number;
    quote: StockQuote | null;
    technicals: TechnicalIndicators | null;
    fundamentals: FundamentalData | null;
    news: NewsArticle[];
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let score = 0;

    try {
      // Get market data
      const { quote, historicalData } = await marketDataService.getStockData(symbol);
      
      if (!quote || !historicalData || historicalData.length < 50) {
        return {
          symbol,
          passed: false,
          score: 0,
          quote,
          technicals: null,
          fundamentals: null,
          news: [],
          reasons: ['Insufficient data']
        };
      }

      // Calculate technical indicators
      const technicals = TechnicalAnalysis.analyzeTechnicals(historicalData);
      if (!technicals) {
        return {
          symbol,
          passed: false,
          score: 0,
          quote,
          technicals: null,
          fundamentals: null,
          news: [],
          reasons: ['Technical analysis failed']
        };
      }

      // Generate fundamental data
      const fundamentals = this.generateFundamentalData(symbol, quote);

      // Get news data
      const stockNews = await newsService.getStockNews(symbol);
      const newsImpact = newsService.calculateNewsImpact(stockNews);

      // Technical screening
      let technicalScore = 0;
      
      // RSI check
      if (technicals.rsi >= criteria.technical.rsiMin && technicals.rsi <= criteria.technical.rsiMax) {
        technicalScore += 20;
        reasons.push(`RSI in momentum zone (${technicals.rsi.toFixed(1)})`);
      } else if (technicals.rsi > criteria.technical.rsiMax) {
        reasons.push(`RSI overbought (${technicals.rsi.toFixed(1)})`);
      } else {
        reasons.push(`RSI below momentum zone (${technicals.rsi.toFixed(1)})`);
      }

      // MACD check
      if (criteria.technical.requireMacdBullish && 
          technicals.macd.macd > technicals.macd.signal && 
          technicals.macd.histogram > 0) {
        technicalScore += 15;
        reasons.push('MACD bullish crossover');
      } else if (criteria.technical.requireMacdBullish) {
        reasons.push('MACD not bullish');
      }

      // Price above SMAs
      if (criteria.technical.requirePriceAboveSMA) {
        let smaScore = 0;
        if (quote.price > technicals.sma20) {
          smaScore += 5;
          reasons.push('Price above 20-SMA');
        }
        if (quote.price > technicals.sma50) {
          smaScore += 5;
          reasons.push('Price above 50-SMA');
        }
        if (quote.price > technicals.sma200) {
          smaScore += 5;
          reasons.push('Price above 200-SMA');
        }
        technicalScore += smaScore;
        
        if (smaScore === 0) {
          reasons.push('Price below key moving averages');
        }
      }

      // Volume check
      const volumeAnalysis = TechnicalAnalysis.analyzeVolume(historicalData);
      if (volumeAnalysis.volumeRatio >= criteria.technical.minVolumeRatio) {
        technicalScore += 10;
        reasons.push(`Volume spike (${volumeAnalysis.volumeRatio.toFixed(1)}x)`);
      } else {
        reasons.push(`Low volume (${volumeAnalysis.volumeRatio.toFixed(1)}x)`);
      }

      // Fundamental screening
      let fundamentalScore = 0;

      if (fundamentals.roe >= criteria.fundamental.minROE) {
        fundamentalScore += 15;
        reasons.push(`Strong ROE (${fundamentals.roe}%)`);
      } else {
        reasons.push(`Low ROE (${fundamentals.roe}%)`);
      }

      if (fundamentals.debtToEquity <= criteria.fundamental.maxDebtToEquity) {
        fundamentalScore += 10;
        reasons.push(`Low debt (D/E: ${fundamentals.debtToEquity})`);
      } else {
        reasons.push(`High debt (D/E: ${fundamentals.debtToEquity})`);
      }

      if (fundamentals.earningsGrowth >= criteria.fundamental.minEarningsGrowth) {
        fundamentalScore += 15;
        reasons.push(`Strong earnings growth (${fundamentals.earningsGrowth}%)`);
      } else {
        reasons.push(`Weak earnings growth (${fundamentals.earningsGrowth}%)`);
      }

      if (fundamentals.promoterHolding >= criteria.fundamental.minPromoterHolding) {
        fundamentalScore += 5;
        reasons.push(`High promoter holding (${fundamentals.promoterHolding}%)`);
      }

      if (fundamentals.marketCap >= criteria.fundamental.minMarketCap) {
        fundamentalScore += 5;
        reasons.push('Adequate market cap');
      }

      // News screening
      let newsScore = 0;
      if (newsImpact.score >= criteria.news.minNewsImpactScore) {
        newsScore += 10;
        if (newsImpact.score > 0) {
          reasons.push(`Positive news sentiment (${newsImpact.score})`);
        } else {
          reasons.push('Neutral news sentiment');
        }
      } else {
        reasons.push(`Negative news sentiment (${newsImpact.score})`);
      }

      if (newsImpact.highImpactCount > 0) {
        newsScore += 5;
        reasons.push(`${newsImpact.highImpactCount} high-impact news`);
      }

      // Calculate total score
      score = technicalScore + fundamentalScore + newsScore;

      // Determine if stock passes screening
      const minPassingScore = 50; // Minimum score to be considered
      const passed = score >= minPassingScore;

      return {
        symbol,
        passed,
        score,
        quote,
        technicals,
        fundamentals,
        news: stockNews.slice(0, 3), // Top 3 news items
        reasons
      };

    } catch (error) {
      console.error(`Error screening ${symbol}:`, error);
      return {
        symbol,
        passed: false,
        score: 0,
        quote: null,
        technicals: null,
        fundamentals: null,
        news: [],
        reasons: ['Screening error']
      };
    }
  }

  // Run screening (alias for screenAllStocks)
  async runScreening(criteria?: ScreeningCriteria): Promise<StockRecommendation[]> {
    return this.screenAllStocks(criteria);
  }

  // Screen all Nifty 50 stocks
  async screenAllStocks(criteria?: ScreeningCriteria): Promise<StockRecommendation[]> {
    const screeningCriteria = criteria || this.getDefaultCriteria();
    const recommendations: StockRecommendation[] = [];

    console.log('Starting comprehensive screening of Nifty 50 stocks...');

    // Process stocks in batches to avoid overwhelming APIs
    const batchSize = 5;
    for (let i = 0; i < this.nifty50Symbols.length; i += batchSize) {
      const batch = this.nifty50Symbols.slice(i, i + batchSize);
      
      const batchPromises = batch.map(symbol => 
        this.screenStock(symbol, screeningCriteria)
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.passed) {
          const stockData = result.value;
          
          // Calculate risk-reward ratio
          const currentPrice = stockData.quote?.price || 0;
          const target = currentPrice * 1.08; // 8% target
          const stopLoss = currentPrice * 0.95; // 5% stop loss
          const riskReward = (target - currentPrice) / (currentPrice - stopLoss);

          // Only include if risk-reward is favorable
          if (riskReward >= 1.5) {
            const recommendation: StockRecommendation = {
              id: `rec_${stockData.symbol}_${Date.now()}`,
              symbol: stockData.symbol,
              companyName: this.getCompanyName(stockData.symbol),
              sector: stockData.fundamentals?.sector || 'Unknown',
              currentPrice: currentPrice,
              entryRange: {
                min: currentPrice * 0.98,
                max: currentPrice * 1.02
              },
              target: target,
              stopLoss: stopLoss,
              riskRewardRatio: riskReward,
              confidenceScore: Math.min(stockData.score, 100),
              technicalSetup: this.generateTechnicalSetup(stockData),
              fundamentalSummary: this.generateFundamentalSummary(stockData.fundamentals),
              newsEvent: stockData.news[0]?.title || 'No recent news',
              reasoning: stockData.reasons.slice(0, 3).join(', '),
              volume: stockData.quote?.volume || 0,
              marketCap: stockData.fundamentals?.marketCap || 0,
              pe: stockData.quote?.pe || 0,
              timestamp: new Date().toISOString(),
              technicals: stockData.technicals,
              fundamentals: stockData.fundamentals,
              news: stockData.news
            };

            recommendations.push(recommendation);
          }
        }
      });

      // Add delay between batches to be respectful to APIs
      if (i + batchSize < this.nifty50Symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Sort by confidence score and return top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 5); // Top 5 recommendations

    console.log(`Screening complete. Found ${sortedRecommendations.length} high-conviction opportunities.`);

    return sortedRecommendations;
  }

  private generateTechnicalSetup(stockData: any): string {
    const setups: string[] = [];
    
    if (stockData.technicals) {
      if (stockData.technicals.rsi >= 55 && stockData.technicals.rsi <= 70) {
        setups.push('RSI momentum');
      }
      if (stockData.technicals.macd.macd > stockData.technicals.macd.signal) {
        setups.push('MACD bullish');
      }
      if (stockData.quote?.price > stockData.technicals.sma20) {
        setups.push('Above 20-SMA');
      }
    }

    const volumeAnalysis = TechnicalAnalysis.analyzeVolume(stockData.historicalData || []);
    if (volumeAnalysis.isVolumeSpike) {
      setups.push('Volume breakout');
    }

    return setups.join(', ') || 'Technical alignment';
  }

  private generateFundamentalSummary(fundamentals: FundamentalData | null): string {
    if (!fundamentals) return 'Strong fundamentals';

    const points: string[] = [];
    
    if (fundamentals.roe > 20) points.push('High ROE');
    if (fundamentals.earningsGrowth > 20) points.push('Strong growth');
    if (fundamentals.debtToEquity < 0.5) points.push('Low debt');
    
    return points.join(', ') || `${fundamentals.sector} leader`;
  }

  private getCompanyName(symbol: string): string {
    const companyMap: { [key: string]: string } = {
      'RELIANCE': 'Reliance Industries Ltd.',
      'TCS': 'Tata Consultancy Services Ltd.',
      'HDFCBANK': 'HDFC Bank Ltd.',
      'INFY': 'Infosys Ltd.',
      'HINDUNILVR': 'Hindustan Unilever Ltd.',
      'ICICIBANK': 'ICICI Bank Ltd.',
      'KOTAKBANK': 'Kotak Mahindra Bank Ltd.',
      'BHARTIARTL': 'Bharti Airtel Ltd.',
      'ITC': 'ITC Ltd.',
      'SBIN': 'State Bank of India',
      'LT': 'Larsen & Toubro Ltd.',
      'ASIANPAINT': 'Asian Paints Ltd.',
      'AXISBANK': 'Axis Bank Ltd.',
      'MARUTI': 'Maruti Suzuki India Ltd.',
      'NESTLEIND': 'Nestle India Ltd.',
      'HCLTECH': 'HCL Technologies Ltd.',
      'BAJFINANCE': 'Bajaj Finance Ltd.',
      'TITAN': 'Titan Company Ltd.',
      'ULTRACEMCO': 'UltraTech Cement Ltd.',
      'WIPRO': 'Wipro Ltd.'
    };

    return companyMap[symbol] || `${symbol} Ltd.`;
  }

  // Get sector-wise analysis
  async getSectorAnalysis(): Promise<{
    sector: string;
    stockCount: number;
    avgScore: number;
    topStock: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
  }[]> {
    const sectorData: { [key: string]: { scores: number[]; stocks: string[] } } = {};

    // Group stocks by sector
    this.nifty50Symbols.forEach(symbol => {
      const sector = this.sectorMapping[symbol] || 'Diversified';
      if (!sectorData[sector]) {
        sectorData[sector] = { scores: [], stocks: [] };
      }
      sectorData[sector].stocks.push(symbol);
    });

    // For demo purposes, generate mock sector analysis
    const sectorAnalysis = Object.entries(sectorData).map(([sector, data]) => {
      const avgScore = 60 + Math.random() * 30; // Mock average score
      const sentiment = avgScore > 75 ? 'bullish' : avgScore < 50 ? 'bearish' : 'neutral';
      
      return {
        sector,
        stockCount: data.stocks.length,
        avgScore: Math.round(avgScore),
        topStock: data.stocks[0],
        sentiment: sentiment as 'bullish' | 'bearish' | 'neutral'
      };
    });

    return sectorAnalysis.sort((a, b) => b.avgScore - a.avgScore);
  }
}

export const screeningService = ScreeningService.getInstance();