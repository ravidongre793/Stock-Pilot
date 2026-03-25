import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import StockCard from '../components/StockCard';
import { fetchStocks } from '../services/api';

export default function Stocks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stocks, setStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSector, setSelectedSector] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStocks();
  }, [selectedSector, page]);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearch(q);
      loadStocks(q);
    }
  }, [searchParams]);

  const loadStocks = async (searchOverride) => {
    setLoading(true);
    try {
      const data = await fetchStocks({
        search: searchOverride || search,
        sector: selectedSector !== 'all' ? selectedSector : undefined,
        page,
        limit: 20,
      });
      setStocks(data.stocks || []);
      setSectors(data.sectors || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Error loading stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadStocks();
  };

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

  return (
    <>
      <div className="stocks-page fade-in">
        <div className="page-header">
          <h1 className="page-title">📈 All Stocks</h1>
          <p className="page-subtitle">Browse and search Indian stocks — NIFTY 50 & BSE listed companies</p>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar glass-card fade-in fade-in-delay-1">
          <form onSubmit={handleSearch} className="search-input" style={{ flex: 1 }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, symbol, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="filter-group">
            <Filter size={16} />
            <select
              className="sector-select"
              value={selectedSector}
              onChange={(e) => { setSelectedSector(e.target.value); setPage(1); }}
            >
              <option value="all">All Sectors</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="view-toggle">
            <button
              className={`btn btn-ghost ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`btn btn-ghost ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <span className="loading-text">Fetching live stock data...</span>
          </div>
        ) : stocks.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No stocks found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid-auto fade-in fade-in-delay-2">
            {stocks.map(stock => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        ) : (
          <div className="glass-card table-container fade-in fade-in-delay-2" style={{ padding: 0, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Sector</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Change</th>
                  <th style={{ textAlign: 'right' }}>Volume</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => (
                  <tr
                    key={stock.symbol}
                    onClick={() => window.location.href = `/stocks/${encodeURIComponent(stock.symbol)}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div className="stock-name">{stock.name}</div>
                      <div className="stock-symbol">{stock.symbol?.replace('.NS', '')}</div>
                    </td>
                    <td><span className="badge badge-sector">{stock.sector}</span></td>
                    <td style={{ textAlign: 'right' }} className="mono">{formatPrice(stock.price)}</td>
                    <td style={{ textAlign: 'right' }} className={`mono ${stock.change >= 0 ? 'price-up' : 'price-down'}`}>
                      {formatPercent(stock.changePercent)}
                    </td>
                    <td style={{ textAlign: 'right' }} className="mono">
                      {stock.volume ? (stock.volume / 1e6).toFixed(1) + 'M' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination fade-in">
            <button
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-ghost"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style>{`
        .filters-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filters-bar:hover {
          transform: none;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
        }

        .sector-select {
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          outline: none;
        }

        .sector-select option {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .view-toggle {
          display: flex;
          gap: 4px;
        }

        .view-toggle .btn {
          padding: 8px 10px;
        }

        .table-container {
          margin-bottom: 24px;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .page-info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
    </>
  );
}
