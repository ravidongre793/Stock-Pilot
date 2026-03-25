import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Target, Clock } from 'lucide-react';
import StockChart from '../components/StockChart';
import PredictionGauge from '../components/PredictionGauge';
import { fetchStockDetail, fetchStockPrediction } from '../services/api';

const PERIODS = [
  { label: '1W', value: '5d', interval: '1d' },
  { label: '1M', value: '1mo', interval: '1d' },
  { label: '3M', value: '3mo', interval: '1d' },
  { label: '6M', value: '6mo', interval: '1d' },
  { label: '1Y', value: '1y', interval: '1d' },
  { label: '5Y', value: '5y', interval: '1wk' },
];

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[3]); // 6M default

  useEffect(() => {
    loadStock();
    loadPrediction();
  }, [symbol]);

  useEffect(() => {
    loadStock();
  }, [selectedPeriod]);

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await fetchStockDetail(symbol, selectedPeriod.value, selectedPeriod.interval);
      setStock(data);
    } catch (err) {
      console.error('Error loading stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrediction = async () => {
    setPredLoading(true);
    try {
      const data = await fetchStockPrediction(symbol);
      setPrediction(data);
    } catch (err) {
      console.error('Error loading prediction:', err);
    } finally {
      setPredLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num) => {
    if (!num) return '—';
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e7) return `₹${(num / 1e7).toFixed(2)}Cr`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  if (loading && !stock) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading stock data...</span>
      </div>
    );
  }

  const quote = stock?.quote || {};
  const isPositive = quote.change >= 0;

  return (
    <>
      <div className="stock-detail fade-in">
        {/* Back button */}
        <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>

        {/* Header */}
        <div className="detail-header">
          <div className="detail-info">
            <div className="detail-name-row">
              <h1 className="detail-name">{stock?.name || symbol}</h1>
              <span className="badge badge-sector">{stock?.sector}</span>
            </div>
            <span className="detail-symbol mono">{symbol?.replace('.NS', '')} · {stock?.index || 'NSE'}</span>
          </div>
          <div className="detail-price-section">
            <span className="detail-price mono">{formatPrice(quote.price)}</span>
            <span className={`detail-change mono ${isPositive ? 'price-up' : 'price-down'}`}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="detail-body">
          {/* Chart Section */}
          <div className="chart-section">
            <div className="glass-card chart-card">
              <div className="period-selector">
                {PERIODS.map(p => (
                  <button
                    key={p.value}
                    className={`btn btn-ghost ${selectedPeriod.value === p.value ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod(p)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {stock?.historical && stock.historical.length > 0 ? (
                <StockChart data={stock.historical} symbol={symbol} height={420} />
              ) : (
                <div className="loading-container">
                  <span className="loading-text">No chart data available</span>
                </div>
              )}
            </div>

            {/* Key Stats */}
            <div className="glass-card stats-card">
              <h3 className="card-title"><BarChart3 size={18} /> Key Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Open</span>
                  <span className="stat-value mono">{formatPrice(quote.open)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Previous Close</span>
                  <span className="stat-value mono">{formatPrice(quote.previousClose)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Day High</span>
                  <span className="stat-value mono price-up">{formatPrice(quote.dayHigh)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Day Low</span>
                  <span className="stat-value mono price-down">{formatPrice(quote.dayLow)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">52W High</span>
                  <span className="stat-value mono">{formatPrice(quote.fiftyTwoWeekHigh)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">52W Low</span>
                  <span className="stat-value mono">{formatPrice(quote.fiftyTwoWeekLow)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Volume</span>
                  <span className="stat-value mono">{quote.volume ? (quote.volume / 1e6).toFixed(2) + 'M' : '—'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value mono">{formatLargeNumber(quote.marketCap)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">P/E Ratio</span>
                  <span className="stat-value mono">{quote.peRatio?.toFixed(2) || '—'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">EPS</span>
                  <span className="stat-value mono">{quote.eps ? `₹${quote.eps.toFixed(2)}` : '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prediction Section */}
          <div className="prediction-section">
            <div className="glass-card prediction-card">
              <h3 className="card-title"><Target size={18} /> Prediction Signal</h3>
              {predLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span className="loading-text">Analyzing indicators...</span>
                </div>
              ) : (
                <PredictionGauge prediction={prediction} />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .back-btn {
          margin-bottom: 16px;
        }

        .detail-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .detail-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }

        .detail-name {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .detail-symbol {
          font-size: 0.85rem;
          color: var(--text-dim);
        }

        .detail-price-section {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .detail-price {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .detail-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 1rem;
          font-weight: 600;
        }

        .detail-body {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }

        .chart-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .chart-card {
          padding: 20px;
        }

        .chart-card:hover {
          transform: none;
        }

        .period-selector {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .period-selector .btn {
          padding: 6px 14px;
          font-size: 0.8rem;
        }

        .stats-card {
          padding: 20px;
        }

        .stats-card:hover {
          transform: none;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .card-title svg {
          color: var(--accent-cyan);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .prediction-section {
          position: sticky;
          top: calc(var(--navbar-height) + 24px);
          align-self: start;
        }

        .prediction-card {
          padding: 0;
          overflow: hidden;
        }

        .prediction-card .card-title {
          padding: 16px 20px;
          margin-bottom: 0;
          border-bottom: 1px solid var(--border-color);
        }

        .prediction-card:hover {
          transform: none;
        }

        @media (max-width: 1024px) {
          .detail-body {
            grid-template-columns: 1fr;
          }
          .prediction-section {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </>
  );
}
