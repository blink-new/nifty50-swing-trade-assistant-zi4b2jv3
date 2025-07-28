import { blink } from './blink';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -1 to 1
  relevantStocks: string[];
  category: 'earnings' | 'merger' | 'regulatory' | 'general' | 'insider' | 'analyst';
  impact: 'high' | 'medium' | 'low';
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  newsCount: number;
  topStories: NewsArticle[];
}

export class NewsService {
  private static instance: NewsService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 300000; // 5 minutes cache for news

  static getInstance(): NewsService {
    if (!NewsService.instance) {
      NewsService.instance = new NewsService();
    }
    return NewsService.instance;
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

  // Sentiment analysis using simple keyword matching
  private analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral'; score: number } {
    const positiveWords = [
      'growth', 'profit', 'gain', 'rise', 'increase', 'strong', 'beat', 'exceed',
      'bullish', 'positive', 'upgrade', 'buy', 'outperform', 'expansion', 'merger',
      'acquisition', 'dividend', 'bonus', 'record', 'high', 'surge', 'rally'
    ];

    const negativeWords = [
      'loss', 'decline', 'fall', 'drop', 'weak', 'miss', 'below', 'bearish',
      'negative', 'downgrade', 'sell', 'underperform', 'concern', 'risk',
      'debt', 'lawsuit', 'investigation', 'scandal', 'low', 'crash', 'plunge'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return { sentiment: 'neutral', score: 0 };
    }

    const score = (positiveCount - negativeCount) / totalSentimentWords;
    
    if (score > 0.2) return { sentiment: 'positive', score };
    if (score < -0.2) return { sentiment: 'negative', score };
    return { sentiment: 'neutral', score };
  }

  // Extract relevant stocks from news text
  private extractRelevantStocks(text: string, nifty50Symbols: string[]): string[] {
    const relevantStocks: string[] = [];
    const textUpper = text.toUpperCase();

    nifty50Symbols.forEach(symbol => {
      if (textUpper.includes(symbol) || textUpper.includes(symbol.replace('.NS', ''))) {
        relevantStocks.push(symbol);
      }
    });

    return relevantStocks;
  }

  // Categorize news based on content
  private categorizeNews(title: string, summary: string): {
    category: NewsArticle['category'];
    impact: NewsArticle['impact'];
  } {
    const text = (title + ' ' + summary).toLowerCase();

    // High impact keywords
    const highImpactKeywords = ['earnings', 'results', 'merger', 'acquisition', 'ipo', 'split', 'bonus'];
    const mediumImpactKeywords = ['upgrade', 'downgrade', 'target', 'rating', 'analyst', 'recommendation'];
    const earningsKeywords = ['earnings', 'results', 'profit', 'revenue', 'quarterly'];
    const mergerKeywords = ['merger', 'acquisition', 'takeover', 'deal'];
    const regulatoryKeywords = ['regulatory', 'approval', 'license', 'compliance', 'investigation'];
    const insiderKeywords = ['insider', 'promoter', 'stake', 'holding', 'buy back'];

    let category: NewsArticle['category'] = 'general';
    let impact: NewsArticle['impact'] = 'low';

    // Determine category
    if (earningsKeywords.some(keyword => text.includes(keyword))) {
      category = 'earnings';
    } else if (mergerKeywords.some(keyword => text.includes(keyword))) {
      category = 'merger';
    } else if (regulatoryKeywords.some(keyword => text.includes(keyword))) {
      category = 'regulatory';
    } else if (insiderKeywords.some(keyword => text.includes(keyword))) {
      category = 'insider';
    } else if (mediumImpactKeywords.some(keyword => text.includes(keyword))) {
      category = 'analyst';
    }

    // Determine impact
    if (highImpactKeywords.some(keyword => text.includes(keyword))) {
      impact = 'high';
    } else if (mediumImpactKeywords.some(keyword => text.includes(keyword))) {
      impact = 'medium';
    }

    return { category, impact };
  }

  // Get market news (alias for scrapeFinancialNews)
  async getMarketNews(): Promise<NewsArticle[]> {
    return this.scrapeFinancialNews();
  }

