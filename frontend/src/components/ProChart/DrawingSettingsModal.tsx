import React, { useState, useEffect } from 'react';
import { X, Pencil, FileText, ChevronDown, Save, Trash2 } from 'lucide-react';
import type { DrawingToolsManager } from '@pipsend/charts';
import { useChartObjects } from '../../store/useChartObjects';
import { useTemplatePersistence } from '../../hooks/useTemplatePersistence';
import { PremiumSelect, type Option } from '@/components/ui/PremiumSelect';

const LINE_WIDTH_OPTIONS: Option[] = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
  { value: '4', label: '4px' }
];

const LINE_STYLE_OPTIONS: Option[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' }
];

const EXTEND_OPTIONS: Option[] = [
  { value: 'none', label: "Don't extend" },
  { value: 'right', label: 'Extend right Line' },
  { value: 'left', label: 'Extend left Line' },
  { value: 'both', label: 'Extend both Lines' }
];

const STATS_MODE_OPTIONS: Option[] = [
  { value: 'Hidden', label: 'Hidden' },
  { value: 'Show', label: 'Show' }
];

const STATS_POS_OPTIONS: Option[] = [
  { value: 'Right', label: 'Right' },
  { value: 'Center', label: 'Center' },
  { value: 'Left', label: 'Left' }
];

const FONT_SIZE_OPTIONS: Option[] = ['10','11','12','14','16','20','24','28','32','40'].map(s => ({ value: s, label: s }));

const VALIGN_OPTIONS: Option[] = [
  { value: 'Top', label: 'Top' },
  { value: 'Middle', label: 'Middle' },
  { value: 'Bottom', label: 'Bottom' }
];

const HALIGN_OPTIONS: Option[] = [
  { value: 'Center', label: 'Center' },
  { value: 'Left', label: 'Left' },
  { value: 'Right', label: 'Right' }
];

const ORIENTATION_OPTIONS: Option[] = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'parallel', label: 'Parallel' }
];

const TEXT_POS_OPTIONS: Option[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'middle', label: 'Middle' }
];

export interface DrawingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string | null;
  managerRef: React.MutableRefObject<DrawingToolsManager | null>;
  toolName?: string;
  initialTab?: 'Style' | 'Text' | 'Coordinates' | 'Visibility';
}

const TABS = ['Style', 'Text', 'Coordinates', 'Visibility'] as const;

