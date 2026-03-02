import React, { useState, useEffect, createContext, useContext } from 'react';
import type { CandleData, Trade } from '../types';
import { marketDataService } from '../services/MarketDataService';

interface GameState {
  isPlaying: boolean;
  speed: number;
  balance: number;
  currentPrice: number;
  currentCandle: CandleData | null;
  candles: CandleData[];
  trades: Trade[];
  theme: 'dark' | 'light';
  selectedSymbol: string;
  togglePlay: () => void;
  toggleTheme: () => void;
  setSpeed: (s: number) => void;
  setSymbol: (symbol: string, token: string) => void;
  placeOrder: (type: 'BUY' | 'SELL', qty: number) => void;
  closePosition: (tradeId: string) => void;
  resetSimulation: () => void;
}


export const GameContext = createContext<GameState | null>(null);

export const useGame = (): GameState => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

export const GameProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [balance, setBalance] = useState(100000);
  const [currentPrice, setCurrentPrice] = useState(21500);
  const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]); // <--- NEW STATE
  const [trades, setTrades] = useState<Trade[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedSymbol, setSelectedSymbol] = useState('');

  useEffect(() => {
    if (!isPlaying) {
      marketDataService.disconnect();
      return;
    }

    marketDataService.connect(speed);

    marketDataService.onMessage((payload: any) => {
      if (payload.type === 'CANDLE') {
        const d = payload.data;
        const rawTime = new Date(d.timestamp).getTime() / 1000;
        const timestamp = rawTime + 19800;

        const newCandle = {
          time: timestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
        };

        setCurrentCandle(newCandle);
        setCandles(prev => [...prev, newCandle]); // Add to history
        setCurrentPrice(d.close);
      }

      if (payload.type === 'BATCH') {
        const batchData = payload.data;
        if (batchData && batchData.length > 0) {
          const lastItem = batchData[batchData.length - 1];
          setCurrentPrice(lastItem.price);

          setCurrentCandle(prevCandle => {
            let newCandle = prevCandle ? { ...prevCandle } : null;

            batchData.forEach((tick: any) => {
              const rawTime = new Date(tick.timestamp).getTime() / 1000;
              const shiftedTime = rawTime + 19800;
              const candleTime = Math.floor(shiftedTime / 60) * 60;

              if (!newCandle || candleTime !== newCandle.time) {
                newCandle = {
                  time: candleTime,
                  open: tick.price,
                  high: tick.price,
                  low: tick.price,
                  close: tick.price
                };
              } else {
                newCandle.high = Math.max(newCandle.high, tick.price);
                newCandle.low = Math.min(newCandle.low, tick.price);
                newCandle.close = tick.price;
              }
            });
            return newCandle;
          });
        }
      }

      if (payload.type === 'TICK') {
        const price = payload.data.price;
        setCurrentPrice(price);

        // Update Current Candle Live
        setCurrentCandle(prev => {
          if (!prev) {
            // Initialize first candle from tick
            const rawTime = new Date(payload.data.timestamp).getTime() / 1000;
            const timestamp = rawTime + 19800;
            const newCandle = {
              time: timestamp,
              open: price,
              high: price,
              low: price,
              close: price
            };

            // Add to history if not exists (or replace last if same time... logic needed)
            // Ideally, we add to 'candles' only when a *new* candle starts.
            // But here we are just setting the 'current'.
            return newCandle;
          }

          // Check if tick belongs to new time (minute change)
          const rawTime = new Date(payload.data.timestamp).getTime() / 1000;
          const timestamp = rawTime + 19800;

          if (timestamp > prev.time) {
            // NEW CANDLE STARTED
            // Commit the *previous* candle to history
            setCandles(prevHist => {
              // Avoid duplicates: check if last candle time is same
              if (prevHist.length > 0 && prevHist[prevHist.length - 1].time === prev.time) {
                return [...prevHist.slice(0, -1), prev]; // Update last
              }
              return [...prevHist, prev];
            });

            return {
              time: timestamp,
              open: price,
              high: price,
              low: price,
              close: price
            };
          }

          // Update existing candle
          return {
            ...prev,
            high: Math.max(prev.high, price),
            low: Math.min(prev.low, price),
            close: price
          };
        });
      }
    });

    return () => {
      marketDataService.disconnect();
    };
  }, [isPlaying, speed]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const setSymbol = (symbol: string, _token: string) => setSelectedSymbol(symbol);

  const placeOrder = (type: 'BUY' | 'SELL', quantity: number) => {
    const newTrade: Trade = {
      id: Math.random().toString(36).substr(2, 9),
      symbol: selectedSymbol,
      type,
      entryPrice: currentPrice,
      quantity,
      timestamp: new Date(currentCandle ? currentCandle.time * 1000 : Date.now()),
      status: 'OPEN'
    };
    setTrades([newTrade, ...trades]);
  };

  const closePosition = (tradeId: string) => {
    setTrades(prevTrades => prevTrades.map(trade => {
      if (trade.id === tradeId && trade.status === 'OPEN') {
        const exitPrice = currentPrice;
        const multiplier = trade.type === 'BUY' ? 1 : -1;
        const pnl = (exitPrice - trade.entryPrice) * trade.quantity * multiplier;
        setBalance(prev => prev + pnl);
        return { ...trade, status: 'CLOSED', exitPrice, pnl };
      }
      return trade;
    }));
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setBalance(100000);
    setTrades([]);
    setCurrentCandle(null);
  };

  return (
    <GameContext.Provider value={{
      isPlaying, speed, balance, currentPrice, currentCandle, candles, trades,
      theme, selectedSymbol,
      togglePlay, toggleTheme, setSpeed, setSymbol, placeOrder, closePosition, resetSimulation
    }}>
      {children}
    </GameContext.Provider>
  );
};