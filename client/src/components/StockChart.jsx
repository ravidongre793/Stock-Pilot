import { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

export default function StockChart({ data, symbol, type = 'candlestick', height = 400 }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState(type);

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: 'Inter, sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(0, 188, 212, 0.3)', style: 2, width: 1 },
        horzLine: { color: 'rgba(0, 188, 212, 0.3)', style: 2, width: 1 },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    chartRef.current = chart;

    const formattedData = data
      .filter(d => d.close !== null && d.open !== null)
      .map(d => ({
        time: Math.floor(new Date(d.date).getTime() / 1000),
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        value: d.close,
      }))
      .sort((a, b) => a.time - b.time);

    // Deduplicate by time
    const seen = new Set();
    const uniqueData = formattedData.filter(d => {
      if (seen.has(d.time)) return false;
      seen.add(d.time);
      return true;
    });

    if (chartType === 'candlestick') {
      const series = chart.addCandlestickSeries({
        upColor: '#00e676',
        downColor: '#ff5252',
        borderUpColor: '#00e676',
        borderDownColor: '#ff5252',
        wickUpColor: '#00e676',
        wickDownColor: '#ff5252',
      });
      series.setData(uniqueData);
    } else {
      const series = chart.addAreaSeries({
        lineColor: '#00bcd4',
        topColor: 'rgba(0, 188, 212, 0.2)',
        bottomColor: 'rgba(0, 188, 212, 0.02)',
        lineWidth: 2,
      });
      series.setData(uniqueData.map(d => ({ time: d.time, value: d.close || d.value })));
    }

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const volumeData = data
      .filter(d => d.volume !== null)
      .map(d => ({
        time: Math.floor(new Date(d.date).getTime() / 1000),
        value: d.volume,
        color: (d.close >= d.open) ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 82, 82, 0.15)',
      }))
      .sort((a, b) => a.time - b.time);

    const seenVol = new Set();
    const uniqueVolume = volumeData.filter(d => {
      if (seenVol.has(d.time)) return false;
      seenVol.add(d.time);
      return true;
    });

    volumeSeries.setData(uniqueVolume);

    chart.timeScale().fitContent();

    // Resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, chartType, height]);

  return (
    <>
      <div className="chart-wrapper">
        <div className="chart-controls">
          <button
            className={`btn btn-ghost ${chartType === 'candlestick' ? 'active' : ''}`}
            onClick={() => setChartType('candlestick')}
          >
            Candlestick
          </button>
          <button
            className={`btn btn-ghost ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
        </div>
        <div ref={chartContainerRef} className="chart-container" />
      </div>

      <style>{`
        .chart-wrapper {
          position: relative;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .chart-controls .btn {
          padding: 6px 14px;
          font-size: 0.8rem;
        }

        .chart-container {
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
