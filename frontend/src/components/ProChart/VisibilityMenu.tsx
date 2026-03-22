import React from 'react';
import { useDrawingSettings } from '../../store/useDrawingSettings';

interface VisibilityMenuProps {
  onClose: () => void;
  style?: React.CSSProperties;
}

export const VisibilityMenu: React.FC<VisibilityMenuProps> = ({ onClose, style }) => {
  const { hiddenLayers, setHiddenLayer, hideAll } = useDrawingSettings();

  const handleToggle = (layer: keyof typeof hiddenLayers) => {
    setHiddenLayer(layer, !hiddenLayers[layer]);
  };

  return (
    <div 
      className="absolute bg-[#1e222d] border border-[#2a2e39] shadow-2xl py-2 min-w-[220px] z-[100] animate-in fade-in slide-in-from-left-2 duration-150"
      style={style}
      onMouseLeave={onClose}
    >
      <div className="flex flex-col">
        <div 
          className="flex items-center justify-between px-4 py-[6px] cursor-pointer transition-colors group text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white"
          onClick={() => handleToggle('drawings')}
        >
          <span className="text-[13px]">Hide drawings</span>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${hiddenLayers.drawings ? 'bg-[#2962FF]' : 'bg-[#363a45]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${hiddenLayers.drawings ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>

        <div 
          className="flex items-center justify-between px-4 py-[6px] cursor-pointer transition-colors group text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white"
          onClick={() => handleToggle('indicators')}
        >
          <span className="text-[13px]">Hide indicators</span>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${hiddenLayers.indicators ? 'bg-[#2962FF]' : 'bg-[#363a45]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${hiddenLayers.indicators ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>

        <div 
          className="flex items-center justify-between px-4 py-[6px] cursor-pointer transition-colors group text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white"
          onClick={() => handleToggle('positions')}
        >
          <span className="text-[13px]">Hide positions and orders</span>
          <div className={`w-8 h-4 rounded-full transition-colors relative ${hiddenLayers.positions ? 'bg-[#2962FF]' : 'bg-[#363a45]'}`}>
            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${hiddenLayers.positions ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>

        <div className="h-px bg-[#2a2e39] my-2 mx-4" />

        <div 
          className="flex items-center justify-between px-4 py-[6px] cursor-pointer transition-colors group text-[#d1d4dc] hover:bg-[#2a2e39] hover:text-white"
          onClick={() => { hideAll(); onClose(); }}
        >
          <span className="text-[13px]">Hide all</span>
        </div>
      </div>
    </div>
  );
};
