export interface OHLCV {
  time: number | string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  value?: number;
}

export interface IndicatorPoint {
  time: number | string;
  value: number;
}

/**
 * Pure calculation functions for technical indicators.
 * These are decoupled from the chart library objects.
 */

export const calculateSMA = (data: OHLCV[], period: number, source: string = 'close', offset: number = 0): IndicatorPoint[] => {
  if (!data || data.length < period) return [];
  
  const getVal = (d: OHLCV, s: string) => {
    if (s === 'open') return d.open ?? d.close ?? 0;
    if (s === 'high') return d.high ?? d.close ?? 0;
    if (s === 'low') return d.low ?? d.close ?? 0;
    if (s === 'val') return d.value ?? d.close ?? 0;
    return d.close ?? 0;
  };

  const prices = data.map(d => getVal(d, source));
  const results: IndicatorPoint[] = [];
  
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - j];
    }
    
    // Handle offset for time
    const resultIndex = i + offset;
    if (resultIndex >= 0 && resultIndex < data.length) {
      results.push({ time: data[resultIndex].time, value: sum / period });
    }
  }
  return results;
};

export const calculateEMA = (data: OHLCV[], period: number): IndicatorPoint[] => {
  if (!data || data.length < period) return [];
  const prices = data.map(d => ('close' in d ? d.close : 'value' in d ? d.value : 0) as number);
  const results: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  results.push({ time: data[period - 1].time, value: ema });

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
    results.push({ time: data[i].time, value: ema });
  }
  return results;
};

export const calculateWMA = (data: OHLCV[], period: number): IndicatorPoint[] => {
  if (!data || data.length < period) return [];
  const prices = data.map(d => ('close' in d ? d.close : 'value' in d ? d.value : 0) as number);
  const weightSum = (period * (period + 1)) / 2;
  const results: IndicatorPoint[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += prices[i - period + 1 + j] * (j + 1);
    }
    results.push({ time: data[i].time, value: sum / weightSum });
  }
  return results;
};

export const calculateRMA = (data: OHLCV[], period: number, source: string = 'close'): IndicatorPoint[] => {
  if (!data || data.length < period) return [];
  const getVal = (d: OHLCV, s: string) => {
    if (s === 'open') return d.open ?? d.close ?? 0;
    if (s === 'high') return d.high ?? d.close ?? 0;
    if (s === 'low') return d.low ?? d.close ?? 0;
    return d.close ?? 0;
  };
  const prices = data.map(d => getVal(d, source));
  const results: IndicatorPoint[] = [];

  let rma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  results.push({ time: data[period - 1].time, value: rma });

  const alpha = 1 / period;
  for (let i = period; i < prices.length; i++) {
    rma = (prices[i] - rma) * alpha + rma;
    results.push({ time: data[i].time, value: rma });
  }
  return results;
};

export const calculateVWMA = (data: OHLCV[], period: number, source: string = 'close'): IndicatorPoint[] => {
  if (!data || data.length < period) return [];
  const getVal = (d: OHLCV, s: string) => {
    if (s === 'open') return d.open ?? d.close ?? 0;
    if (s === 'high') return d.high ?? d.close ?? 0;
    if (s === 'low') return d.low ?? d.close ?? 0;
    return d.close ?? 0;
  };
  const results: IndicatorPoint[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let pvSum = 0;
    let vSum = 0;
    for (let j = 0; j < period; j++) {
      const d = data[i - j];
      const p = getVal(d, source);
      const v = d.value ?? 1; // 'value' used as volume in some contexts, or we use 1 if missing
      pvSum += p * v;
      vSum += v;
    }
    results.push({ time: data[i].time, value: pvSum / (vSum || 1) });
  }
  return results;
};

export const calculateBollingerBands = (data: OHLCV[], period: number, stdDev: number, maType: string = 'SMA', source: string = 'close') => {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
  
  const getVal = (d: OHLCV, s: string) => {
    if (s === 'open') return d.open ?? d.close ?? 0;
    if (s === 'high') return d.high ?? d.close ?? 0;
    if (s === 'low') return d.low ?? d.close ?? 0;
    return d.close ?? 0;
  };

  const prices = data.map(d => getVal(d, source));
  let middlePoints: IndicatorPoint[] = [];

  switch (maType) {
    case 'EMA': middlePoints = calculateEMA(data, period); break;
    case 'WMA': middlePoints = calculateWMA(data, period); break;
    case 'SMMA (RMA)': middlePoints = calculateRMA(data, period, source); break;
    case 'VWMA': middlePoints = calculateVWMA(data, period, source); break;
    default: middlePoints = calculateSMA(data, period, source);
  }

  const results = { upper: [] as IndicatorPoint[], middle: middlePoints, lower: [] as IndicatorPoint[] };
  
  // Align middle points with source data to calculate bands
  middlePoints.forEach(m => {
    const idx = data.findIndex(d => d.time === m.time);
    if (idx === -1 || idx < period - 1) return;

    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(prices[idx - j] - m.value, 2);
    }
    const std = Math.sqrt(variance / period);

    results.upper.push({ time: m.time, value: m.value + (std * stdDev) });
    results.lower.push({ time: m.time, value: m.value - (std * stdDev) });
  });

  return results;
};

