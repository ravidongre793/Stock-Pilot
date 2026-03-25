import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StockCard({ stock }) {
  const navigate = useNavigate();
  const isPositive = stock.change > 0;
  const isNegative = stock.change < 0;

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatPercent = (pct) => {
    if (pct === null || pct === undefined) return '—';
    return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
  };

  const formatMarketCap = (cap) => {
    if (!cap) return '—';
    if (cap >= 1e12) return `₹${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `₹${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e7) return `₹${(cap / 1e7).toFixed(2)}Cr`;
    return `₹${(cap / 1e5).toFixed(2)}L`;
  };

  return (
    <>
      <div
        className="stock-card glass-card"
        onClick={() => navigate(`/stocks/${encodeURIComponent(stock.symbol)}`)}
      >
        <div className="stock-card-header">
          <div className="stock-card-info">
            <span className="stock-card-name">{stock.name}</span>
            <span className="stock-card-symbol">{stock.symbol?.replace('.NS', '')}</span>
          </div>
          <span className="badge badge-sector">{stock.sector}</span>
        </div>

        <div className="stock-card-price">
          <span className="price-value">{formatPrice(stock.price)}</span>
          <span className={`price-change ${isPositive ? 'price-up' : isNegative ? 'price-down' : 'price-neutral'}`}>
            {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
            {formatPercent(stock.changePercent)}
          </span>
        </div>

        <div className="stock-card-footer">
          <div className="stock-card-stat">
            <span className="stat-label">Vol</span>
            <span className="stat-value mono">
              {stock.volume ? (stock.volume / 1e6).toFixed(1) + 'M' : '—'}
            </span>
          </div>
          <div className="stock-card-stat">
            <span className="stat-label">MCap</span>
            <span className="stat-value mono">{formatMarketCap(stock.marketCap)}</span>
          </div>
        </div>

        <div className={`stock-card-glow ${isPositive ? 'glow-green' : isNegative ? 'glow-red' : ''}`}></div>
      </div>

      <style>{`
        .stock-card {
          padding: 20px;
          cursor: pointer;
          position: relative;
        }

        .stock-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stock-card-info {
          display: flex;
          flex-direction: column;
        }

        .stock-card-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 2px;
          line-height: 1.3;
        }

        .stock-card-symbol {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .stock-card-price {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 16px;
        }

        .price-value {
          font-size: 1.35rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.02em;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'JetBrains Mono', monospace;
        }

        .stock-card-footer {
          display: flex;
          gap: 20px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color);
        }

        .stock-card-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-label {
          font-size: 0.65rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .stock-card-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          transition: all var(--transition-normal);
          opacity: 0;
        }

        .stock-card:hover .stock-card-glow {
          opacity: 1;
        }

        .glow-green {
          background: var(--gradient-primary);
          box-shadow: 0 0 12px rgba(0, 230, 118, 0.3);
        }

        .glow-red {
          background: var(--gradient-danger);
          box-shadow: 0 0 12px rgba(255, 82, 82, 0.3);
        }
      `}</style>
    </>
  );
}
