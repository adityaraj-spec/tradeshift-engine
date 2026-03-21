export const DEFAULT_INDICATOR_SETTINGS = {
  SMA: { 
    period: 9, 
    source: 'close', 
    offset: 0, 
    smoothingType: 'None', 
    smoothingLength: 14, 
    bbStdDev: 2, 
    timeframe: 'Chart', 
    wait: true, 
    showLabels: true, 
    showStatusValues: true, 
    showStatusInputs: true, 
    precision: 'Default', 
    maVisible: true, 
    color: '#2962FF', 
    thickness: 1, 
    style: 'solid' 
  },
  EMA: { period: 12, source: 'close', color: '#FF9800', lineWidth: 2, lineStyle: 'solid' },
  VWAP: { color: '#9C27B0', lineWidth: 2, period: 20 },
  BB: { 
    period: 20, 
    stdDev: 2, 
    basisMaType: 'SMA',
    source: 'close', 
    offset: 0,
    basisColor: '#2196F3',
    upperColor: '#F23645',
    lowerColor: '#089981',
    fillColor: 'rgba(33, 150, 243, 0.15)',
    basisWidth: 2,
    upperWidth: 2,
    lowerWidth: 2,
    showBackground: true,
    showLabels: true,
    showStatusValues: true,
    showStatusInputs: true
  },
  RSI: { 
    period: 14, 
    source: 'close', 
    color: '#7E57C2', // Purple
    lineWidth: 2,
    maType: 'SMA',
    maLength: 14,
    maColor: '#FFD600', // Yellow
    maWidth: 2,
    bbStdDev: 2,
    bbColor: 'rgba(76, 175, 80, 0.4)', // Green
    upperLevel: 70, 
    middleLevel: 50,
    lowerLevel: 30, 
    upperColor: '#787B86',
    middleColor: '#787B86',
    lowerColor: '#787B86',
    fillColor: 'rgba(126, 87, 194, 0.1)', // Light Purple
    overboughtFill: 'rgba(0, 200, 83, 0.2)', // Green gradient top
    oversoldFill: 'rgba(255, 82, 82, 0.2)', // Red gradient bottom
    showBackground: true,
    showLevels: true,
    showLabels: true,
    showStatusValues: true,
    showStatusInputs: true
  },
  MACD: { 
    fastPeriod: 12, 
    slowPeriod: 26, 
    signalPeriod: 9, 
    source: 'close', 
    oscType: 'EMA',
    sigType: 'EMA',
    macdColor: '#2962FF', 
    signalColor: '#FF6D00', 
    posGrowing: '#26a69a',
    posFading: '#b2dfdb',
    negFading: '#ffcdd2',
    negGrowing: '#ff5252',
    histogramPositive: '#26a69a', // Backwards compatibility for legend if needed
    histogramNegative: '#ff5252' 
  }
};

export type IndicatorSettingsMap = typeof DEFAULT_INDICATOR_SETTINGS;
export type IndicatorId = keyof IndicatorSettingsMap;
