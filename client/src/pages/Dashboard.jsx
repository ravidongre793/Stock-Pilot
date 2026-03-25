import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, BarChart3, Activity, Zap, ArrowRight } from 'lucide-react';
import StockCard from '../components/StockCard';
import { fetchMarketOverview, fetchTopMovers, fetchStocks } from '../services/api';

export default function Dashboard() {
  const [indices, setIndices] = useState([]);
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [trendingStocks, setTrendingStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [overviewRes, moversRes, stocksRes] = await Promise.allSettled([
        fetchMarketOverview(),
        fetchTopMovers(),
        fetchStocks({ limit: 8 }),
      ]);

      if (overviewRes.status === 'fulfilled') setIndices(overviewRes.value.indices || []);
      if (moversRes.status === 'fulfilled') setMovers(moversRes.value || { gainers: [], losers: [] });
      if (stocksRes.status === 'fulfilled') setTrendingStocks(stocksRes.value.stocks || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(price);
  };

  const formatChange = (change, pct) => {
    if (change === null || change === undefined) return '—';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${pct?.toFixed(2)}%)`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading market data...</span>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard fade-in">
        <div className="page-header">
          <h1 className="page-title">📊 Market Dashboard</h1>
          <p className="page-subtitle">Real-time Indian stock market overview and predictions</p>
        </div>

        {/* Market Indices */}
        <section className="dashboard-section fade-in fade-in-delay-1">
          <div className="section-header">
            <h2 className="section-title"><Activity size={20} /> Market Indices</h2>
          </div>
          <div className="grid-3">
            {indices.map((idx, i) => (
              <div key={idx.symbol} className="index-card glass-card">
                <div className="index-name">{idx.name}</div>
                <div className="index-price mono">{formatPrice(idx.price)}</div>
                <div className={`index-change ${idx.change >= 0 ? 'price-up' : 'price-down'}`}>
                  {idx.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="mono">{formatChange(idx.change, idx.changePercent)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Movers */}
        <section className="dashboard-section fade-in fade-in-delay-2">
          <div className="section-header">
            <h2 className="section-title"><Zap size={20} /> Top Movers</h2>
          </div>
          <div className="grid-2">
            {/* Gainers */}
            <div className="movers-card glass-card">
              <h3 className="movers-title">
                <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                Top Gainers
              </h3>
              <div className="movers-list">
                {movers.gainers?.map((stock, i) => (
                  <div
                    key={stock.symbol}
                    className="mover-item"
                    onClick={() => navigate(`/stocks/${encodeURIComponent(stock.symbol)}`)}
                  >
                    <div className="mover-info">
                      <span className="mover-name">{stock.name}</span>
                      <span className="mover-symbol">{stock.symbol?.replace('.NS', '')}</span>
                    </div>
                    <div className="mover-price">
                      <span className="mono">₹{formatPrice(stock.price)}</span>
                      <span className="price-up mono">+{stock.changePercent?.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div className="movers-card glass-card">
              <h3 className="movers-title">
                <TrendingDown size={18} style={{ color: 'var(--accent-red)' }} />
                Top Losers
              </h3>
              <div className="movers-list">
                {movers.losers?.map((stock, i) => (
                  <div
                    key={stock.symbol}
                    className="mover-item"
                    onClick={() => navigate(`/stocks/${encodeURIComponent(stock.symbol)}`)}
                  >
                    <div className="mover-info">
                      <span className="mover-name">{stock.name}</span>
                      <span className="mover-symbol">{stock.symbol?.replace('.NS', '')}</span>
                    </div>
                    <div className="mover-price">
                      <span className="mono">₹{formatPrice(stock.price)}</span>
                      <span className="price-down mono">{stock.changePercent?.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Stocks */}
        <section className="dashboard-section fade-in fade-in-delay-3">
          <div className="section-header">
            <h2 className="section-title"><BarChart3 size={20} /> Trending Stocks</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/stocks')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid-auto">
            {trendingStocks.map(stock => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-section {
          margin-bottom: 36px;
        }

        .index-card {
          padding: 20px;
          text-align: center;
        }

        .index-name {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .index-price {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }

        .index-change {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .movers-card {
          padding: 20px;
        }

        .movers-card:hover {
          transform: none;
        }

        .movers-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .movers-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mover-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .mover-item:hover {
          background: var(--bg-glass-hover);
        }

        .mover-info {
          display: flex;
          flex-direction: column;
        }

        .mover-name {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .mover-symbol {
          font-size: 0.7rem;
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
        }

        .mover-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          font-size: 0.85rem;
        }
      `}</style>
    </>
  );
}