export const calculateRSI = (data: OHLCV[], params: any) => {
  const period = params.period || 14;
  const source = params.source || 'close';
  const maType = params.maType || 'None';
  const maLength = params.maLength || 14;
  const bbStdDev = params.bbStdDev || 2;

  if (!data || data.length < period + 1) return { rsi: [], ma: [], upper: [], lower: [] };

  const getVal = (d: OHLCV, s: string) => {
    if (s === 'open') return d.open ?? d.close ?? 0;
    if (s === 'high') return d.high ?? d.close ?? 0;
    if (s === 'low') return d.low ?? d.close ?? 0;
    return d.close ?? 0;
  };

  const prices = data.map(d => getVal(d, source));
  const rsiResults: IndicatorPoint[] = [];
  const changes: number[] = [];

  for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }
  avgGain /= period;
  avgLoss /= period;

  const calculateSingleRSI = (gain: number, loss: number) => {
    if (loss === 0) return 100;
    if (gain === 0) return 0;
    const rs = gain / loss;
    return 100 - (100 / (1 + rs));
  };

  rsiResults.push({ time: data[period].time, value: calculateSingleRSI(avgGain, avgLoss) });

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    // RMA smoothing as per TV RSI
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rsiResults.push({ time: data[i + 1].time, value: calculateSingleRSI(avgGain, avgLoss) });
  }

  // RSI-based MA and BB
  if (maType === 'None') return { rsi: rsiResults, ma: [], upper: [], lower: [] };

  // Create "fake" OHLCV data from RSI points to reuse existing MA/BB functions
  const rsiOhlcv: OHLCV[] = rsiResults.map(r => ({ time: r.time, close: r.value }));
  let maSeries: IndicatorPoint[] = [];

  switch (maType) {
    case 'EMA': maSeries = calculateEMA(rsiOhlcv, maLength); break;
    case 'SMMA (RMA)': maSeries = calculateRMA(rsiOhlcv, maLength, 'close'); break;
    case 'WMA': maSeries = calculateWMA(rsiOhlcv, maLength); break;
    case 'VWMA': maSeries = calculateVWMA(rsiOhlcv, maLength, 'close'); break; // Note: Uses dummy volume
    case 'SMA':
    case 'SMA + Bollinger Bands': 
      maSeries = calculateSMA(rsiOhlcv, maLength, 'close'); 
      break;
    default: maSeries = [];
  }

  let upper: IndicatorPoint[] = [];
  let lower: IndicatorPoint[] = [];

  if (maType === 'SMA + Bollinger Bands') {
    const bb = calculateBollingerBands(rsiOhlcv, maLength, bbStdDev, 'SMA', 'close');
    upper = bb.upper;
    lower = bb.lower;
  }

  return { rsi: rsiResults, ma: maSeries, upper, lower };
};

export const calculateMACD = (data: OHLCV[], params: any) => {
  const fastPeriod = params.fastPeriod || 12;
  const slowPeriod = params.slowPeriod || 26;
  const signalPeriod = params.signalPeriod || 9;
  const source = params.source || 'close';
  const oscType = params.oscType || 'EMA';
  const sigType = params.sigType || 'EMA';

  if (!data || data.length < Math.max(fastPeriod, slowPeriod) + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }

  const getMA = (d: OHLCV[], p: number, type: string, s: string = 'close') => {
    if (type === 'SMA') return calculateSMA(d, p, s);
    return calculateEMA(d, p); // Note: calculateEMA currently ignores 'source', but we use it for consistency
  };

  const fastMA = getMA(data, fastPeriod, oscType, source);
  const slowMA = getMA(data, slowPeriod, oscType, source);

  // Align Fast and Slow MAs
  const macdPoints: IndicatorPoint[] = [];
  const slowMap = new Map(slowMA.map(p => [p.time, p.value]));
  
  fastMA.forEach(f => {
    const sVal = slowMap.get(f.time);
    if (sVal !== undefined) {
      macdPoints.push({ time: f.time, value: f.value - sVal });
    }
  });

  if (macdPoints.length < signalPeriod) return { macd: [], signal: [], histogram: [] };

  // Calculate Signal Line (MA of MACD line)
  const macdOhlcv: OHLCV[] = macdPoints.map(p => ({ time: p.time, close: p.value }));
  const signalPoints = sigType === 'SMA' 
    ? calculateSMA(macdOhlcv, signalPeriod, 'close')
    : calculateEMA(macdOhlcv, signalPeriod);

  const signalMap = new Map(signalPoints.map(p => [p.time, p.value]));
  const finalMACD: IndicatorPoint[] = [];
  const finalSignal: IndicatorPoint[] = [];
  const finalHistogram: (IndicatorPoint & { color: string })[] = [];

  // Colors from the source code
  const posGrowing = params.posGrowing || '#26a69a';
  const posFading = params.posFading || '#b2dfdb';
  const negFading = params.negFading || '#ffcdd2';
  const negGrowing = params.negGrowing || '#ff5252';

  macdPoints.forEach((m, i) => {
    const s = signalMap.get(m.time);
    if (s !== undefined) {
      const histValue = m.value - s;
      const prevHist = i > 0 ? (macdPoints[i-1].value - (signalMap.get(macdPoints[i-1].time) ?? 0)) : 0;
      
      let color = posGrowing;
      if (histValue >= 0) {
        color = histValue > prevHist ? posGrowing : posFading;
      } else {
        color = histValue > prevHist ? negFading : negGrowing;
      }

      finalMACD.push(m);
      finalSignal.push({ time: m.time, value: s });
      finalHistogram.push({ time: m.time, value: histValue, color });
    }
  });

  return { macd: finalMACD, signal: finalSignal, histogram: finalHistogram };
};