  // Scrape news from multiple sources
  async scrapeFinancialNews(): Promise<NewsArticle[]> {
    const cacheKey = 'financial_news';
    const cached = this.getCachedData<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    const news: NewsArticle[] = [];
    const nifty50Symbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
      'BHARTIARTL', 'ITC', 'SBIN', 'LT', 'ASIANPAINT', 'AXISBANK', 'MARUTI', 'NESTLEIND',
      'HCLTECH', 'BAJFINANCE', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'SUNPHARMA', 'ONGC',
      'NTPC', 'TECHM', 'POWERGRID', 'TATAMOTORS', 'BAJAJFINSV', 'DRREDDY', 'JSWSTEEL',
      'GRASIM', 'INDUSINDBK', 'ADANIENT', 'TATASTEEL', 'CIPLA', 'COALINDIA', 'HINDALCO',
      'BRITANNIA', 'EICHERMOT', 'HEROMOTOCO', 'UPL', 'APOLLOHOSP', 'DIVISLAB', 'TATACONSUM',
      'BAJAJ-AUTO', 'BPCL', 'ADANIPORTS', 'LTIM', 'HDFCLIFE', 'SBILIFE', 'SHRIRAMFIN'
    ];

    try {
      // Search for Indian stock market news
      const searchResults = await blink.data.search('Indian stock market Nifty 50 earnings results', {
        type: 'news',
        limit: 20
      });

      if (searchResults.news_results) {
        searchResults.news_results.forEach((article: any, index: number) => {
          const sentiment = this.analyzeSentiment(article.title + ' ' + (article.snippet || ''));
          const relevantStocks = this.extractRelevantStocks(article.title + ' ' + (article.snippet || ''), nifty50Symbols);
          const { category, impact } = this.categorizeNews(article.title, article.snippet || '');

          news.push({
            id: `news_${Date.now()}_${index}`,
            title: article.title,
            summary: article.snippet || '',
            url: article.link,
            source: article.source || 'Unknown',
            publishedAt: article.date || new Date().toISOString(),
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            relevantStocks,
            category,
            impact
          });
        });
      }

      // Search for specific high-impact news
      const earningsResults = await blink.data.search('Nifty 50 companies quarterly results earnings', {
        type: 'news',
        limit: 10
      });

      if (earningsResults.news_results) {
        earningsResults.news_results.forEach((article: any, index: number) => {
          const sentiment = this.analyzeSentiment(article.title + ' ' + (article.snippet || ''));
          const relevantStocks = this.extractRelevantStocks(article.title + ' ' + (article.snippet || ''), nifty50Symbols);

          news.push({
            id: `earnings_${Date.now()}_${index}`,
            title: article.title,
            summary: article.snippet || '',
            url: article.link,
            source: article.source || 'Unknown',
            publishedAt: article.date || new Date().toISOString(),
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            relevantStocks,
            category: 'earnings',
            impact: 'high'
          });
        });
      }

    } catch (error) {
      console.error('Error scraping financial news:', error);
    }

    // Remove duplicates and sort by relevance
    const uniqueNews = news.filter((article, index, self) => 
      index === self.findIndex(a => a.title === article.title)
    ).sort((a, b) => {
      // Prioritize by impact, then by sentiment score, then by relevant stocks count
      const impactScore = { high: 3, medium: 2, low: 1 };
      const aScore = impactScore[a.impact] + Math.abs(a.sentimentScore) + a.relevantStocks.length;
      const bScore = impactScore[b.impact] + Math.abs(b.sentimentScore) + b.relevantStocks.length;
      return bScore - aScore;
    });

