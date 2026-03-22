import React from 'react';
import { Magnet } from 'lucide-react';
import { useDrawingSettings } from '../../store/useDrawingSettings';

interface MagnetMenuProps {
  onClose: () => void;
  style?: React.CSSProperties;
}

export const MagnetMenu: React.FC<MagnetMenuProps> = ({ onClose, style }) => {
  const { magnetStrength, setMagnetStrength, snapToIndicators, setSnapToIndicators } = useDrawingSettings();

  return (
    <div 
      className="absolute bg-[#1e222d] border border-[#2a2e39] shadow-2xl py-2 min-w-[200px] z-[100] animate-in fade-in slide-in-from-left-2 duration-150"
      style={style}
      onMouseLeave={onClose}
    >
      <div className="flex flex-col">
        <div 
          className={`flex items-center gap-3 px-4 py-[6px] cursor-pointer transition-colors group ${
            magnetStrength === 'weak' ? 'text-[#2962FF]' : 'text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white'
          }`}
          onClick={() => { setMagnetStrength('weak'); onClose(); }}
        >
          <Magnet size={18} className="translate-y-px opacity-60" />
          <span className="text-[13px]">Weak magnet</span>
        </div>
        
        <div 
          className={`flex items-center gap-3 px-4 py-[6px] cursor-pointer transition-colors group ${
            magnetStrength === 'strong' ? 'text-[#2962FF]' : 'text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white'
          }`}
          onClick={() => { setMagnetStrength('strong'); onClose(); }}
        >
          <Magnet size={18} className="translate-y-px" />
          <span className="text-[13px]">Strong magnet</span>
        </div>

        <div className="h-px bg-[#2a2e39] my-2 mx-4" />

        <div 
          className="flex items-center justify-between px-4 py-[6px] cursor-pointer transition-colors group text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white"
          onClick={(e) => { e.stopPropagation(); setSnapToIndicators(!snapToIndicators); }}
        >
          <span className="text-[13px]">Snap to indicators</span>
          
          <div className={`w-8 h-4 rounded-full transition-colors relative ${snapToIndicators ? 'bg-[#2962FF]' : 'bg-[#363a45]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${snapToIndicators ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