export const DrawingSettingsModal: React.FC<DrawingSettingsModalProps> = ({
  isOpen,
  onClose,
  toolId,
  managerRef,
  toolName = 'Trendline',
  initialTab = 'Style',
}) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(initialTab);
  
  // States mapping to underlying tool options
  const [color, setColor] = useState('#2962FF');
  const [lineWidth, setLineWidth] = useState(2);
  const [lineStyle, setLineStyle] = useState('solid');
  const [extendMode, setExtendMode] = useState('none'); // 'none', 'left', 'right', 'both'
  const [showMiddlePoint, setShowMiddlePoint] = useState(false);
  const [showPriceLabels, setShowPriceLabels] = useState(false);
  const [statsMode, setStatsMode] = useState('Hidden');
  const [statsPosition, setStatsPosition] = useState('Right');
  const [alwaysShowStats, setAlwaysShowStats] = useState(false);
  
  // Text Tab
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#2962FF');
  const [fontSize, setFontSize] = useState('14');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textVAlign, setTextVAlign] = useState('Top');
  const [textHAlign, setTextHAlign] = useState('Center');
  const [textOrientation, setTextOrientation] = useState('parallel'); // 'horizontal', 'parallel'
  const [textPosition, setTextPosition] = useState('top'); // 'top', 'bottom', 'middle'
  
  // Coordinates Tab
  const [p1Price, setP1Price] = useState('');
  const [p1Bar, setP1Bar] = useState('');
  const [p2Price, setP2Price] = useState('');
  const [p2Bar, setP2Bar] = useState('');

  // Visibility Tab
  const [visSec, setVisSec] = useState({ enabled: true, from: '1', to: '59' });
  const [visMin, setVisMin] = useState({ enabled: true, from: '1', to: '59' });
  const [visHour, setVisHour] = useState({ enabled: true, from: '1', to: '24' });
  const [visDay, setVisDay] = useState({ enabled: true, from: '1', to: '366' });
  const [visWeek, setVisWeek] = useState({ enabled: true, from: '1', to: '52' });
  const [visMonth, setVisMonth] = useState({ enabled: true, from: '1', to: '12' });
  const [visRanges, setVisRanges] = useState(true);

  const { toolTemplates, saveToolTemplate: saveLocalToolTemplate, deleteToolTemplate: deleteLocalToolTemplate } = useChartObjects();
  const { saveToolTemplate, deleteToolTemplate } = useTemplatePersistence();
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Initialize tool settings when modal opens
  useEffect(() => {
    setActiveTab(initialTab);
    
    if (isOpen && toolId && managerRef.current) {
      try {
        const tools = managerRef.current.getAllTools() as any;
        const tool = tools instanceof Map ? tools.get(toolId) : tools.find?.((t: any) => t.id === toolId);
        
        if (tool) {
          // Attempt to extract line options
          let options: any = null;
          if (tool.options) options = typeof tool.options === 'function' ? tool.options() : tool.options;
          if (!options && (tool as any)._options) options = (tool as any)._options;

          if (options) {
            if (options.lineColor || options.color) setColor(options.lineColor || options.color);
            if (options.lineWidth) setLineWidth(options.lineWidth);
            if (options.lineStyle) setLineStyle(options.lineStyle);
            if (options.text !== undefined) setText(options.text || '');
            if (options.textColor) setTextColor(options.textColor);
            if (options.fontSize) setFontSize(options.fontSize.toString());
            if (options.bold !== undefined) setIsBold(!!options.bold);
            if (options.italic !== undefined) setIsItalic(!!options.italic);
            if (options.textOrientation) setTextOrientation(options.textOrientation);
            if (options.textPosition) setTextPosition(options.textPosition);
            
            // Extension handling
            let exLeft = !!options.extendLeft;
            let exRight = !!options.extendRight;
            if (exLeft && exRight) setExtendMode('both');
            else if (exLeft) setExtendMode('left');
            else if (exRight) setExtendMode('right');
            else setExtendMode('none');
          }
          
          // Attempt to extract points
          const pts = tool.points || (tool as any)._points;
          if (pts && Array.isArray(pts) && pts.length >= 2) {
            setP1Price(pts[0].price?.toFixed(2) || '');
            setP1Bar(pts[0].time?.toString() || '');
            setP2Price(pts[1].price?.toFixed(2) || '');
            setP2Bar(pts[1].time?.toString() || '');
          }
        }
      } catch (e) {
         console.warn('Could not read tool properties natively:', e);
      }
    }
  }, [isOpen, toolId, initialTab, managerRef]);

  if (!isOpen) return null;

  const handleApplyTemplate = (template: any) => {
    if (managerRef.current && toolId) {
      const tools = managerRef.current.getAllTools() as any;
      const tool = tools instanceof Map ? tools.get(toolId) : tools.find?.((t: any) => t.id === toolId);
      
      if (tool && tool.applyOptions) {
        tool.applyOptions(template.settings);
        // Refresh local state
        const s = template.settings;
        if (s.lineColor || s.color) setColor(s.lineColor || s.color);
        if (s.lineWidth) setLineWidth(s.lineWidth);
        if (s.lineStyle) setLineStyle(s.lineStyle);
        if (s.text !== undefined) setText(s.text || '');
        if (s.textColor) setTextColor(s.textColor);
        if (s.fontSize) setFontSize(s.fontSize.toString());
        if (s.bold !== undefined) setIsBold(!!s.bold);
        if (s.italic !== undefined) setIsItalic(!!s.italic);
        setIsTemplateMenuOpen(false);
      }
    }
  };

  const handleSaveTemplate = () => {
    const name = window.prompt('Enter template name:');
    if (!name || !managerRef.current || !toolId) return;

    const tools = managerRef.current.getAllTools() as any;
    const tool = tools instanceof Map ? tools.get(toolId) : tools.find?.((t: any) => t.id === toolId);
    if (!tool) return;

    const toolType = (tool as any).type || 'generic';
    const settings = tool.getOptions ? tool.getOptions() : tool.options;
    
    const template = {
      id: Math.random().toString(36).substr(2, 9),
      toolId: toolType,
      name,
      settings: settings,
      timestamp: Date.now()
    };

    saveLocalToolTemplate(template);
    saveToolTemplate(template);
    setIsTemplateMenuOpen(false);
  };

  const handleApply = () => {
    if (!managerRef.current || !toolId) {
      onClose();
      return;
    }
    
    const tools = managerRef.current.getAllTools() as any;
    const tool = tools instanceof Map ? tools.get(toolId) : tools.find?.((t: any) => t.id === toolId);
    
    if (tool && typeof tool.applyOptions === 'function') {
      const extL = extendMode === 'left' || extendMode === 'both';
      const extR = extendMode === 'right' || extendMode === 'both';
      
      const newOptions: any = {
        color: color,
        lineColor: color,
        lineWidth,
        lineStyle,
        extendLeft: extL,
        extendRight: extR,
        text,
        // we map font size, color, bold, etc., to typical properties if supported
        textColor: textColor,
        fontSize: parseInt(fontSize),
        bold: isBold,
        italic: isItalic,
        textOrientation: textOrientation,
        textPosition: textPosition
      };
      
      try {
        tool.applyOptions(newOptions);
      } catch (_) {}

      // Manual fallback for crash safety (similar to the panel logic)
      try {
         const obj = tool as any;
         if (obj._options) {
             Object.assign(obj._options, newOptions);
         }
         // Sync properties directly
         if (newOptions.color) { obj._color = newOptions.color; obj._lineColor = newOptions.color; }
         if (newOptions.lineWidth) obj._lineWidth = newOptions.lineWidth;
         if (newOptions.lineStyle) obj._lineStyle = newOptions.lineStyle;
         
         if (typeof obj._private__requestUpdate === 'function') obj._private__requestUpdate();
         else if (typeof obj._requestUpdate === 'function') obj._requestUpdate();
         else if (typeof obj._update === 'function') obj._update();
      } catch (e) {
          console.warn('Manual fallback update failed');
      }
    }
    
    onClose();
  };

  const InputRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex items-center mb-4 text-[13px] text-gray-800 dark:text-[#d1d4dc]">
      <div className="w-1/3 shrink-0 pr-4">{label}</div>
      <div className="w-2/3 flex items-center gap-2">{children}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative bg-white dark:bg-[#1e222d] rounded-xl shadow-2xl w-[400px] border border-gray-200 dark:border-[#2a2e39] flex flex-col font-sans animation-scale-up overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2e39]">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <span>{toolName}</span>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <Pencil size={16} />
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2 border-b border-gray-200 dark:border-[#2a2e39] gap-6 text-[14px]">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`pb-3 font-semibold transition-colors relative ${
                activeTab === tab 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-[#2962ff] rounded-t-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="p-6 overflow-y-auto max-h-[500px]">
          
          {activeTab === 'Style' && (
            <div className="flex flex-col">
              <InputRow label="Line">
                <div className="flex border border-gray-300 dark:border-[#2a2e39] rounded items-center">
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-8 rounded-l cursor-pointer border-r border-gray-300 dark:border-[#2a2e39]" />
                  <div className="w-20 border-r border-gray-300 dark:border-[#2a2e39]">
                    <PremiumSelect value={lineWidth.toString()} onChange={v => setLineWidth(Number(v))} options={LINE_WIDTH_OPTIONS} className="h-8 bg-transparent px-2 outline-none" dropdownClassName="min-w-[100px]" />
                  </div>
                  <div className="w-24">
                    <PremiumSelect value={lineStyle} onChange={v => setLineStyle(v)} options={LINE_STYLE_OPTIONS} className="h-8 bg-transparent px-2 outline-none" dropdownClassName="min-w-[120px]" />
                  </div>
                </div>
              </InputRow>
              
              <InputRow label="Extend">
                <PremiumSelect 
                  value={extendMode} 
                  onChange={v => setExtendMode(v)}
                  options={EXTEND_OPTIONS}
                  className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none text-gray-800 dark:text-white"
                />
              </InputRow>

              <div className="flex items-center gap-3 mt-2 mb-4 text-[13px] text-gray-800 dark:text-[#d1d4dc]">
                <input type="checkbox" id="midpoint" checked={showMiddlePoint} onChange={e => setShowMiddlePoint(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="midpoint" className="cursor-pointer select-none">Middle point</label>
              </div>

              <div className="flex items-center gap-3 mb-6 text-[13px] text-gray-800 dark:text-[#d1d4dc]">
                <input type="checkbox" id="pricelabel" checked={showPriceLabels} onChange={e => setShowPriceLabels(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="pricelabel" className="cursor-pointer select-none">Price labels</label>
              </div>

              <div className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-wider">INFO</div>
              
              <InputRow label="Stats">
                <PremiumSelect value={statsMode} onChange={v => setStatsMode(v)} options={STATS_MODE_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none" dropdownClassName="min-w-[120px]" />
              </InputRow>
              
              <InputRow label="Stats position">
                <PremiumSelect value={statsPosition} onChange={v => setStatsPosition(v)} options={STATS_POS_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none" dropdownClassName="min-w-[120px]" />
              </InputRow>
              
              <div className="flex items-center gap-3 mt-2 text-[13px] text-gray-800 dark:text-[#d1d4dc]">
                <input type="checkbox" id="showstats" checked={alwaysShowStats} onChange={e => setAlwaysShowStats(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                <label htmlFor="showstats" className="cursor-pointer select-none">Always show stats</label>
              </div>
            </div>
          )}

          {activeTab === 'Text' && (
            <div className="flex flex-col h-full">
              <div className="flex gap-2 mb-3">
                <div className="border border-gray-300 dark:border-[#2a2e39] rounded h-8 overflow-hidden w-8">
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-full cursor-pointer" />
                </div>
                <div className="w-20 border border-gray-300 dark:border-[#2a2e39] rounded h-8 bg-transparent text-[13px] dark:text-white">
                  <PremiumSelect value={fontSize} onChange={v => setFontSize(v)} options={FONT_SIZE_OPTIONS} className="w-full h-full px-2 outline-none" dropdownClassName="min-w-[100px]" />
                </div>
                <button 
                  onClick={() => setIsBold(!isBold)} 
                  className={`w-8 h-8 rounded flex items-center justify-center font-serif font-bold border transition-colors ${isBold ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-[#2a2e39] text-gray-700 dark:text-gray-300'}`}
                >B</button>
                <button 
                  onClick={() => setIsItalic(!isItalic)} 
                  className={`w-8 h-8 rounded flex items-center justify-center font-serif italic border transition-colors ${isItalic ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-[#2a2e39] text-gray-700 dark:text-gray-300'}`}
                >I</button>
              </div>
              
              <textarea 
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Add text"
                className="w-full flex-grow min-h-[120px] rounded-lg border-2 border-blue-500 bg-transparent p-3 outline-none resize-none focus:ring-4 focus:ring-blue-500/20 transition-shadow dark:text-white mb-4"
              />
              
              <InputRow label="Text alignment">
                <div className="w-1/2">
                  <PremiumSelect value={textVAlign} onChange={v => setTextVAlign(v)} options={VALIGN_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none text-[13px]" dropdownClassName="min-w-[100px]" />
                </div>
                <div className="w-1/2">
                  <PremiumSelect value={textHAlign} onChange={v => setTextHAlign(v)} options={HALIGN_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none text-[13px]" dropdownClassName="min-w-[100px]" />
                </div>
              </InputRow>

              <InputRow label="Text orientation">
                <PremiumSelect value={textOrientation} onChange={v => setTextOrientation(v)} options={ORIENTATION_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none text-[13px]" dropdownClassName="min-w-[140px]" />
              </InputRow>
              
              <InputRow label="Text position">
                <PremiumSelect value={textPosition} onChange={v => setTextPosition(v)} options={TEXT_POS_OPTIONS} className="w-full h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none text-[13px]" dropdownClassName="min-w-[120px]" />
              </InputRow>
            </div>
          )}

          {activeTab === 'Coordinates' && (
            <div className="flex flex-col gap-4">
              <InputRow label="#1 (price, bar)">
                <input type="text" value={p1Price} onChange={e => setP1Price(e.target.value)} className="w-1/2 h-8 border border-blue-500 rounded bg-transparent px-2 outline-none" />
                <input type="text" value={p1Bar} onChange={e => setP1Bar(e.target.value)} className="w-1/2 h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none" />
              </InputRow>
              <InputRow label="#2 (price, bar)">
                <input type="text" value={p2Price} onChange={e => setP2Price(e.target.value)} className="w-1/2 h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none" />
                <input type="text" value={p2Bar} onChange={e => setP2Bar(e.target.value)} className="w-1/2 h-8 border border-gray-300 dark:border-[#2a2e39] rounded bg-transparent px-2 outline-none" />
              </InputRow>
            </div>
          )}

          {activeTab === 'Visibility' && (
            <div className="flex flex-col gap-3 text-[13px] text-gray-800 dark:text-[#d1d4dc]">
              {[
                { id: 'Ticks', label: 'Ticks', val: { enabled: true }, noRange: true },
                { id: 'Seconds', label: 'Seconds', val: visSec, set: setVisSec },
                { id: 'Minutes', label: 'Minutes', val: visMin, set: setVisMin },
                { id: 'Hours', label: 'Hours', val: visHour, set: setVisHour },
                { id: 'Days', label: 'Days', val: visDay, set: setVisDay },
                { id: 'Weeks', label: 'Weeks', val: visWeek, set: setVisWeek },
                { id: 'Months', label: 'Months', val: visMonth, set: setVisMonth },
                { id: 'Ranges', label: 'Ranges', val: { enabled: visRanges }, set: (v: any) => setVisRanges(v.enabled), noRange: true },
              ].map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <input type="checkbox" id={`vis-${item.id}`} checked={item.val.enabled} onChange={(e) => item.set && item.set({ ...item.val, enabled: e.target.checked } as any)} className="w-4 h-4 cursor-pointer" />
                  <label htmlFor={`vis-${item.id}`} className="w-20 cursor-pointer">{item.label}</label>
                  {!item.noRange && (
                    <div className="flex items-center gap-2 flex-grow">
                      <input type="number" value={(item.val as any).from} onChange={e => item.set && item.set({ ...item.val, from: e.target.value } as any)} className="w-14 h-8 bg-white dark:bg-transparent border border-gray-300 dark:border-[#2a2e39] rounded px-2 outline-none disabled:opacity-50" disabled={!item.val.enabled} />
                      <div className="relative w-full flex items-center mx-1">
                         <div className="absolute w-full h-[6px] bg-gray-600 rounded-full" />
                         <div className="absolute left-0 w-[14px] h-[14px] bg-white border-2 border-black rounded-full" />
                         <div className="absolute right-0 w-[14px] h-[14px] bg-white border-2 border-black rounded-full" />
                      </div>
                      <input type="number" value={(item.val as any).to} onChange={e => item.set && item.set({ ...item.val, to: e.target.value } as any)} className="w-14 h-8 bg-white dark:bg-transparent border border-gray-300 dark:border-[#2a2e39] rounded px-2 outline-none disabled:opacity-50" disabled={!item.val.enabled} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-[#2a2e39] relative">
          <div className="relative">
            <button 
              onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
              className="flex items-center gap-2 h-9 border border-gray-300 dark:border-[#2a2e39] rounded px-3 text-[14px] text-gray-800 dark:text-[#d1d4dc] hover:bg-gray-100 dark:hover:bg-[#2a2e39] transition-colors"
            >
              <FileText size={16} />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Template</span>
              <ChevronDown size={14} className={`transition-transform ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTemplateMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-56 bg-white dark:bg-[#1e222d] border border-gray-200 dark:border-[#2a2e39] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-bottom-1">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2a2e39]">
                  <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Saved Templates</h4>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const tools = managerRef.current?.getAllTools() as any;
                    const tool = tools instanceof Map ? tools.get(toolId || '') : tools?.find?.((t: any) => t.id === toolId);
                    const toolType = (tool as any)?.type || 'generic';
                    const filtered = toolTemplates.filter(t => t.toolId === toolType);
                    
                    if (filtered.length === 0) {
                      return <div className="px-3 py-4 text-center text-[11px] opacity-20 font-bold uppercase italic">No templates</div>;
                    }

                    return filtered.map(t => (
                      <div 
                        key={t.id}
                        className="group flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#2962FF]/10 cursor-pointer transition-colors"
                      >
                        <span 
                          className="text-[13px] font-medium truncate flex-1"
                          onClick={() => handleApplyTemplate(t)}
                        >
                          {t.name}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete template?')) {
                              deleteLocalToolTemplate(t.id);
                              deleteToolTemplate(t.toolId, t.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ));
                  })()}
                </div>
                <div className="p-1 border-t border-gray-100 dark:border-[#2a2e39]">
                  <button 
                    onClick={handleSaveTemplate}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#2962FF] hover:text-white rounded-md transition-all group"
                  >
                    <Save size={16} />
                    <span className="text-[12px] font-bold uppercase tracking-widest">Save As...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-[#2a2e39] rounded-md border border-gray-300 dark:border-[#2a2e39] text-gray-800 dark:text-[#d1d4dc] text-[14px] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              className="px-6 py-2 bg-[#1e222d] dark:bg-white text-white dark:text-[#131722] hover:bg-black dark:hover:bg-gray-200 rounded-md text-[14px] font-semibold transition-colors"
            >
              Ok
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
