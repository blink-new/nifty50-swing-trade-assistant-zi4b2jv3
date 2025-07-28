import { blink } from './blink';

export interface MarketDataPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  volumeAvg20: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export class MarketDataService {
  private static instance: MarketDataService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data as T;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Yahoo Finance API integration
  async getYahooFinanceData(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `yahoo_${symbol}`;
    const cached = this.getCachedData<StockQuote>(cacheKey);
    if (cached) return cached;

    try {
      const response = await blink.data.fetch({
        url: `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status === 200 && response.body?.chart?.result?.[0]) {
        const result = response.body.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators.quote[0];
        
        const stockQuote: StockQuote = {
          symbol: symbol,
          price: meta.regularMarketPrice || 0,
          change: (meta.regularMarketPrice - meta.previousClose) || 0,
          changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) || 0,
          volume: meta.regularMarketVolume || 0,
          marketCap: meta.marketCap || 0,
          pe: meta.trailingPE || 0,
          dayHigh: meta.regularMarketDayHigh || 0,
          dayLow: meta.regularMarketDayLow || 0,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0
        };

        this.setCachedData(cacheKey, stockQuote);
        return stockQuote;
      }
    } catch (error) {
      console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error);
    }
    return null;
  }

  // Alpha Vantage API integration
  async getAlphaVantageData(symbol: string): Promise<MarketDataPoint[] | null> {
    const cacheKey = `alpha_${symbol}`;
    const cached = this.getCachedData<MarketDataPoint[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await blink.data.fetch({
        url: 'https://www.alphavantage.co/query',
        method: 'GET',
        query: {
          function: 'TIME_SERIES_DAILY',
          symbol: `${symbol}.NS`, // Use NSE suffix for Indian stocks
          apikey: '{{ALPHA_VANTAGE_API_KEY}}',
          outputsize: 'compact'
        }
      });

      if (response.status === 200 && response.body?.['Time Series (Daily)']) {
        const timeSeries = response.body['Time Series (Daily)'];
        const dataPoints: MarketDataPoint[] = Object.entries(timeSeries)
          .slice(0, 100) // Last 100 days
          .map(([date, data]: [string, any]) => ({
            timestamp: new Date(date).getTime(),
            open: parseFloat(data['1. open']),
            high: parseFloat(data['2. high']),
            low: parseFloat(data['3. low']),
            close: parseFloat(data['4. close']),
            volume: parseInt(data['5. volume'])
          }))
          .sort((a, b) => a.timestamp - b.timestamp);

        this.setCachedData(cacheKey, dataPoints);
        return dataPoints;
      }
    } catch (error) {
      console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
    }
    return null;
  }

  // NSE API integration (using proxy to avoid CORS)
  async getNSEData(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `nse_${symbol}`;
    const cached = this.getCachedData<StockQuote>(cacheKey);
    if (cached) return cached;

    try {
      // Using a public NSE API proxy
      const response = await blink.data.fetch({
        url: `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status === 200 && response.body) {
        const data = response.body;
        const priceInfo = data.priceInfo || {};
        
        const stockQuote: StockQuote = {
          symbol: symbol,
          price: priceInfo.lastPrice || 0,
          change: priceInfo.change || 0,
          changePercent: priceInfo.pChange || 0,
          volume: data.marketDeptOrderBook?.totalTradedVolume || 0,
          marketCap: data.securityInfo?.marketCap || 0,
          pe: priceInfo.pe || 0,
          dayHigh: priceInfo.intraDayHighLow?.max || 0,
          dayLow: priceInfo.intraDayHighLow?.min || 0,
          fiftyTwoWeekHigh: priceInfo.weekHighLow?.max || 0,
          fiftyTwoWeekLow: priceInfo.weekHighLow?.min || 0
        };

        this.setCachedData(cacheKey, stockQuote);
        return stockQuote;
      }
    } catch (error) {
      console.error(`Error fetching NSE data for ${symbol}:`, error);
    }
    return null;
  }

  // Get comprehensive stock data from multiple sources
  async getStockData(symbol: string): Promise<{
    quote: StockQuote | null;
    historicalData: MarketDataPoint[] | null;
  }> {
    const [yahooQuote, nseQuote, alphaData] = await Promise.allSettled([
      this.getYahooFinanceData(symbol),
      this.getNSEData(symbol),
      this.getAlphaVantageData(symbol)
    ]);

    // Prefer NSE data, fallback to Yahoo Finance
    let quote: StockQuote | null = null;
    if (nseQuote.status === 'fulfilled' && nseQuote.value) {
      quote = nseQuote.value;
    } else if (yahooQuote.status === 'fulfilled' && yahooQuote.value) {
      quote = yahooQuote.value;
    }

    const historicalData = alphaData.status === 'fulfilled' ? alphaData.value : null;

    return { quote, historicalData };
  }

  // Get Nifty 50 overview data (alias for getNifty50Data)
  async getNifty50Overview(): Promise<{
    price: number;
    change: number;
    changePercent: number;
  } | null> {
    const data = await this.getNifty50Data();
    if (data) {
      return {
        price: data.value,
        change: data.change,
        changePercent: data.changePercent
      };
    }
    return null;
  }

  // Get Nifty 50 index data
  async getNifty50Data(): Promise<{
    value: number;
    change: number;
    changePercent: number;
  } | null> {
    const cacheKey = 'nifty50_index';
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const response = await blink.data.fetch({
        url: 'https://www.nseindia.com/api/allIndices',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status === 200 && response.body?.data) {
        const nifty50 = response.body.data.find((index: any) => 
          index.index === 'NIFTY 50' || index.indexSymbol === 'NIFTY 50'
        );

        if (nifty50) {
          const indexData = {
            value: nifty50.last || 0,
            change: nifty50.variation || 0,
            changePercent: nifty50.percentChange || 0
          };

          this.setCachedData(cacheKey, indexData);
          return indexData;
        }
      }
    } catch (error) {
      console.error('Error fetching Nifty 50 data:', error);
    }
    return null;
  }

  // Get market status
  async getMarketStatus(): Promise<{
    isOpen: boolean;
    nextSession: string;
    timezone: string;
  }> {
    try {
      const response = await blink.data.fetch({
        url: 'https://www.nseindia.com/api/marketStatus',
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status === 200 && response.body) {
        const marketData = response.body.marketState || [];
        const equityMarket = marketData.find((market: any) => 
          market.market === 'Capital Market'
        );

        return {
          isOpen: equityMarket?.marketStatus === 'Open',
          nextSession: equityMarket?.tradeDate || '',
          timezone: 'Asia/Kolkata'
        };
      }
    } catch (error) {
      console.error('Error fetching market status:', error);
    }

    // Fallback: Check if current time is within market hours (9:15 AM - 3:30 PM IST)
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const currentTime = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    const isWeekday = istTime.getDay() >= 1 && istTime.getDay() <= 5;

    return {
      isOpen: isWeekday && currentTime >= marketOpen && currentTime <= marketClose,
      nextSession: istTime.toDateString(),
      timezone: 'Asia/Kolkata'
    };
  }
}

export const marketDataService = MarketDataService.getInstance();