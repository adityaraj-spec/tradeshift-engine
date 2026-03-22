import React, { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { IndicatorConfigModal } from './IndicatorConfigModal';
import { useIndicatorSettings } from '../../store/useIndicatorSettings';
import type { IndicatorId } from '../../constants/indicators';

interface IndicatorToolbarProps {
  activeIds: string[];
  onToggle: (id: string, forceRecreate?: boolean) => void;
  onClearAll: () => void;
}

export const IndicatorToolbar: React.FC<IndicatorToolbarProps> = ({ activeIds, onToggle, onClearAll }) => {
  const overlayIndicators = ['SMA', 'EMA', 'VWAP', 'BB'];
  const panelIndicators = ['RSI', 'MACD'];
  
  const { settings, updateSetting, resetToDefault } = useIndicatorSettings();
  const [configId, setConfigId] = useState<IndicatorId | null>(null);

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="group relative flex items-center">
      {children}
      <span className="absolute top-full mt-2 px-2 py-1 bg-[#2a2e39] text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-[#363a45] shadow-xl">
        {text}
      </span>
    </div>
  );

  return (
    <div className="absolute top-16 left-4 z-50 flex flex-col gap-1 items-start bg-transparent p-1.5 select-none transition-all duration-300 pointer-events-none">
      <div className="flex flex-col items-start gap-1 pointer-events-auto">
        {overlayIndicators.map((id) => {
          const isActive = activeIds.includes(id);
          if (!isActive) return null;
          return (
            <div key={id} className="flex bg-[#1e222d]/90 backdrop-blur-sm border border-[#2a2e39] rounded shadow-sm items-center hover:bg-[#2a2e39] transition-all duration-200 animate-in fade-in zoom-in-95 duration-300">
               <button onClick={() => onToggle(id, true)} className="px-2 py-1 text-[11px] font-bold text-[#d1d4dc] hover:text-white whitespace-nowrap uppercase tracking-wider">{id}</button>
               <div className="w-px h-3 bg-white/10"></div>
               <Tooltip text={`Settings for ${id}`}>
                 <button onClick={() => setConfigId(id as IndicatorId)} className="px-1.5 py-1 text-white/50 hover:text-white transition-colors"><Settings size={12} /></button>
               </Tooltip>
               <Tooltip text={`Remove ${id}`}>
                 <button onClick={() => onToggle(id)} className="px-1.5 py-1 text-white/50 hover:text-[#f23645] transition-colors"><X size={12} /></button>
               </Tooltip>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-start gap-1 pointer-events-auto mt-1">
        {panelIndicators.map((id) => {
          const isActive = activeIds.includes(id);
          if (!isActive) return null;
          return (
            <div key={id} className="flex bg-[#1e222d]/90 backdrop-blur-sm border border-[#2a2e39] rounded shadow-sm items-center hover:bg-[#2a2e39] transition-all duration-200 animate-in fade-in zoom-in-95 duration-300">
               <button onClick={() => onToggle(id, true)} className="px-2 py-1 text-[11px] font-bold text-[#d1d4dc] hover:text-white whitespace-nowrap uppercase tracking-wider">{id}</button>
               <div className="w-px h-3 bg-white/10"></div>
               <Tooltip text={`Settings for ${id}`}>
                 <button onClick={() => setConfigId(id as IndicatorId)} className="px-1.5 py-1 text-white/50 hover:text-white transition-colors"><Settings size={12} /></button>
               </Tooltip>
               <Tooltip text={`Remove ${id}`}>
                 <button onClick={() => onToggle(id)} className="px-1.5 py-1 text-white/50 hover:text-[#f23645] transition-colors"><X size={12} /></button>
               </Tooltip>
            </div>
          );
        })}
      </div>
      
      {activeIds.length > 0 && (
        <Tooltip text="Remove all indicators">
          <button
            onClick={onClearAll}
            className="px-2 py-1 text-[10px] uppercase font-bold rounded-md bg-transparent text-[#f23645] hover:bg-[#f23645]/10 transition-colors pointer-events-auto mt-1"
          >
            Clear All
          </button>
        </Tooltip>
      )}
      <IndicatorConfigModal 
        indicatorId={configId}
        isOpen={!!configId}
        onClose={() => setConfigId(null)}
        settings={configId ? settings[configId] : null}
        onSave={(id, newSettings) => {
          updateSetting(id, newSettings);
          onToggle(id, true); // Force recreation
        }}
        onReset={(id) => {
          resetToDefault(id);
          onToggle(id, true); // Force recreation
        }}
      />
    </div>
  );
};

export default IndicatorToolbar;
