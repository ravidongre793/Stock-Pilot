import { SMA, RSI, MACD, BollingerBands, EMA } from 'technicalindicators';

class PredictionService {
  generatePrediction(historicalData) {
    if (!historicalData || historicalData.length < 50) {
      return {
        signal: 'HOLD',
        confidence: 0,
        message: 'Insufficient data for analysis',
        indicators: {},
      };
    }

    const closes = historicalData.map(d => d.close);
    const volumes = historicalData.map(d => d.volume);

    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const sma200 = this.calculateSMA(closes, 200);
    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const bollingerBands = this.calculateBollingerBands(closes);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const volumeAnalysis = this.analyzeVolume(volumes);

    const signals = [];
    const currentPrice = closes[closes.length - 1];

    const smaSignal = this.getSMASignal(currentPrice, sma20, sma50, sma200);
    signals.push(smaSignal);

    const rsiSignal = this.getRSISignal(rsi);
    signals.push(rsiSignal);

    const macdSignal = this.getMACDSignal(macd);
    signals.push(macdSignal);

    const bbSignal = this.getBollingerSignal(currentPrice, bollingerBands);
    signals.push(bbSignal);

    const volumeSignal = this.getVolumeSignal(volumeAnalysis);
    signals.push(volumeSignal);

    const emaSignal = this.getEMACrossoverSignal(ema12, ema26);
    signals.push(emaSignal);

    const aggregated = this.aggregateSignals(signals);

    return {
      signal: aggregated.signal,
      confidence: aggregated.confidence,
      message: aggregated.message,
      currentPrice,
      indicators: {
        sma: { sma20: sma20 ? sma20[sma20.length - 1] : null, sma50: sma50 ? sma50[sma50.length - 1] : null, sma200: sma200 && sma200.length > 0 ? sma200[sma200.length - 1] : null, signal: smaSignal },
        rsi: { value: rsi ? rsi[rsi.length - 1] : null, signal: rsiSignal },
        macd: { value: macd, signal: macdSignal },
        bollingerBands: { upper: bollingerBands ? bollingerBands.upper : null, middle: bollingerBands ? bollingerBands.middle : null, lower: bollingerBands ? bollingerBands.lower : null, signal: bbSignal },
        ema: { ema12: ema12 ? ema12[ema12.length - 1] : null, ema26: ema26 ? ema26[ema26.length - 1] : null, signal: emaSignal },
        volume: { analysis: volumeAnalysis, signal: volumeSignal },
      },
    };
  }

  calculateSMA(data, period) { if (data.length < period) return null; return SMA.calculate({ period, values: data }); }
  calculateEMA(data, period) { if (data.length < period) return null; return EMA.calculate({ period, values: data }); }
  calculateRSI(data) { if (data.length < 15) return null; return RSI.calculate({ period: 14, values: data }); }

