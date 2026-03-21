import React, { useState, useRef, useEffect } from 'react';
import { Settings, Eye, EyeOff, MoreHorizontal, Trash2, ChevronDown, ChevronUp, Bell, Plus, Star, Layers, Move, Anchor, Info, Copy, FileCode, Check } from 'lucide-react';
import { IndicatorConfigModal } from './IndicatorConfigModal';
import { PineEditorModal } from './PineEditorModal';
import { useIndicatorSettings } from '../../store/useIndicatorSettings';
import type { IndicatorId } from '../../constants/indicators';

interface Props {
  activeIds: string[];
  currentValues: Record<string, any>;
  onToggle: (id: string, forceRecreate?: boolean) => void;
  onVisibilityToggle?: (id: string, visible: boolean) => void;
}

export const IndicatorLegend: React.FC<Props> = ({ 
  activeIds, 
  currentValues,
  onToggle, 
  onVisibilityToggle
}) => {
  const { settings, updateSetting, resetToDefault } = useIndicatorSettings();
  const [configId, setConfigId] = useState<IndicatorId | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [subMenu, setSubMenu] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuId(null);
        setSubMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleVisibility = (id: string) => {
    const isNowVisible = hiddenIds.includes(id);
    setHiddenIds(prev => 
      isNowVisible ? prev.filter(i => i !== id) : [...prev, id]
    );
    if (onVisibilityToggle) {
      onVisibilityToggle(id, isNowVisible);
    }
  };

  const getParams = (id: string) => {
    const s = (settings as any)[id];
    if (!s) return '';
    if (id === 'MACD') return `${s.fastPeriod}, ${s.slowPeriod}, ${s.signalPeriod}, ${s.source}`;
    if (id === 'BB') return `${s.period}, ${s.basisMaType}, ${s.source}, ${s.stdDev}`;
    if (id === 'RSI') {
      let params = `${s.period}, ${s.source}`;
      if (s.maType !== 'None') params += `, ${s.maType}, ${s.maLength}`;
      return params;
    }
    return `${s.period}, ${s.source || 'close'}`;
  };

  const renderValues = (id: string) => {
    const val = currentValues[id];
    if (!val) return null;
    
    if (id === 'BB' && typeof val === 'object') {
      return (
        <div className="flex gap-1.5 ml-2">
          <span className="text-[#2962FF]">{val.middle?.toFixed(1) || '0.0'}</span>
          <span className="text-[#F23645]">{val.upper?.toFixed(1) || '0.0'}</span>
          <span className="text-[#089981]">{val.lower?.toFixed(1) || '0.0'}</span>
        </div>
      );
    }
    
    if (id === 'RSI' && typeof val === 'object') {
      return (
        <div className="flex gap-1.5 ml-2">
          <span className="text-[#7E57C2]">{val.rsi?.toFixed(2) || '0.00'}</span>
          {val.maType !== 'None' && <span className="text-[#FFD600]">{val.ma?.toFixed(2) || '0.00'}</span>}
          {val.maType === 'SMA + Bollinger Bands' && (
            <>
              <span className="text-[rgba(76,175,80,0.6)]">{val.upper?.toFixed(2) || '0.00'}</span>
              <span className="text-[rgba(76,175,80,0.6)]">{val.lower?.toFixed(2) || '0.00'}</span>
            </>
          )}
        </div>
      );
    }
    
    if (id === 'MACD' && typeof val === 'object') {
      return (
        <div className="flex gap-1.5 ml-2">
          <span className="text-[#2962FF]">{val.macd?.toFixed(2) || '0.00'}</span>
          <span className="text-[#FF6D00]">{val.signal?.toFixed(2) || '0.00'}</span>
          <span style={{ color: val.histColor || (val.histogram >= 0 ? '#26a69a' : '#ff5252') }}>
            {val.histogram?.toFixed(2) || '0.00'}
          </span>
        </div>
      );
    }

    return <span className="text-[#d1d4dc] ml-2">{typeof val === 'number' ? val.toFixed(2) : val}</span>;
  };

  if (activeIds.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5 pointer-events-none select-none max-w-[400px]">
      {!isCollapsed && activeIds.map((id) => {
        const isHidden = hiddenIds.includes(id);
        
        return (
          <div 
            key={id} 
            className={`group/item flex items-center gap-1.5 px-1.5 py-0 rounded transition-colors pointer-events-auto h-[22px] border border-transparent hover:border-[#2962FF] hover:bg-[#1e222d] w-fit min-w-[120px] max-w-full
              ${configId === id ? 'border-[#2962FF] bg-[#1e222d]' : ''}`}
          >
            <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden">
              <span className="text-[12px] text-[#d1d4dc] uppercase tracking-wider truncate">
                {id}
              </span>
              <span className="text-[11px] text-[#d1d4dc]/40 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                ({getParams(id)})
              </span>
              <div className="text-[11px] font-bold whitespace-nowrap">
                {renderValues(id)}
              </div>
            </div>

            <div className="flex items-center gap-0 opacity-0 group-hover/item:opacity-100 transition-opacity ml-auto bg-[#1e222d] pl-1 h-full">
              <button 
                onClick={() => toggleVisibility(id)} 
                className="p-0.5 text-[#d1d4dc]/60 hover:text-white transition-colors"
                title={isHidden ? "Show" : "Hide"}
              >
                {isHidden ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button 
                onClick={() => setConfigId(id as IndicatorId)} 
                className="p-0.5 text-[#d1d4dc]/60 hover:text-white transition-colors"
                title="Settings"
              >
                <Settings size={13} />
              </button>
              <button 
                onClick={() => onToggle(id)} 
                className="p-0.5 text-[#d1d4dc]/60 hover:text-[#f23645] transition-colors"
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
              
              <div className="relative" ref={menuId === id ? menuRef : null}>
                <button 
                  onClick={() => setMenuId(menuId === id ? null : id)}
                  className="p-0.5 text-[#d1d4dc]/60 hover:text-white transition-colors"
                  title="More"
                >
                  <MoreHorizontal size={13} />
                </button>

                {menuId === id && (
                  <div className="absolute top-0 left-full ml-1 w-[220px] bg-[#1e222d] border border-[#2a2e39] rounded shadow-2xl py-1 z-[100] text-[13px] font-medium text-[#d1d4dc]">
                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between group">
                       <div className="flex items-center gap-2"><Bell size={14} className="opacity-60" /> Add alert on {id}...</div>
                       <span className="text-[10px] opacity-20">⌥ A</span>
                     </div>
                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                       <Plus size={14} className="opacity-60" /> Add indicator/strategy on {id}...
                     </div>
                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                        <Star size={14} className="opacity-60" /> Add this indicator to favorites
                     </div>
                     
                     <div className="h-[1px] bg-[#2a2e39] my-1" />
                     
                     <div 
                        onMouseEnter={() => setSubMenu('order')}
                        className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between relative"
                     >
                       <div className="flex items-center gap-2"><Layers size={14} className="opacity-60" /> Visual order</div>
                       <span className="text-[10px] opacity-40">▶</span>
                       {subMenu === 'order' && (
                         <div className="absolute top-0 left-full ml-0 w-[180px] bg-[#1e222d] border border-[#2a2e39] rounded shadow-2xl py-1">
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Bring to front</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 opacity-40 cursor-default">Send to back</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Bring forward</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 opacity-40 cursor-default">Send backward</div>
                         </div>
                       )}
                     </div>

                     <div 
                        onMouseEnter={() => setSubMenu('visibility')}
                        className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between relative"
                     >
                       <div className="flex items-center gap-2 opacity-0 w-3.5" />
                       <span>Visibility on intervals</span>
                       <span className="text-[10px] opacity-40">▶</span>
                       {subMenu === 'visibility' && (
                         <div className="absolute top-0 left-full ml-0 w-[200px] bg-[#1e222d] border border-[#2a2e39] rounded shadow-2xl py-1">
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Current interval and above</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Current interval and below</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Current interval only</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">All intervals</div>
                         </div>
                       )}
                     </div>

                     <div 
                        onMouseEnter={() => setSubMenu('move')}
                        className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between relative"
                     >
                       <div className="flex items-center gap-2"><Move size={14} className="opacity-60" /> Move to</div>
                       <span className="text-[10px] opacity-40">▶</span>
                       {subMenu === 'move' && (
                         <div className="absolute top-0 left-full ml-0 w-[180px] bg-[#1e222d] border border-[#2a2e39] rounded shadow-2xl py-1">
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">New pane above</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">New pane below</div>
                         </div>
                       )}
                     </div>

                     <div 
                        onMouseEnter={() => setSubMenu('pin')}
                        className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between relative"
                     >
                       <div className="flex items-center gap-2"><Anchor size={14} className="opacity-60" /> Pin to scale (now right)</div>
                       <span className="text-[10px] opacity-40">▶</span>
                       {subMenu === 'pin' && (
                         <div className="absolute top-0 left-full ml-0 w-[200px] bg-[#1e222d] border border-[#2a2e39] rounded shadow-2xl py-1">
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between">
                              Pinned to right scale <Check size={14} className="text-[#2962FF]" />
                            </div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Pin to new right scale</div>
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">Pin to new left scale</div>
                            <div className="h-[1px] bg-[#2a2e39] my-1" />
                            <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer">No scale (fullscreen)</div>
                         </div>
                       )}
                     </div>

                     <div className="h-[1px] bg-[#2a2e39] my-1" />

                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                       <Info size={14} className="opacity-60" /> About this script...
                     </div>
                     <div 
                       onClick={() => { setSourceId(id); setMenuId(null); }}
                       className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                     >
                       <FileCode size={14} className="opacity-60" /> Source code...
                     </div>

                     <div className="h-[1px] bg-[#2a2e39] my-1" />

                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center justify-between group">
                       <div className="flex items-center gap-2"><Copy size={14} className="opacity-60" /> Copy</div>
                       <span className="text-[10px] opacity-20 group-hover:opacity-40">⌘ C</span>
                     </div>
                     <div 
                       onClick={() => { toggleVisibility(id); setMenuId(null); }}
                       className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                     >
                       {isHidden ? <Eye size={14} className="opacity-60" /> : <EyeOff size={14} className="opacity-60" />}
                       {isHidden ? "Show" : "Hide"}
                     </div>
                     <div 
                       onClick={() => { onToggle(id); setMenuId(null); }}
                       className="px-3 py-1.5 hover:bg-[#f23645]/10 text-[#f23645] cursor-pointer flex items-center justify-between group"
                     >
                       <div className="flex items-center gap-2"><Trash2 size={14} /> Remove</div>
                       <span className="text-[10px] opacity-20 group-hover:opacity-40">⌫</span>
                     </div>

                     <div className="h-[1px] bg-[#2a2e39] my-1" />

                     <div className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                       <Layers size={14} className="opacity-60" /> Object tree
                     </div>

                     <div className="h-[1px] bg-[#2a2e39] my-1" />
                     <div 
                       onClick={() => { setConfigId(id as IndicatorId); setMenuId(null); }}
                       className="px-3 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-2"
                     >
                        <Settings size={14} className="opacity-60" /> Settings...
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center pointer-events-auto w-fit mt-0.5 ml-0.5">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 px-1.5 bg-[#1e222d] border border-[#2a2e39] hover:bg-[#2a2e39] rounded-[3px] transition-colors text-[#d1d4dc]/60 hover:text-white"
        >
          {isCollapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      <IndicatorConfigModal 
        indicatorId={configId}
        isOpen={!!configId}
        onClose={() => setConfigId(null)}
        settings={configId ? settings[configId] : null}
        onSave={(id, newSettings) => {
          updateSetting(id, newSettings);
          onToggle(id, true);
        }}
        onReset={(id) => {
          resetToDefault(id);
          onToggle(id, true);
        }}
      />

      <PineEditorModal 
        indicatorId={sourceId}
        isOpen={!!sourceId}
        onClose={() => setSourceId(null)}
      />
    </div>
  );
};

export default IndicatorLegend;
