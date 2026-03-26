import express from 'express';
import stockService from '../services/stockService.js';
import predictionService from '../services/predictionService.js';
import { indianStocks, sectors } from '../data/indianStocks.js';

const router = express.Router();

// GET /api/stocks - List all tracked stocks with live prices
router.get('/', async (req, res) => {
  try {
    const { sector, search, page = 1, limit = 20 } = req.query;
    let filteredStocks = [...indianStocks];

    if (sector && sector !== 'all') {
      filteredStocks = filteredStocks.filter(s => s.sector.toLowerCase() === sector.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filteredStocks = filteredStocks.filter(s =>
        s.name.toLowerCase().includes(q) || s.symbol.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)
      );
    }

    const startIdx = (parseInt(page) - 1) * parseInt(limit);
    const paginatedStocks = filteredStocks.slice(startIdx, startIdx + parseInt(limit));

    const symbols = paginatedStocks.map(s => s.symbol);
    const quotes = await stockService.getBatchQuotes(symbols);

    const result = paginatedStocks.map(stock => {
      const quote = quotes.find(q => q && q.symbol === stock.symbol);
      return { ...stock, price: quote?.price || null, change: quote?.change || null, changePercent: quote?.changePercent || null, volume: quote?.volume || null, marketCap: quote?.marketCap || null, dayHigh: quote?.dayHigh || null, dayLow: quote?.dayLow || null };
    });

    res.json({ stocks: result, total: filteredStocks.length, page: parseInt(page), totalPages: Math.ceil(filteredStocks.length / parseInt(limit)), sectors });
  } catch (error) {
    console.error('Error fetching stocks:', error.message);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// GET /api/stocks/sectors
router.get('/sectors', (req, res) => {
  res.json({ sectors });
});

// GET /api/stocks/market/overview
router.get('/market/overview', async (req, res) => {
  try {
    const overview = await stockService.getMarketOverview();
    res.json({ indices: overview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

// GET /api/stocks/top-movers
router.get('/top-movers', async (req, res) => {
  try {
    const popularSymbols = indianStocks.slice(0, 30).map(s => s.symbol);
    const quotes = await stockService.getBatchQuotes(popularSymbols);
    const validQuotes = quotes.filter(q => q && q.changePercent !== null && q.changePercent !== undefined);
    const sorted = validQuotes.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    const gainers = sorted.slice(0, 5).map(q => ({ ...q, ...indianStocks.find(s => s.symbol === q.symbol) }));
    const losers = sorted.slice(-5).reverse().map(q => ({ ...q, ...indianStocks.find(s => s.symbol === q.symbol) }));
    res.json({ gainers, losers });
  } catch (error) {
    console.error('Error fetching top movers:', error.message);
    res.status(500).json({ error: 'Failed to fetch top movers' });
  }
});

// GET /api/stocks/predictions/all
router.get('/predictions/all', async (req, res) => {
  try {
    const { signal } = req.query;
    const topStocks = indianStocks.slice(0, 30);
    const predictions = [];

    for (const stock of topStocks) {
      try {
        const historical = await stockService.getHistoricalData(stock.symbol, '1y', '1d');
        if (historical && historical.length > 50) {
          const prediction = predictionService.generatePrediction(historical);
          predictions.push({ symbol: stock.symbol, name: stock.name, sector: stock.sector, ...prediction });
        }
      } catch (e) { 
        console.error(`Failed to generate prediction for ${stock.symbol}:`, e.message);
      }
    }

    let filtered = predictions;
    if (signal && signal !== 'all') {
      filtered = predictions.filter(p => p.signal === signal.toUpperCase());
    }
    filtered.sort((a, b) => b.confidence - a.confidence);
    res.json({ predictions: filtered });
  } catch (error) {
    console.error('Error fetching all predictions:', error.message);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// GET /api/stocks/:symbol - Get detailed stock info
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '6mo', interval = '1d' } = req.query;
    const stockInfo = indianStocks.find(s => s.symbol === symbol);
    const [quote, historical] = await Promise.all([
      stockService.getQuote(symbol),
      stockService.getHistoricalData(symbol, period, interval),
    ]);
    if (!quote) return res.status(404).json({ error: 'Stock not found' });
    res.json({ ...stockInfo, quote, historical });
  } catch (error) {
    console.error(`Error fetching stock ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch stock details' });
  }
});

// GET /api/stocks/:symbol/prediction
router.get('/:symbol/prediction', async (req, res) => {
  try {
    const { symbol } = req.params;
    const historical = await stockService.getHistoricalData(symbol, '1y', '1d');
    if (!historical || historical.length === 0) return res.status(404).json({ error: 'No historical data available' });
    const prediction = predictionService.generatePrediction(historical);
    const stockInfo = indianStocks.find(s => s.symbol === symbol);
    res.json({ symbol, name: stockInfo?.name || symbol, ...prediction });
  } catch (error) {
    console.error(`Error generating prediction for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

export default router;
