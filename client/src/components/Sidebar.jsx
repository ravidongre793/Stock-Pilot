import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, TrendingUp, LineChart, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/stocks', icon: BarChart3, label: 'All Stocks' },
  { path: '/predictions', icon: TrendingUp, label: 'Predictions' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" onClick={() => navigate('/')}>
          <div className="logo">
            <div className="logo-icon">
              <LineChart size={24} />
            </div>
            {!collapsed && (
              <div className="logo-text">
                <span className="logo-name">StockPredict</span>
                <span className="logo-sub">India</span>
              </div>
            )}
          </div>
          <button className="collapse-btn" onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={path === '/'}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="market-status">
              <div className="status-dot">
                <span className="pulse"></span>
              </div>
              <div className="status-text">
                <span className="status-label">Market Status</span>
                <span className="status-value">Live Data</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width var(--transition-normal);
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          flex-shrink: 0;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 600;
        }

        .collapse-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color var(--transition-fast);
        }
        .collapse-btn:hover {
          color: var(--text-primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all var(--transition-fast);
          position: relative;
        }

        .nav-item:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--accent-cyan-dim);
          color: var(--accent-cyan);
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--accent-cyan);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .market-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .status-dot {
          display: flex;
          align-items: center;
        }

        .status-text {
          display: flex;
          flex-direction: column;
        }

        .status-label {
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-value {
          font-size: 0.8rem;
          color: var(--accent-green);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.collapsed {
            width: var(--sidebar-width);
          }
        }
      `}</style>
    </>
  );
}
