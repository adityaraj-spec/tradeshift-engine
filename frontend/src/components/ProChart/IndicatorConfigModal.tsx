import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Info, ChevronDown } from 'lucide-react';
import type { IndicatorId } from '../../constants/indicators';

interface Props {
  indicatorId: IndicatorId | null;
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onSave: (id: IndicatorId, newSettings: any) => void;
  onReset: (id: IndicatorId) => void;
}

export const IndicatorConfigModal: React.FC<Props> = ({ indicatorId, isOpen, onClose, settings, onSave, onReset }) => {
  const [localSettings, setLocalSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState('inputs');
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
    if (isOpen) {
      setActiveTab('inputs');
      setPickerOpen(null);
    }
  }, [settings, isOpen]);

  if (!indicatorId) return null;

  const handleSave = () => {
    onSave(indicatorId, localSettings);
    onClose();
  };

  const handleChange = (key: string, value: any) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const ColorPicker = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label?: string }) => {
    const colors = [
      ['#ffffff', '#cccccc', '#999999', '#666666', '#333333', '#000000'],
      ['#ffcccb', '#ffa07a', '#ff7f50', '#ff6347', '#ff4500', '#ff0000'],
      ['#fff8dc', '#ffe4b5', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825'],
      ['#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50'],
      ['#2962FF', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'],
      ['#F23645', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#089981'],
    ];

    return (
      <div className="flex flex-col gap-3 p-3 bg-[#1e222d] border border-[#363c4e] rounded-lg shadow-2xl z-[110] min-w-[200px]">
        {label && <label className="text-[10px] text-white/40 uppercase font-bold">{label}</label>}
        <div className="grid grid-cols-6 gap-1">
          {colors.flat().map((c) => (
            <div 
              key={c} 
              className={`w-6 h-6 rounded-sm cursor-pointer hover:scale-110 transition-transform ${value === c ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => { onChange(c); setPickerOpen(null); }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderBBInputs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">Length <Info size={14} className="opacity-40" /></label>
        <input 
          type="number" 
          value={localSettings.period} 
          onChange={(e) => handleChange('period', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Basis MA Type</label>
        <Select value={localSettings.basisMaType} onValueChange={(v) => handleChange('basisMaType', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["SMA", "EMA", "SMMA (RMA)", "WMA", "VWMA"].map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Source</label>
        <Select value={localSettings.source} onValueChange={(v) => handleChange('source', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["close", "open", "high", "low", "hl2", "hlc3", "ohlc4"].map(opt => (
              <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">StdDev</label>
        <input 
          type="number" 
          step="0.1"
          value={localSettings.stdDev} 
          onChange={(e) => handleChange('stdDev', parseFloat(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Offset</label>
        <input 
          type="number" 
          value={localSettings.offset} 
          onChange={(e) => handleChange('offset', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderRSIInputs = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">RSI Settings</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">RSI Length</label>
          <input 
            type="number" 
            value={localSettings.period} 
            onChange={(e) => handleChange('period', parseInt(e.target.value) || 0)}
            className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Source</label>
          <Select value={localSettings.source} onValueChange={(v) => handleChange('source', v)}>
            <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
              {["close", "open", "high", "low", "hl2", "hlc3", "ohlc4"].map(opt => (
                <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-white/5">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Smoothing</h4>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Type</label>
          <Select value={localSettings.maType} onValueChange={(v) => handleChange('maType', v)}>
            <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
              {["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"].map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {localSettings.maType !== 'None' && (
          <>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Length</label>
              <input 
                type="number" 
                value={localSettings.maLength} 
                onChange={(e) => handleChange('maLength', parseInt(e.target.value) || 0)}
                className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {localSettings.maType === 'SMA + Bollinger Bands' && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">BB StdDev</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={localSettings.bbStdDev} 
                  onChange={(e) => handleChange('bbStdDev', parseFloat(e.target.value) || 0)}
                  className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderMACDInputs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Fast Period</label>
        <input 
          type="number" 
          value={localSettings.fastPeriod} 
          onChange={(e) => handleChange('fastPeriod', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Slow Period</label>
        <input 
          type="number" 
          value={localSettings.slowPeriod} 
          onChange={(e) => handleChange('slowPeriod', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Signal Period</label>
        <input 
          type="number" 
          value={localSettings.signalPeriod} 
          onChange={(e) => handleChange('signalPeriod', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Oscillator MA Type</label>
        <Select value={localSettings.oscType || 'EMA'} onValueChange={(v) => handleChange('oscType', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["EMA", "SMA"].map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Signal MA Type</label>
        <Select value={localSettings.sigType || 'EMA'} onValueChange={(v) => handleChange('sigType', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["EMA", "SMA"].map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Source</label>
        <Select value={localSettings.source} onValueChange={(v) => handleChange('source', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["close", "open", "high", "low"].map(opt => (
              <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderGenericInputs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Length</label>
        <input 
          type="number" 
          value={localSettings.period || localSettings.fastPeriod || 9} 
          onChange={(e) => handleChange('period', parseInt(e.target.value) || 0)}
          className="w-24 bg-[#2a2e39] border border-[#363c4e] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Source</label>
        <Select value={localSettings.source || 'close'} onValueChange={(v) => handleChange('source', v)}>
          <SelectTrigger className="w-40 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
            {["close", "open", "high", "low"].map(opt => (
              <SelectItem key={opt} value={opt} className="capitalize">{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderInputs = () => {
    if (indicatorId === 'BB') return renderBBInputs();
    if (indicatorId === 'RSI') return renderRSIInputs();
    if (indicatorId === 'MACD') return renderMACDInputs();
    return renderGenericInputs();
  };

  const StyleRow = ({ label, colorKey, visibleKey, widthKey, levelKey }: { label: string, colorKey: string, visibleKey?: string, widthKey?: string, levelKey?: string }) => (
    <div className="flex items-center justify-between relative group/row h-8">
      <div className="flex items-center gap-3 h-full">
        <input 
          type="checkbox" 
          checked={visibleKey ? (localSettings[visibleKey] !== false) : true} 
          onChange={(e) => visibleKey && handleChange(visibleKey, e.target.checked)} 
          className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500 disabled:opacity-0" 
          disabled={!visibleKey}
        />
        <label className="text-sm font-medium">{label}</label>
      </div>
      <div className="flex items-center gap-2 h-full">
        <div 
          className="w-10 h-6 rounded border border-white/20 cursor-pointer overflow-hidden relative shrink-0"
          style={{ backgroundColor: localSettings[colorKey] }}
          onClick={() => setPickerOpen(pickerOpen === colorKey ? null : colorKey)}
        />
        {widthKey && (
          <Select value={String(localSettings[widthKey] || 1)} onValueChange={(v) => handleChange(widthKey, parseInt(v))}>
            <SelectTrigger className="w-14 h-7 bg-[#2a2e39] border-[#363c4e] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
              {[1, 2, 3, 4].map(w => (
                <SelectItem key={w} value={String(w)}>{w}px</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {levelKey && (
          <input 
            type="number" 
            value={localSettings[levelKey]} 
            onChange={(e) => handleChange(levelKey, parseInt(e.target.value) || 0)}
            className="w-16 bg-[#2a2e39] border border-[#363c4e] rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
          />
        )}
      </div>
      {pickerOpen === colorKey && (
        <div className="absolute top-8 right-0 shadow-2xl z-[120]">
          <ColorPicker value={localSettings[colorKey]} onChange={(val) => handleChange(colorKey, val)} label={label} />
        </div>
      )}
    </div>
  );

  const renderRSIStyle = () => (
    <div className="space-y-4">
      <StyleRow label="RSI" colorKey="color" widthKey="lineWidth" />
      <StyleRow label="RSI-based MA" colorKey="maColor" widthKey="maWidth" visibleKey="maVisible" />
      <StyleRow label="RSI Upper Band" colorKey="upperColor" widthKey="width1" levelKey="upperLevel" visibleKey="showLevels" />
      <StyleRow label="RSI Middle Band" colorKey="middleColor" widthKey="width2" levelKey="middleLevel" visibleKey="showLevels" />
      <StyleRow label="RSI Lower Band" colorKey="lowerColor" widthKey="width3" levelKey="lowerLevel" visibleKey="showLevels" />
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={localSettings.showBackground} 
            onChange={(e) => handleChange('showBackground', e.target.checked)} 
            className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500" 
          />
          <label className="text-sm font-medium">RSI Background Fill</label>
        </div>
        <div 
          className="w-10 h-6 rounded border border-white/20 cursor-pointer overflow-hidden relative"
          style={{ backgroundColor: localSettings.fillColor }}
          onClick={() => setPickerOpen(pickerOpen === 'fillColor' ? null : 'fillColor')}
        />
        {pickerOpen === 'fillColor' && (
          <div className="absolute top-full right-0 mt-2 shadow-2xl z-[120]">
            <ColorPicker value={localSettings.fillColor} onChange={(val) => handleChange('fillColor', val)} label="Background" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={localSettings.showBackground} 
            onChange={(e) => handleChange('showBackground', e.target.checked)} 
            className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500" 
          />
          <label className="text-sm font-medium">Overbought Gradient Fill</label>
        </div>
        <div 
          className="w-10 h-6 rounded border border-white/20 cursor-pointer overflow-hidden relative"
          style={{ backgroundColor: localSettings.overboughtFill }}
          onClick={() => setPickerOpen(pickerOpen === 'overboughtFill' ? null : 'overboughtFill')}
        />
        {pickerOpen === 'overboughtFill' && (
          <div className="absolute top-full right-0 mt-2 shadow-2xl z-[120]">
            <ColorPicker value={localSettings.overboughtFill} onChange={(val) => handleChange('overboughtFill', val)} label="Overbought" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={localSettings.showBackground} 
            onChange={(e) => handleChange('showBackground', e.target.checked)} 
            className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500" 
          />
          <label className="text-sm font-medium">Oversold Gradient Fill</label>
        </div>
        <div 
          className="w-10 h-6 rounded border border-white/20 cursor-pointer overflow-hidden relative"
          style={{ backgroundColor: localSettings.oversoldFill }}
          onClick={() => setPickerOpen(pickerOpen === 'oversoldFill' ? null : 'oversoldFill')}
        />
        {pickerOpen === 'oversoldFill' && (
          <div className="absolute top-full right-0 mt-2 shadow-2xl z-[120]">
            <ColorPicker value={localSettings.oversoldFill} onChange={(val) => handleChange('oversoldFill', val)} label="Oversold" />
          </div>
        )}
      </div>
    </div>
  );

  const renderMACDStyle = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Lines</h4>
        <StyleRow label="MACD Line" colorKey="macdColor" widthKey="lineWidth" />
        <StyleRow label="Signal Line" colorKey="signalColor" widthKey="lineWidth" />
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Histogram Colors</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-white/60">Pos Growing</label>
            <div 
              className="w-8 h-6 rounded border border-white/20 cursor-pointer"
              style={{ backgroundColor: (localSettings as any).posGrowing }}
              onClick={() => setPickerOpen(pickerOpen === 'posGrowing' ? null : 'posGrowing')}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-white/60">Pos Fading</label>
            <div 
              className="w-8 h-6 rounded border border-white/20 cursor-pointer"
              style={{ backgroundColor: (localSettings as any).posFading }}
              onClick={() => setPickerOpen(pickerOpen === 'posFading' ? null : 'posFading')}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-white/60">Neg Fading</label>
            <div 
              className="w-8 h-6 rounded border border-white/20 cursor-pointer"
              style={{ backgroundColor: (localSettings as any).negFading }}
              onClick={() => setPickerOpen(pickerOpen === 'negFading' ? null : 'negFading')}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-white/60">Neg Growing</label>
            <div 
              className="w-8 h-6 rounded border border-white/20 cursor-pointer"
              style={{ backgroundColor: (localSettings as any).negGrowing }}
              onClick={() => setPickerOpen(pickerOpen === 'negGrowing' ? null : 'negGrowing')}
            />
          </div>
        </div>

        {['posGrowing', 'posFading', 'negFading', 'negGrowing'].includes(pickerOpen || '') && (
          <div className="mt-2 p-2 bg-[#2a2e39] rounded-lg border border-[#363c4e]">
            <ColorPicker 
              value={(localSettings as any)[pickerOpen!]} 
              onChange={(val) => handleChange(pickerOpen!, val)} 
              label={pickerOpen?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) || ''} 
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderBBStyle = () => (
    <div className="space-y-4">
      <StyleRow label="Basis" colorKey="basisColor" widthKey="basisWidth" visibleKey="maVisible" />
      <StyleRow label="Upper" colorKey="upperColor" widthKey="upperWidth" />
      <StyleRow label="Lower" colorKey="lowerColor" widthKey="lowerWidth" />
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={localSettings.showBackground} 
            onChange={(e) => handleChange('showBackground', e.target.checked)} 
            className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500" 
          />
          <label className="text-sm font-medium">Background</label>
        </div>
        <div 
          className="w-10 h-6 rounded border border-white/20 cursor-pointer overflow-hidden relative"
          style={{ backgroundColor: localSettings.fillColor }}
          onClick={() => setPickerOpen(pickerOpen === 'fillColor' ? null : 'fillColor')}
        />
        {pickerOpen === 'fillColor' && (
          <div className="absolute top-full right-0 mt-2 shadow-2xl z-[120]">
            <ColorPicker value={localSettings.fillColor} onChange={(val) => handleChange('fillColor', val)} label="Background" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-[#1e222d] border border-[#363c4e] text-[#d1d4dc] p-0 overflow-hidden shadow-2xl rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col">
            <DialogTitle className="text-xl font-bold text-white uppercase">{indicatorId}</DialogTitle>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md transition-colors">
            <X size={20} className="text-white/40" />
          </button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent h-12 gap-6 p-0">
              <TabsTrigger value="inputs" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-[#d1d4dc]/60 rounded-none h-full px-0 font-bold text-[13px]">Inputs</TabsTrigger>
              <TabsTrigger value="style" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-[#d1d4dc]/60 rounded-none h-full px-0 font-bold text-[13px]">Style</TabsTrigger>
              <TabsTrigger value="visibility" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white text-[#d1d4dc]/60 rounded-none h-full px-0 font-bold text-[13px]">Visibility</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
            <TabsContent value="inputs" className="m-0">
              {renderInputs()}
              
              <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Calculation</h4>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">Timeframe <Info size={14} className="opacity-40" /></label>
                  <Select value={localSettings.timeframe || 'Chart'} onValueChange={(v) => handleChange('timeframe', v)}>
                    <SelectTrigger className="w-32 h-9 bg-[#2a2e39] border-[#363c4e] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e222d] border-[#363c4e] text-white">
                      <SelectItem value="Chart">Chart</SelectItem>
                      <SelectItem value="1m">1 minute</SelectItem>
                      <SelectItem value="5m">5 minutes</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={localSettings.wait} onChange={(e) => handleChange('wait', e.target.checked)} className="w-4 h-4 bg-[#2a2e39] border-[#363c4e] rounded accent-blue-500" />
                  <label className="text-sm font-medium">Wait for timeframe closes</label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="m-0">
              {indicatorId === 'BB' && renderBBStyle()}
              {indicatorId === 'RSI' && renderRSIStyle()}
              {indicatorId === 'MACD' && renderMACDStyle()}
              {indicatorId !== 'BB' && indicatorId !== 'RSI' && indicatorId !== 'MACD' && (
                <div className="space-y-4">
                  <StyleRow label="Main" colorKey="color" widthKey="thickness" visibleKey="maVisible" />
                </div>
              )}
              
              <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Display</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={localSettings.showLabels} onChange={(e) => handleChange('showLabels', e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
                    <label className="text-sm font-medium">Labels on price scale</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={localSettings.showStatusValues} onChange={(e) => handleChange('showStatusValues', e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
                    <label className="text-sm font-medium">Values in status line</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={localSettings.showStatusInputs} onChange={(e) => handleChange('showStatusInputs', e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
                    <label className="text-sm font-medium">Inputs in status line</label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visibility" className="m-0 space-y-4">
              {['Ticks', 'Seconds', 'Minutes', 'Hours', 'Days', 'Weeks', 'Months', 'Ranges'].map((item) => (
                <div key={item} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-500" />
                    <label className="text-sm font-medium">{item}</label>
                  </div>
                </div>
              ))}
            </TabsContent>
          </div>
        </Tabs>

        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
          <button 
            onClick={() => onReset(indicatorId)}
            className="text-xs font-bold text-[#d1d4dc]/60 hover:text-white flex items-center gap-1 group"
          >
            Defaults <ChevronDown size={14} className="opacity-40 group-hover:opacity-100" />
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-bold rounded-md bg-[#2a2e39] border border-[#363c4e] hover:bg-[#363c4e] text-white transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-5 py-2 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg">Ok</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
