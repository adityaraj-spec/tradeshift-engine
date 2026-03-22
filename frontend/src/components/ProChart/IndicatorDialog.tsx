import React, { useState, useMemo } from 'react';
import { X, Search, Activity, SearchX, Check } from 'lucide-react';

interface IndicatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeIds: string[];
  onToggle: (id: string) => void;
}

const INDICATORS = [
  { id: 'SMA', name: 'Simple Moving Average', category: 'Technicals', type: 'overlay' },
  { id: 'EMA', name: 'Exponential Moving Average', category: 'Technicals', type: 'overlay' },
  { id: 'VWAP', name: 'Volume Weighted Average Price', category: 'Technicals', type: 'overlay' },
  { id: 'BB', name: 'Bollinger Bands', category: 'Technicals', type: 'overlay' },
  { id: 'RSI', name: 'Relative Strength Index', category: 'Technicals', type: 'panel' },
  { id: 'MACD', name: 'Moving Average Convergence Divergence', category: 'Technicals', type: 'panel' },
];

export const IndicatorDialog: React.FC<IndicatorDialogProps> = ({
  isOpen, onClose, activeIds, onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Technicals');

  const filteredIndicators = useMemo(() => {
    return INDICATORS.filter(ind => {
      const matchSearch = ind.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ind.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-2xl h-[70vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header - Search */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3 bg-white/[0.02] shrink-0">
          <Search className="w-5 h-5 text-white/40" />
          <input 
            type="text"
            placeholder="Search"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-base focus:outline-none focus:ring-0 placeholder-white/20"
          />
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 min-h-0">
          
          {/* Sidebar */}
          <div className="w-48 border-r border-white/5 py-4 flex flex-col gap-1 overflow-y-auto hidden sm:flex">
            <div className="px-4 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">BUILT-IN</div>
            
            <button 
              className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors ${activeCategory === 'Technicals' ? 'bg-white/5 text-tv-primary font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              onClick={() => setActiveCategory('Technicals')}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm">Technicals</span>
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 w-full text-left transition-colors text-white/30 hover:bg-white/5`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm">Fundamentals</span>
            </button>
            {/* Add more categories later if needed */}
          </div>

          {/* Main List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-4 relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white">Indicators</span>
              <span className="px-3 py-1 bg-transparent hover:bg-white/5 rounded-full text-xs font-bold text-white/60 cursor-pointer">Strategies</span>
              <span className="px-3 py-1 bg-transparent hover:bg-white/5 rounded-full text-xs font-bold text-white/60 cursor-pointer">Profiles</span>
              <span className="px-3 py-1 bg-transparent hover:bg-white/5 rounded-full text-xs font-bold text-white/60 cursor-pointer">Patterns</span>
            </div>

            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 px-2">SCRIPT NAME</div>
            
            <div className="flex flex-col gap-1">
              {filteredIndicators.length > 0 ? (
                filteredIndicators.map(ind => {
                  const isActive = activeIds.includes(ind.id);
                  return (
                    <div 
                      key={ind.id} 
                      onClick={() => onToggle(ind.id)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group transition-all duration-200 ${isActive ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold transition-colors ${isActive ? 'text-blue-400' : 'text-[#d1d4dc] group-hover:text-white'}`}>
                          {ind.name}
                        </span>
                        <span className="text-xs text-white/30 font-medium">
                          {ind.id} · {ind.category}
                        </span>
                      </div>
                      
                      {isActive ? (
                        <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-2 py-1 rounded text-xs font-bold animate-in fade-in zoom-in-[0.9]">
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-tv-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Add
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-white/30 gap-3">
                   <SearchX className="w-10 h-10 opacity-50" />
                   <div className="text-sm font-bold">No indicators found</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
