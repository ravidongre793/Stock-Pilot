import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Activity } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stocks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <div className="navbar-breadcrumb">
            <Activity size={16} className="breadcrumb-icon" />
            <span>Indian Stock Market</span>
          </div>
        </div>

        <div className="navbar-center">
          <form onSubmit={handleSearch} className="search-input navbar-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search stocks... (e.g., Reliance, TCS, HDFC)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn" title="Notifications">
            <Bell size={20} />
          </button>
          <div className="nav-time">
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
        </div>
      </header>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--navbar-height);
          background: rgba(10, 14, 26, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 90;
        }

        .navbar-left {
          display: flex;
          align-items: center;
        }

        .navbar-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .breadcrumb-icon {
          color: var(--accent-cyan);
        }

        .navbar-center {
          flex: 1;
          max-width: 480px;
          margin: 0 24px;
        }

        .navbar-search {
          width: 100%;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-icon-btn:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .nav-time {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .navbar {
            left: 0;
            padding: 0 16px;
          }
          .navbar-center {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
