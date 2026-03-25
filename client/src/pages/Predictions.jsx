import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { fetchAllPredictions } from '../services/api';

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPredictions();
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error('Error loading predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPredictions = filter === 'all'
    ? predictions
    : predictions.filter(p => p.signal === filter);

  const stats = {
    buy: predictions.filter(p => p.signal === 'BUY').length,
    sell: predictions.filter(p => p.signal === 'SELL').length,
    hold: predictions.filter(p => p.signal === 'HOLD').length,
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <>
      <div className="predictions-page fade-in">
        <div className="page-header">
          <h1 className="page-title">🎯 Predictions</h1>
          <p className="page-subtitle">Technical analysis signals for top Indian stocks — powered by SMA, RSI, MACD & Bollinger Bands</p>
        </div>

        {/* Stats Summary */}
        <div className="pred-stats grid-3 fade-in fade-in-delay-1">
          <div className="pred-stat-card glass-card stat-buy" onClick={() => setFilter('BUY')}>
            <div className="pred-stat-icon"><TrendingUp size={24} /></div>
            <div className="pred-stat-info">
              <span className="pred-stat-count">{stats.buy}</span>
              <span className="pred-stat-label">Buy Signals</span>
            </div>
          </div>
          <div className="pred-stat-card glass-card stat-sell" onClick={() => setFilter('SELL')}>
            <div className="pred-stat-icon"><TrendingDown size={24} /></div>
            <div className="pred-stat-info">
              <span className="pred-stat-count">{stats.sell}</span>
              <span className="pred-stat-label">Sell Signals</span>
            </div>
          </div>
          <div className="pred-stat-card glass-card stat-hold" onClick={() => setFilter('HOLD')}>
            <div className="pred-stat-icon"><Minus size={24} /></div>
            <div className="pred-stat-info">
              <span className="pred-stat-count">{stats.hold}</span>
              <span className="pred-stat-label">Hold Signals</span>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="pred-filters fade-in fade-in-delay-2">
          <div className="filter-btns">
            {['all', 'BUY', 'SELL', 'HOLD'].map(f => (
              <button
                key={f}
                className={`btn btn-ghost ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost" onClick={loadPredictions} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Refresh
          </button>
        </div>

        {/* Predictions Table */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Analyzing stocks... this may take a moment</span>
          </div>
        ) : (
          <div className="glass-card fade-in fade-in-delay-3" style={{ padding: 0, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Signal</th>
                  <th style={{ textAlign: 'center' }}>Confidence</th>
                  <th>Analysis</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.map(pred => (
                  <tr
                    key={pred.symbol}
                    onClick={() => navigate(`/stocks/${encodeURIComponent(pred.symbol)}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="stock-name">{pred.name}</div>
                      <div className="stock-symbol">{pred.symbol?.replace('.NS', '')}</div>
                    </td>
                    <td><span className="badge badge-sector">{pred.sector}</span></td>
                    <td style={{ textAlign: 'right' }} className="mono">{formatPrice(pred.currentPrice)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${pred.signal?.toLowerCase()}`}>
                        {pred.signal === 'BUY' && <TrendingUp size={12} />}
                        {pred.signal === 'SELL' && <TrendingDown size={12} />}
                        {pred.signal === 'HOLD' && <Minus size={12} />}
                        {pred.signal}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{
                            width: `${pred.confidence}%`,
                            background: pred.signal === 'BUY' ? 'var(--accent-green)' :
                                        pred.signal === 'SELL' ? 'var(--accent-red)' : 'var(--accent-yellow)',
                          }}
                        ></div>
                        <span className="confidence-text mono">{pred.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="analysis-brief">{pred.message}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .pred-stats {
          margin-bottom: 24px;
        }

        .pred-stat-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
        }

        .pred-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-buy .pred-stat-icon {
          background: var(--accent-green-dim);
          color: var(--accent-green);
        }
        .stat-sell .pred-stat-icon {
          background: var(--accent-red-dim);
          color: var(--accent-red);
        }
        .stat-hold .pred-stat-icon {
          background: var(--accent-yellow-dim);
          color: var(--accent-yellow);
        }

        .pred-stat-count {
          font-size: 1.5rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
        }

        .pred-stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .pred-stat-info {
          display: flex;
          flex-direction: column;
        }

        .pred-filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .filter-btns {
          display: flex;
          gap: 8px;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .confidence-bar {
          position: relative;
          width: 80px;
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          margin: 0 auto;
        }

        .confidence-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .confidence-text {
          position: relative;
          margin-left: 88px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .analysis-brief {
          font-size: 0.78rem;
          color: var(--text-muted);
          max-width: 300px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .pred-stats {
            grid-template-columns: 1fr;
          }
          .pred-filters {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}
