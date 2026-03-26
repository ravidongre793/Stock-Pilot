import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import stockRoutes from './routes/stocks.js';
import stockService from './services/stockService.js';
import { indianStocks } from './data/indianStocks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stocks', stockRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Market overview route
app.get('/api/market/overview', async (req, res) => {
  try {
    const overview = await stockService.getMarketOverview();
    res.json({ indices: overview });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    stocksCount: indianStocks.length
  });
});

// Debug endpoint to check internal state
app.get('/api/debug', (req, res) => {
  res.json({
    dirname: __dirname,
    staticPath: path.join(__dirname, '../client/dist'),
    indianStocks: indianStocks.slice(0, 5)
  });
});

// Create HTTP server
const server = http.createServer(app);

// WebSocket server for real-time price updates
const wss = new WebSocketServer({ server, path: '/ws' });

const connectedClients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  connectedClients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.symbols) {
        ws.subscribedSymbols = data.symbols;
      }
    } catch (e) {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    connectedClients.delete(ws);
    console.log('Client disconnected from WebSocket');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    connectedClients.delete(ws);
  });
});

// Broadcast price updates every 30 seconds
async function broadcastPriceUpdates() {
  if (connectedClients.size === 0) return;

  try {
    const allSymbols = new Set();
    for (const client of connectedClients) {
      if (client.subscribedSymbols) {
        client.subscribedSymbols.forEach(s => allSymbols.add(s));
      }
    }

    if (allSymbols.size === 0) {
      indianStocks.slice(0, 10).forEach(s => allSymbols.add(s.symbol));
    }

    const symbols = Array.from(allSymbols);
    const quotes = await stockService.getBatchQuotes(symbols);

    const updateData = JSON.stringify({
      type: 'price_update',
      data: quotes.filter(q => q !== null),
      timestamp: new Date().toISOString(),
    });

    for (const client of connectedClients) {
      if (client.readyState === 1) {
        client.send(updateData);
      }
    }
  } catch (error) {
    console.error('Error broadcasting prices:', error.message);
  }
}

setInterval(broadcastPriceUpdates, 30000);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Stock Predictor Server running on http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/stocks`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});
