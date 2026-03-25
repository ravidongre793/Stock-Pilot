import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000/ws';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Stock APIs
export const fetchStocks = async (params = {}) => {
  const { data } = await api.get('/stocks', { params });
  return data;
};

export const fetchStockDetail = async (symbol, period = '6mo', interval = '1d') => {
  const { data } = await api.get(`/stocks/${encodeURIComponent(symbol)}`, {
    params: { period, interval },
  });
  return data;
};

export const fetchStockPrediction = async (symbol) => {
  const { data } = await api.get(`/stocks/${encodeURIComponent(symbol)}/prediction`);
  return data;
};

export const fetchMarketOverview = async () => {
  const { data } = await api.get('/market/overview');
  return data;
};

export const fetchTopMovers = async () => {
  const { data } = await api.get('/stocks/top-movers');
  return data;
};

export const fetchAllPredictions = async (signal = 'all') => {
  const { data } = await api.get('/stocks/predictions/all', { params: { signal } });
  return data;
};

export const fetchSectors = async () => {
  const { data } = await api.get('/stocks/sectors');
  return data;
};

// WebSocket connection
export class PriceSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectTimeout = null;
    this.reconnectDelay = 3000;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'price_update') {
            this.listeners.forEach((callback) => {
              callback(message.data);
            });
          }
        } catch (e) {
          // ignore
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        this.reconnectTimeout = setTimeout(() => this.connect(), this.reconnectDelay);
      };

      this.ws.onerror = () => {
        // Will trigger onclose
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
    }
  }

  subscribe(symbols) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbols }));
    }
  }

  onPriceUpdate(id, callback) {
    this.listeners.set(id, callback);
  }

  removeListener(id) {
    this.listeners.delete(id);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const priceSocket = new PriceSocket();

export default api;