  calculateMACD(data) {
    if (data.length < 26) return null;
    const result = MACD.calculate({ values: data, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    return result.length > 0 ? result[result.length - 1] : null;
  }

  calculateBollingerBands(data) {
    if (data.length < 20) return null;
    const result = BollingerBands.calculate({ period: 20, values: data, stdDev: 2 });
    if (result.length > 0) { const last = result[result.length - 1]; return { upper: last.upper, middle: last.middle, lower: last.lower }; }
    return null;
  }

  analyzeVolume(volumes) {
    if (volumes.length < 20) return { trend: 'neutral', ratio: 1 };
    const recent = volumes.slice(-5);
    const avg20 = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const ratio = avgRecent / avg20;
    let trend = 'neutral';
    if (ratio > 1.5) trend = 'high'; else if (ratio > 1.1) trend = 'above_average';
    else if (ratio < 0.7) trend = 'low'; else if (ratio < 0.9) trend = 'below_average';
    return { trend, ratio: Math.round(ratio * 100) / 100 };
  }

  getSMASignal(price, sma20, sma50, sma200) {
    let score = 0; let reasons = [];
    if (sma20 && sma20.length > 0) { const val = sma20[sma20.length - 1]; if (price > val) { score += 1; reasons.push('Price above SMA20'); } else { score -= 1; reasons.push('Price below SMA20'); } }
    if (sma50 && sma50.length > 0) { const val = sma50[sma50.length - 1]; if (price > val) { score += 1; reasons.push('Price above SMA50'); } else { score -= 1; reasons.push('Price below SMA50'); } }
    if (sma20 && sma50 && sma20.length > 0 && sma50.length > 0) { if (sma20[sma20.length - 1] > sma50[sma50.length - 1]) { score += 1; reasons.push('Golden cross (SMA20 > SMA50)'); } else { score -= 1; reasons.push('Death cross (SMA20 < SMA50)'); } }
    return { name: 'Moving Averages', signal: score > 0 ? 'BUY' : score < 0 ? 'SELL' : 'HOLD', strength: Math.abs(score) / 3, reasons };
  }

  getRSISignal(rsi) {
    if (!rsi || rsi.length === 0) return { name: 'RSI', signal: 'HOLD', strength: 0, reasons: ['Insufficient data'] };
    const current = rsi[rsi.length - 1]; let signal = 'HOLD'; let strength = 0; let reasons = [`RSI: ${current.toFixed(1)}`];
    if (current < 30) { signal = 'BUY'; strength = (30 - current) / 30; reasons.push('Oversold territory'); }
    else if (current < 40) { signal = 'BUY'; strength = 0.3; reasons.push('Approaching oversold'); }
    else if (current > 70) { signal = 'SELL'; strength = (current - 70) / 30; reasons.push('Overbought territory'); }
    else if (current > 60) { signal = 'SELL'; strength = 0.3; reasons.push('Approaching overbought'); }
    else { signal = 'HOLD'; strength = 0.1; reasons.push('Neutral zone'); }
    return { name: 'RSI', signal, strength: Math.min(strength, 1), reasons };
  }

  getMACDSignal(macd) {
    if (!macd) return { name: 'MACD', signal: 'HOLD', strength: 0, reasons: ['Insufficient data'] };
    const { MACD: macdVal, signal: signalVal, histogram } = macd;
    let sig = 'HOLD'; let strength = 0; let reasons = [];
    if (histogram > 0) { sig = 'BUY'; strength = Math.min(Math.abs(histogram) / 5, 1); reasons.push('MACD histogram positive'); if (macdVal > signalVal) reasons.push('MACD above signal line'); }
    else if (histogram < 0) { sig = 'SELL'; strength = Math.min(Math.abs(histogram) / 5, 1); reasons.push('MACD histogram negative'); if (macdVal < signalVal) reasons.push('MACD below signal line'); }
    return { name: 'MACD', signal: sig, strength, reasons };
  }

  getBollingerSignal(price, bb) {
    if (!bb) return { name: 'Bollinger Bands', signal: 'HOLD', strength: 0, reasons: ['Insufficient data'] };
    const { upper, middle, lower } = bb; let signal = 'HOLD'; let strength = 0; let reasons = [];
    if (price <= lower) { signal = 'BUY'; strength = 0.8; reasons.push('Price at/below lower Bollinger Band'); }
    else if (price >= upper) { signal = 'SELL'; strength = 0.8; reasons.push('Price at/above upper Bollinger Band'); }
    else if (price < middle) { signal = 'BUY'; strength = (middle - price) / (middle - lower) * 0.5; reasons.push('Price below middle band'); }
    else { signal = 'SELL'; strength = (price - middle) / (upper - middle) * 0.5; reasons.push('Price above middle band'); }
    return { name: 'Bollinger Bands', signal, strength: Math.min(strength, 1), reasons };
  }

  getVolumeSignal(volumeAnalysis) {
    const { trend, ratio } = volumeAnalysis; let signal = 'HOLD'; let strength = 0; let reasons = [`Volume ratio: ${ratio}x avg`];
    if (trend === 'high') { signal = 'BUY'; strength = 0.5; reasons.push('High volume — strong interest'); }
    else if (trend === 'low') { signal = 'HOLD'; strength = 0.2; reasons.push('Low volume — weak conviction'); }
    return { name: 'Volume', signal, strength, reasons };
  }

  getEMACrossoverSignal(ema12, ema26) {
    if (!ema12 || !ema26 || ema12.length < 2 || ema26.length < 2) return { name: 'EMA Crossover', signal: 'HOLD', strength: 0, reasons: ['Insufficient data'] };
    const curr12 = ema12[ema12.length - 1]; const prev12 = ema12[ema12.length - 2];
    const curr26 = ema26[ema26.length - 1]; const prev26 = ema26[ema26.length - 2];
    let signal = 'HOLD'; let strength = 0; let reasons = [];
    if (prev12 <= prev26 && curr12 > curr26) { signal = 'BUY'; strength = 0.9; reasons.push('Bullish EMA crossover (12 crossed above 26)'); }
    else if (prev12 >= prev26 && curr12 < curr26) { signal = 'SELL'; strength = 0.9; reasons.push('Bearish EMA crossover (12 crossed below 26)'); }
    else if (curr12 > curr26) { signal = 'BUY'; strength = 0.4; reasons.push('EMA12 above EMA26 — bullish trend'); }
    else { signal = 'SELL'; strength = 0.4; reasons.push('EMA12 below EMA26 — bearish trend'); }
    return { name: 'EMA Crossover', signal, strength, reasons };
  }

  aggregateSignals(signals) {
    let buyScore = 0; let sellScore = 0; let totalWeight = 0;
    const weights = { 'Moving Averages': 2, 'RSI': 1.5, 'MACD': 2, 'Bollinger Bands': 1.5, 'Volume': 1, 'EMA Crossover': 2 };
    for (const sig of signals) {
      const weight = weights[sig.name] || 1; totalWeight += weight;
      if (sig.signal === 'BUY') buyScore += sig.strength * weight;
      else if (sig.signal === 'SELL') sellScore += sig.strength * weight;
    }
    const buyConfidence = (buyScore / totalWeight) * 100;
    const sellConfidence = (sellScore / totalWeight) * 100;
    let signal, confidence, message;
    if (buyConfidence > sellConfidence && buyConfidence > 25) { signal = 'BUY'; confidence = Math.round(Math.min(buyConfidence, 95)); message = `Technical indicators suggest a buying opportunity with ${confidence}% confidence.`; }
    else if (sellConfidence > buyConfidence && sellConfidence > 25) { signal = 'SELL'; confidence = Math.round(Math.min(sellConfidence, 95)); message = `Technical indicators suggest selling with ${confidence}% confidence.`; }
    else { signal = 'HOLD'; confidence = Math.round(100 - Math.max(buyConfidence, sellConfidence)); message = `Mixed signals — recommend holding position. Confidence: ${confidence}%.`; }
    return { signal, confidence, message };
  }
}

export default new PredictionService();
