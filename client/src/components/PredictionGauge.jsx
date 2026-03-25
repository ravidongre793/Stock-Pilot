export default function PredictionGauge({ prediction }) {
  if (!prediction) return null;

  const { signal, confidence, message, indicators } = prediction;

  const getSignalColor = () => {
    switch (signal) {
      case 'BUY': return '#00e676';
      case 'SELL': return '#ff5252';
      default: return '#ffd740';
    }
  };

  const getSignalGradient = () => {
    switch (signal) {
      case 'BUY': return 'linear-gradient(135deg, #00e676, #00bcd4)';
      case 'SELL': return 'linear-gradient(135deg, #ff5252, #ff9100)';
      default: return 'linear-gradient(135deg, #ffd740, #ff9100)';
    }
  };

  const color = getSignalColor();
  const angle = (confidence / 100) * 180;
  const circumference = Math.PI * 80;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <>
      <div className="prediction-gauge">
        <div className="gauge-visual">
          <svg viewBox="0 0 200 120" className="gauge-svg">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Value arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 8px ${color}50)`,
                transition: 'stroke-dashoffset 1s ease',
              }}
            />
          </svg>
          <div className="gauge-center">
            <span className="gauge-signal" style={{ background: getSignalGradient(), WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {signal}
            </span>
            <span className="gauge-confidence">{confidence}%</span>
          </div>
        </div>

        <p className="gauge-message">{message}</p>

        {indicators && (
          <div className="indicator-list">
            {Object.entries(indicators).map(([key, ind]) => {
              if (!ind.signal) return null;
              return (
                <div key={key} className="indicator-item">
                  <div className="indicator-header">
                    <span className="indicator-name">{ind.signal.name}</span>
                    <span className={`badge badge-${ind.signal.signal?.toLowerCase()}`}>
                      {ind.signal.signal}
                    </span>
                  </div>
                  {ind.signal.reasons && (
                    <div className="indicator-reasons">
                      {ind.signal.reasons.map((r, i) => (
                        <span key={i} className="reason">{r}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .prediction-gauge {
          padding: 24px;
        }

        .gauge-visual {
          position: relative;
          width: 200px;
          height: 120px;
          margin: 0 auto 16px;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
        }

        .gauge-center {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-signal {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .gauge-confidence {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
        }

        .gauge-message {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .indicator-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .indicator-item {
          padding: 10px 14px;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .indicator-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .indicator-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .indicator-reasons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .reason {
          font-size: 0.72rem;
          color: var(--text-muted);
          background: var(--bg-glass);
          padding: 2px 8px;
          border-radius: 12px;
        }
      `}</style>
    </>
  );
}
