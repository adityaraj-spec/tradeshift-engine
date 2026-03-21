import { 
  LineSeries, 
  HistogramSeries, 
  CandlestickSeries,
  type IChartApi, 
  type ISeriesApi 
} from "@pipsend/charts";
import { useIndicatorSettings } from '../store/useIndicatorSettings';
import { useDrawingSettings } from '../store/useDrawingSettings';
import type { OHLCV } from '../utils/indicatorCalculations';
import { useState, useRef, useEffect, useCallback } from 'react';

export const useChartIndicators = (chart: IChartApi | null, series: ISeriesApi<any> | null) => {
  const [activeIndicators, setActiveIndicators] = useState<Record<string, any>>({});
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});
  const { settings } = useIndicatorSettings();
  const { hiddenLayers } = useDrawingSettings();
  const workerRef = useRef<Worker | null>(null);
  const seriesRef = useRef<Record<string, ISeriesApi<any>>>({});
  const resultsRef = useRef<Record<string, any>>({});
  const [hoverValues, setHoverValues] = useState<Record<string, any> | null>(null);
  
  // Clear series if chart changes
  useEffect(() => {
    setActiveIndicators({});
    setCurrentValues({});
    seriesRef.current = {};
  }, [chart, series]);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/indicatorWorker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      const { type, results } = e.data;
      if (type === 'RESULTS') {
        const newCurrentValues: Record<string, any> = {};
        
        Object.entries(results).forEach(([id, data]) => {
          resultsRef.current[id] = data;
          
          // Fast lookup cache
          if (id === 'BB' && (data as any).upper) {
            const d = data as any;
            (resultsRef.current as any)[`${id}_map`] = {
              upper: new Map(d.upper.map((p: any) => [p.time, p])),
              middle: new Map(d.middle.map((p: any) => [p.time, p])),
              lower: new Map(d.lower.map((p: any) => [p.time, p]))
            };
          } else if (id === 'RSI' && (data as any).rsi) {
            const d = data as any;
            (resultsRef.current as any)[`${id}_map`] = {
              rsi: new Map(d.rsi.map((p: any) => [p.time, p])),
              ma: new Map(d.ma.map((p: any) => [p.time, p])),
              upper: new Map(d.upper.map((p: any) => [p.time, p])),
              lower: new Map(d.lower.map((p: any) => [p.time, p]))
            };
          } else if (id === 'MACD' && (data as any).macd) {
            const d = data as any;
            (resultsRef.current as any)[`${id}_map`] = {
              macd: new Map(d.macd.map((p: any) => [p.time, p])),
              signal: new Map(d.signal.map((p: any) => [p.time, p])),
              histogram: new Map(d.histogram.map((p: any) => [p.time, p]))
            };
          } else if (Array.isArray(data)) {
            (resultsRef.current as any)[`${id}_map`] = new Map(data.map((p: any) => [p.time, p]));
          }

          const s = seriesRef.current[id];
          const dataArray = data as any[];
          const lastVal = dataArray && dataArray.length > 0 ? dataArray[dataArray.length - 1] : null;

          if (s) {
            if (id === 'BB' && (data as any).upper) {
              const d = data as any;
              seriesRef.current['BB_upper']?.setData(d.upper);
              seriesRef.current['BB_basis']?.setData(d.middle);
              seriesRef.current['BB_lower']?.setData(d.lower);
              
              const fillData = d.upper.map((u: any, i: number) => ({
                time: u.time,
                open: d.lower[i]?.value,
                high: u.value,
                low: d.lower[i]?.value,
                close: u.value
              }));
              seriesRef.current['BB_fill']?.setData(fillData);
              
              const lastUpper = d.upper[d.upper.length - 1];
              const lastMiddle = d.middle[d.middle.length - 1];
              const lastLower = d.lower[d.lower.length - 1];
              newCurrentValues[id] = { upper: lastUpper?.value, middle: lastMiddle?.value, lower: lastLower?.value };
            } else if (id === 'RSI' && (data as any).rsi) {
              const d = data as any;
              seriesRef.current['RSI_main']?.setData(d.rsi);
              seriesRef.current['RSI_ma']?.setData(d.ma);
              seriesRef.current['RSI_upper']?.setData(d.upper);
              seriesRef.current['RSI_lower']?.setData(d.lower);

              // Cloud fill (30-70)
              const levels = settings.RSI;
              const cloudData = d.rsi.map((p: any) => ({
                time: p.time,
                open: levels.lowerLevel,
                high: levels.upperLevel,
                low: levels.lowerLevel,
                close: levels.upperLevel
              }));
              seriesRef.current['RSI_cloud']?.setData(cloudData);

              // Overbought Fill (RSI > 70)
              const obData = d.rsi.map((p: any) => {
                const val = p.value;
                const isOB = val > levels.upperLevel;
                return {
                  time: p.time,
                  open: isOB ? levels.upperLevel : val,
                  high: isOB ? val : val,
                  low: isOB ? levels.upperLevel : val,
                  close: isOB ? val : val
                };
              });
              seriesRef.current['RSI_ob']?.setData(obData);

              // Oversold Fill (RSI < 30)
              const osData = d.rsi.map((p: any) => {
                const val = p.value;
                const isOS = val < levels.lowerLevel;
                return {
                  time: p.time,
                  open: isOS ? val : val,
                  high: isOS ? levels.lowerLevel : val,
                  low: isOS ? val : val,
                  close: isOS ? levels.lowerLevel : val
                };
              });
              seriesRef.current['RSI_os']?.setData(osData);
              
              // Static Levels
              const levelUpData = d.rsi.map((p: any) => ({ time: p.time, value: levels.upperLevel }));
              const levelMidData = d.rsi.map((p: any) => ({ time: p.time, value: levels.middleLevel }));
              const levelLowData = d.rsi.map((p: any) => ({ time: p.time, value: levels.lowerLevel }));
              seriesRef.current['RSI_level_up']?.setData(levelUpData);
              seriesRef.current['RSI_level_mid']?.setData(levelMidData);
              seriesRef.current['RSI_level_low']?.setData(levelLowData);
              
              const lastRsi = d.rsi[d.rsi.length - 1];
              const lastMa = d.ma[d.ma.length - 1];
              const lastUp = d.upper[d.upper.length - 1];
              const lastLo = d.lower[d.lower.length - 1];
              newCurrentValues[id] = { 
                rsi: lastRsi?.value, 
                ma: lastMa?.value, 
                upper: lastUp?.value, 
                lower: lastLo?.value,
                maType: settings.RSI.maType 
              };
            } else if (id === 'MACD' && (data as any).macd) {
              const d = data as any;
              seriesRef.current['MACD_line']?.setData(d.macd);
              seriesRef.current['MACD_signal']?.setData(d.signal);
              seriesRef.current['MACD_hist']?.setData(d.histogram);
              const zeroLineData = d.macd.map((p: any) => ({ time: p.time, value: 0 }));
              seriesRef.current['MACD_zero']?.setData(zeroLineData);
              
              const lastMACD = d.macd[d.macd.length - 1];
              const lastSignal = d.signal[d.signal.length - 1];
              const lastHist = d.histogram[d.histogram.length - 1];
               newCurrentValues[id] = { 
                 macd: lastMACD?.value, 
                 signal: lastSignal?.value, 
                 histogram: lastHist?.value,
                 histColor: lastHist?.color 
               };
            } else {
              if (s) s.setData(dataArray);
              if (lastVal) {
                newCurrentValues[id] = lastVal.value;
              }
            }
          }
        });
        
        setCurrentValues(prev => ({ ...prev, ...newCurrentValues }));
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const requestCalculation = useCallback(() => {
    if (!workerRef.current || !series || !chart) return;

    const data = series.data() as OHLCV[];
    if (!data || data.length === 0) return;

    const indicators = Object.entries(activeIndicators).map(([id, type]) => ({
      id,
      type,
      params: (settings as any)[type] || {},
    }));

    workerRef.current.postMessage({
      type: 'CALCULATE',
      data,
      indicators,
      symbol: 'BTCUSDT', // TODO: Get from props
      timeframe: '1h',    // TODO: Get from props
    });
  }, [activeIndicators, settings, series, chart]);

  useEffect(() => {
    requestCalculation();
  }, [requestCalculation]);

  // Sync series options (color, thickness) with settings
  useEffect(() => {
    Object.entries(activeIndicators).forEach(([id, type]) => {
      const s = seriesRef.current[id];
      const indicatorSettings = (settings as any)[type];
      if (s && indicatorSettings) {
        if (type === 'SMA' || type === 'EMA' || type === 'VWAP' || type === 'RSI') {
          s.applyOptions({
            color: indicatorSettings.color,
            lineWidth: indicatorSettings.thickness || indicatorSettings.lineWidth || 2,
            lineStyle: indicatorSettings.style === 'dashed' ? 2 : indicatorSettings.style === 'dotted' ? 3 : 0,
          });
        } else if (type === 'BB') {
          seriesRef.current['BB_upper']?.applyOptions({ color: indicatorSettings.upperColor, lineWidth: indicatorSettings.upperWidth });
          seriesRef.current['BB_basis']?.applyOptions({ color: indicatorSettings.basisColor, lineWidth: indicatorSettings.basisWidth });
          seriesRef.current['BB_lower']?.applyOptions({ color: indicatorSettings.lowerColor, lineWidth: indicatorSettings.lowerWidth });
          seriesRef.current['BB_fill']?.applyOptions({ 
            upColor: indicatorSettings.fillColor, 
            downColor: indicatorSettings.fillColor,
            visible: indicatorSettings.showBackground 
          });
        } else if (type === 'RSI') {
          const s = settings.RSI;
          seriesRef.current['RSI_main']?.applyOptions({ color: s.color, lineWidth: s.lineWidth });
          seriesRef.current['RSI_ma']?.applyOptions({ color: s.maColor, lineWidth: s.maWidth, visible: s.maType !== 'None' });
          seriesRef.current['RSI_upper']?.applyOptions({ color: s.bbColor, visible: s.maType === 'SMA + Bollinger Bands' });
          seriesRef.current['RSI_lower']?.applyOptions({ color: s.bbColor, visible: s.maType === 'SMA + Bollinger Bands' });
          seriesRef.current['RSI_level_up']?.applyOptions({ color: s.upperColor, visible: s.showLevels });
          seriesRef.current['RSI_level_mid']?.applyOptions({ color: s.middleColor, visible: s.showLevels });
          seriesRef.current['RSI_level_low']?.applyOptions({ color: s.lowerColor, visible: s.showLevels });
          seriesRef.current['RSI_cloud']?.applyOptions({ upColor: s.fillColor, downColor: s.fillColor, visible: s.showBackground });
          seriesRef.current['RSI_ob']?.applyOptions({ upColor: s.overboughtFill, downColor: s.overboughtFill, visible: s.showBackground });
          seriesRef.current['RSI_os']?.applyOptions({ upColor: s.oversoldFill, downColor: s.oversoldFill, visible: s.showBackground });
        } else if (type === 'MACD') {
          seriesRef.current['MACD_line']?.applyOptions({ color: indicatorSettings.macdColor });
          seriesRef.current['MACD_signal']?.applyOptions({ color: indicatorSettings.signalColor });
        }
      }
    });
  }, [settings, activeIndicators]);

  const addSMA = useCallback(() => {
    if (!chart) return;
    const id = 'SMA';
    const s = chart.addSeries(LineSeries, { color: settings.SMA.color, lineWidth: 2, title: '', statusLineVisible: false } as any, 0);
    seriesRef.current[id] = s;
    setActiveIndicators(prev => ({ ...prev, [id]: 'SMA' }));
  }, [chart, settings.SMA]);

  const addEMA = useCallback(() => {
    if (!chart) return;
    const id = 'EMA';
    const s = chart.addSeries(LineSeries, { color: settings.EMA.color, lineWidth: 2, title: '', statusLineVisible: false } as any, 0);
    seriesRef.current[id] = s;
    setActiveIndicators(prev => ({ ...prev, [id]: 'EMA' }));
  }, [chart, settings.EMA]);

  const addVWAP = useCallback(() => {
    if (!chart) return;
    const id = 'VWAP';
    const s = chart.addSeries(LineSeries, { color: settings.VWAP.color, lineWidth: 2, title: '', statusLineVisible: false } as any, 0);
    seriesRef.current[id] = s;
    setActiveIndicators(prev => ({ ...prev, [id]: 'VWAP' }));
  }, [chart, settings.VWAP]);

  const addBB = useCallback(() => {
    if (!chart) return;
    const id = 'BB';
    const s = settings.BB;
    
    // Background fill (using CandlestickSeries to avoid zero-baseline compression)
    seriesRef.current['BB_fill'] = chart.addSeries(CandlestickSeries as any, { 
      upColor: s.fillColor, 
      downColor: s.fillColor,
      borderVisible: true,
      borderUpColor: s.fillColor,
      borderDownColor: s.fillColor,
      wickVisible: false,
      title: '',
      statusLineVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    } as any, 0);

    // Basis, Upper, Lower lines
    seriesRef.current['BB_upper'] = chart.addSeries(LineSeries, { color: s.upperColor, lineWidth: s.upperWidth, title: '', statusLineVisible: false } as any, 0);
    seriesRef.current['BB_basis'] = chart.addSeries(LineSeries, { color: s.basisColor, lineWidth: s.basisWidth, title: '', statusLineVisible: false } as any, 0);
    seriesRef.current['BB_lower'] = chart.addSeries(LineSeries, { color: s.lowerColor, lineWidth: s.lowerWidth, title: '', statusLineVisible: false } as any, 0);
    
    seriesRef.current[id] = seriesRef.current['BB_basis']; 
    setActiveIndicators(prev => ({ ...prev, [id]: 'BB' }));
  }, [chart, settings.BB]);

  const addRSI = useCallback(() => {
    if (!chart) return;
    const id = 'RSI';
    const s = settings.RSI;

    // Levels (Constant price lines)
    const levelOpts = { lineWidth: 1, lineStyle: 2, lastValueVisible: false, priceLineVisible: false, statusLineVisible: false };
    seriesRef.current['RSI_level_up'] = chart.addSeries(LineSeries, { ...levelOpts, color: s.upperColor } as any, 1);
    seriesRef.current['RSI_level_mid'] = chart.addSeries(LineSeries, { ...levelOpts, color: s.middleColor, lineStyle: 3 } as any, 1);
    seriesRef.current['RSI_level_low'] = chart.addSeries(LineSeries, { ...levelOpts, color: s.lowerColor } as any, 1);

    // Set static level data
    // We'll set this when calculation results come in to match the time range
    
    // Cloud Fill (30-70)
    seriesRef.current['RSI_cloud'] = chart.addSeries(CandlestickSeries as any, { 
      upColor: s.fillColor, downColor: s.fillColor, borderVisible: false, wickVisible: false,
      title: '', statusLineVisible: false, lastValueVisible: false, priceLineVisible: false,
    } as any, 1);

    // Overbought/Oversold Fills
    seriesRef.current['RSI_ob'] = chart.addSeries(CandlestickSeries as any, { 
      upColor: s.overboughtFill, downColor: s.overboughtFill, borderVisible: false, wickVisible: false,
      title: '', statusLineVisible: false, lastValueVisible: false, priceLineVisible: false,
    } as any, 1);
    seriesRef.current['RSI_os'] = chart.addSeries(CandlestickSeries as any, { 
      upColor: s.oversoldFill, downColor: s.oversoldFill, borderVisible: false, wickVisible: false,
      title: '', statusLineVisible: false, lastValueVisible: false, priceLineVisible: false,
    } as any, 1);

    // Main RSI Line
    seriesRef.current['RSI_main'] = chart.addSeries(LineSeries, { color: s.color, lineWidth: s.lineWidth, title: 'RSI', statusLineVisible: true } as any, 1);
    seriesRef.current['RSI_ma'] = chart.addSeries(LineSeries, { color: s.maColor, lineWidth: s.maWidth, title: 'RSI MA', statusLineVisible: true } as any, 1);
    seriesRef.current['RSI_upper'] = chart.addSeries(LineSeries, { color: s.bbColor, lineWidth: 1, title: 'Upper', statusLineVisible: false } as any, 1);
    seriesRef.current['RSI_lower'] = chart.addSeries(LineSeries, { color: s.bbColor, lineWidth: 1, title: 'Lower', statusLineVisible: false } as any, 1);

    seriesRef.current[id] = seriesRef.current['RSI_main'];
    setActiveIndicators(prev => ({ ...prev, [id]: 'RSI' }));
  }, [chart, settings.RSI]);

  const addMACD = useCallback(() => {
    if (!chart) return;
    const id = 'MACD';
    seriesRef.current['MACD_line'] = chart.addSeries(LineSeries, { color: settings.MACD.macdColor, lineWidth: 2, title: '', statusLineVisible: false } as any, 1);
    seriesRef.current['MACD_signal'] = chart.addSeries(LineSeries, { color: settings.MACD.signalColor, lineWidth: 2, title: '', statusLineVisible: false } as any, 1);
    seriesRef.current['MACD_hist'] = chart.addSeries(HistogramSeries, { color: settings.MACD.histogramPositive, title: '', statusLineVisible: false } as any, 1);
    seriesRef.current['MACD_zero'] = chart.addSeries(LineSeries, { color: 'rgba(120, 123, 134, 0.4)', lineWidth: 1, lineStyle: 2, title: '', statusLineVisible: false } as any, 1);
    seriesRef.current[id] = seriesRef.current['MACD_line']; 
    setActiveIndicators(prev => ({ ...prev, [id]: 'MACD' }));
  }, [chart, settings.MACD]);

  const removeIndicator = useCallback((id: string) => {
    setActiveIndicators(prev => {
      const next = { ...prev };
      const s = seriesRef.current[id];
      if (s && chart) {
        // Helper to safely remove a series — resilient to chart mid-reinit during replay
        const safeRemove = (sid: string) => {
          try {
            if (seriesRef.current[sid]) {
              chart.removeSeries(seriesRef.current[sid]);
            }
          } catch (e) {
            console.warn(`[Indicators] Safe removal of ${sid} failed (chart may be reinitializing):`, e);
          }
          delete seriesRef.current[sid];
        };

        if (id === 'RSI') {
          ['RSI_main', 'RSI_ma', 'RSI_upper', 'RSI_lower', 'RSI_level_up', 'RSI_level_mid', 'RSI_level_low', 'RSI_cloud', 'RSI_ob', 'RSI_os'].forEach(safeRemove);
        } else if (id === 'BB') {
          ['BB_upper', 'BB_basis', 'BB_lower', 'BB_fill'].forEach(safeRemove);
        } else if (id === 'MACD') {
          ['MACD_line', 'MACD_signal', 'MACD_hist', 'MACD_zero'].forEach(safeRemove);
        } else {
          safeRemove(id);
        }
        delete seriesRef.current[id];
        delete next[id];
      }
      return next;
    });
  }, [chart]);

  const removeAll = useCallback(() => {
    Object.keys(activeIndicators).forEach(removeIndicator);
  }, [activeIndicators, removeIndicator]);

  const setIndicatorVisibility = useCallback((id: string, visible: boolean) => {
    if (id === 'RSI') {
      const s = settings.RSI;
      seriesRef.current['RSI_main']?.applyOptions({ visible });
      seriesRef.current['RSI_ma']?.applyOptions({ visible: visible && s.maType !== 'None' });
      seriesRef.current['RSI_upper']?.applyOptions({ visible: visible && s.maType === 'SMA + Bollinger Bands' });
      seriesRef.current['RSI_lower']?.applyOptions({ visible: visible && s.maType === 'SMA + Bollinger Bands' });
      seriesRef.current['RSI_level_up']?.applyOptions({ visible: visible && s.showLevels });
      seriesRef.current['RSI_level_mid']?.applyOptions({ visible: visible && s.showLevels });
      seriesRef.current['RSI_level_low']?.applyOptions({ visible: visible && s.showLevels });
      seriesRef.current['RSI_cloud']?.applyOptions({ visible: visible && s.showBackground });
      seriesRef.current['RSI_ob']?.applyOptions({ visible: visible && s.showBackground });
      seriesRef.current['RSI_os']?.applyOptions({ visible: visible && s.showBackground });
    } else if (id === 'BB') {
      seriesRef.current['BB_upper']?.applyOptions({ visible });
      seriesRef.current['BB_basis']?.applyOptions({ visible });
      seriesRef.current['BB_lower']?.applyOptions({ visible });
      seriesRef.current['BB_fill']?.applyOptions({ visible: visible && settings.BB.showBackground });
    } else if (id === 'MACD') {
      seriesRef.current['MACD_line']?.applyOptions({ visible });
      seriesRef.current['MACD_signal']?.applyOptions({ visible });
      seriesRef.current['MACD_hist']?.applyOptions({ visible });
    } else {
      seriesRef.current[id]?.applyOptions({ visible });
    }
  }, [settings.BB.showBackground, settings.RSI]);

  // Sync global indicator visibility
  useEffect(() => {
    Object.keys(activeIndicators).forEach(id => {
      setIndicatorVisibility(id, !hiddenLayers.indicators);
    });
  }, [hiddenLayers.indicators, activeIndicators, setIndicatorVisibility]);

  const updateHoverValues = useCallback((time: number | string | null) => {
    if (time === null) {
      setHoverValues(null);
      return;
    }

    const newHoverValues: Record<string, any> = {};
    Object.entries(resultsRef.current).forEach(([id, data]) => {
      if (id.endsWith('_map')) return; // Skip cache maps

      const cache = (resultsRef.current as any)[`${id}_map`];
      if (!cache) return;

      if (id === 'BB' && (data as any).upper) {
        const up = cache.upper.get(time);
        const mid = cache.middle.get(time);
        const low = cache.lower.get(time);
        if (up || mid || low) {
          newHoverValues[id] = { upper: up?.value, middle: mid?.value, lower: low?.value };
        }
      } else if (id === 'RSI' && (data as any).rsi) {
        const rsi = cache.rsi.get(time);
        const ma = cache.ma.get(time);
        const up = cache.upper.get(time);
        const low = cache.lower.get(time);
        if (rsi) {
          newHoverValues[id] = { 
            rsi: rsi.value, 
            ma: ma?.value, 
            upper: up?.value, 
            lower: low?.value,
            maType: settings.RSI.maType
          };
        }
      } else if (id === 'MACD' && (data as any).macd) {
        const macd = cache.macd.get(time);
        const signal = cache.signal.get(time);
        const hist = cache.histogram.get(time);
        if (macd) {
          newHoverValues[id] = { 
            macd: macd.value, 
            signal: signal?.value, 
            histogram: hist?.value,
            histColor: (hist as any)?.color
          };
        }
      } else if (cache instanceof Map) {
        const point = cache.get(time);
        if (point) {
          newHoverValues[id] = point.value;
        }
      }
    });

    if (Object.keys(newHoverValues).length > 0) {
      setHoverValues(newHoverValues);
    } else {
      setHoverValues(null);
    }
  }, [settings.RSI.maType]);

  const applyTemplate = useCallback((template: any) => {
    if (!chart) return;
    
    console.log('🔄 Applying Indicator Template:', template.name, template.indicatorIds);
    
    // 1. Clear all current
    removeAll();
    
    // 2. Add new indicators after a small tick to ensure removal is processed
    setTimeout(() => {
      console.log('➕ Re-adding indicators from template...');
      template.indicatorIds.forEach((id: string) => {
        if (id === 'SMA') addSMA();
        else if (id === 'EMA') addEMA();
        else if (id === 'VWAP') addVWAP();
        else if (id === 'BB') addBB();
        else if (id === 'RSI') addRSI();
        else if (id === 'MACD') addMACD();
      });
    }, 50);
  }, [chart, removeAll, addSMA, addEMA, addVWAP, addBB, addRSI, addMACD]);

  return { 
    activeIndicators, 
    currentValues, 
    hoverValues,
    updateHoverValues,
    addSMA, addEMA, addVWAP, addBB, addRSI, addMACD, 
    removeIndicator, removeAll, setIndicatorVisibility,
    applyTemplate
  };
};
