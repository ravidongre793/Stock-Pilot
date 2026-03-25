import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Predictions from './pages/Predictions';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/:symbol" element={<StockDetail />} />
            <Route path="/predictions" element={<Predictions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
