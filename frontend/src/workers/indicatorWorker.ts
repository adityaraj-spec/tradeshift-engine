import {
  calculateSMA,
  calculateEMA,
  calculateWMA,
  calculateBollingerBands,
  calculateRSI,
  calculateMACD,
} from '../utils/indicatorCalculations';
import type { OHLCV } from '../utils/indicatorCalculations';

interface WorkerMessage {
  type: 'CALCULATE';
  data: OHLCV[];
  indicators: {
    id: string;
    type: string;
    params: any;
  }[];
  symbol: string;
  timeframe: string;
}

const cache: Record<string, any> = {};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data, indicators, symbol, timeframe } = e.data;

  if (type === 'CALCULATE') {
    const results: Record<string, any> = {};
    const dataHash = data.length > 0 ? `${data[0].time}-${data[data.length - 1].time}-${data.length}` : 'empty';

    indicators.forEach((ind) => {
      const cacheKey = `${symbol}-${timeframe}-${ind.type}-${JSON.stringify(ind.params)}-${dataHash}`;
      
      if (cache[cacheKey]) {
        results[ind.id] = cache[cacheKey];
        return;
      }

      let result = null;
      switch (ind.type) {
        case 'SMA':
          result = calculateSMA(data, ind.params.period, ind.params.source, ind.params.offset);
          break;
        case 'EMA':
          result = calculateEMA(data, ind.params.period);
          break;
        case 'VWAP':
          result = calculateWMA(data, ind.params.period);
          break;
        case 'BB':
          result = calculateBollingerBands(data, ind.params.period, ind.params.stdDev, ind.params.basisMaType, ind.params.source);
          break;
        case 'RSI':
          result = calculateRSI(data, ind.params);
          break;
        case 'MACD':
          result = calculateMACD(data, ind.params);
          break;
      }

      if (result) {
        cache[cacheKey] = result;
        results[ind.id] = result;
      }
    });

    self.postMessage({ type: 'RESULTS', results });
  }
};