    this.setCachedData(cacheKey, uniqueNews);
    return uniqueNews;
  }

  // Get market sentiment analysis
  async getMarketSentiment(): Promise<MarketSentiment> {
    const cacheKey = 'market_sentiment';
    const cached = this.getCachedData<MarketSentiment>(cacheKey);
    if (cached) return cached;

    try {
      const news = await this.scrapeFinancialNews();
      
      if (news.length === 0) {
        return {
          overall: 'neutral',
          score: 0,
          newsCount: 0,
          topStories: []
        };
      }

      // Calculate overall sentiment
      const totalScore = news.reduce((sum, article) => sum + article.sentimentScore, 0);
      const averageScore = totalScore / news.length;
      const normalizedScore = Math.round(averageScore * 100);

      let overall: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (normalizedScore > 20) overall = 'bullish';
      else if (normalizedScore < -20) overall = 'bearish';

      const sentiment: MarketSentiment = {
        overall,
        score: normalizedScore,
        newsCount: news.length,
        topStories: news.slice(0, 10) // Top 10 most relevant stories
      };

      this.setCachedData(cacheKey, sentiment);
      return sentiment;

    } catch (error) {
      console.error('Error calculating market sentiment:', error);
      return {
        overall: 'neutral',
        score: 0,
        newsCount: 0,
        topStories: []
      };
    }
  }

  // Get news for specific stock
  async getStockNews(symbol: string): Promise<NewsArticle[]> {
    const cacheKey = `stock_news_${symbol}`;
    const cached = this.getCachedData<NewsArticle[]>(cacheKey);
    if (cached) return cached;

    try {
      const companyName = this.getCompanyName(symbol);
      const searchQuery = `${companyName} ${symbol} stock news earnings results`;
      
      const searchResults = await blink.data.search(searchQuery, {
        type: 'news',
        limit: 15
      });

      const stockNews: NewsArticle[] = [];

      if (searchResults.news_results) {
        searchResults.news_results.forEach((article: any, index: number) => {
          const sentiment = this.analyzeSentiment(article.title + ' ' + (article.snippet || ''));
          const { category, impact } = this.categorizeNews(article.title, article.snippet || '');

          stockNews.push({
            id: `stock_${symbol}_${Date.now()}_${index}`,
            title: article.title,
            summary: article.snippet || '',
            url: article.link,
            source: article.source || 'Unknown',
            publishedAt: article.date || new Date().toISOString(),
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
            relevantStocks: [symbol],
            category,
            impact
          });
        });
      }

      this.setCachedData(cacheKey, stockNews);
      return stockNews;

    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      return [];
    }
  }

  // Helper function to get company name from symbol
  private getCompanyName(symbol: string): string {
    const companyMap: { [key: string]: string } = {
      'RELIANCE': 'Reliance Industries',
      'TCS': 'Tata Consultancy Services',
      'HDFCBANK': 'HDFC Bank',
      'INFY': 'Infosys',
      'HINDUNILVR': 'Hindustan Unilever',
      'ICICIBANK': 'ICICI Bank',
      'KOTAKBANK': 'Kotak Mahindra Bank',
      'BHARTIARTL': 'Bharti Airtel',
      'ITC': 'ITC Limited',
      'SBIN': 'State Bank of India',
      'LT': 'Larsen & Toubro',
      'ASIANPAINT': 'Asian Paints',
      'AXISBANK': 'Axis Bank',
      'MARUTI': 'Maruti Suzuki',
      'NESTLEIND': 'Nestle India',
      'HCLTECH': 'HCL Technologies',
      'BAJFINANCE': 'Bajaj Finance',
      'TITAN': 'Titan Company',
      'ULTRACEMCO': 'UltraTech Cement',
      'WIPRO': 'Wipro Limited'
    };

    return companyMap[symbol] || symbol;
  }

  // Calculate news impact score for a stock
  calculateNewsImpact(stockNews: NewsArticle[]): {
    score: number;
    positiveCount: number;
    negativeCount: number;
    highImpactCount: number;
  } {
    if (stockNews.length === 0) {
      return { score: 0, positiveCount: 0, negativeCount: 0, highImpactCount: 0 };
    }

    const positiveCount = stockNews.filter(n => n.sentiment === 'positive').length;
    const negativeCount = stockNews.filter(n => n.sentiment === 'negative').length;
    const highImpactCount = stockNews.filter(n => n.impact === 'high').length;

    // Calculate weighted score
    let score = 0;
    stockNews.forEach(article => {
      let weight = 1;
      if (article.impact === 'high') weight = 3;
      else if (article.impact === 'medium') weight = 2;

      score += article.sentimentScore * weight;
    });

    // Normalize score
    const maxPossibleScore = stockNews.length * 3; // Max weight * max sentiment
    const normalizedScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;

    return {
      score: Math.round(normalizedScore),
      positiveCount,
      negativeCount,
      highImpactCount
    };
  }
}

export const newsService = NewsService.getInstance();