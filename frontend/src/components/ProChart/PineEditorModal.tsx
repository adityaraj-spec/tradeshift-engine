import React from 'react';
import { X, Play, ExternalLink, Maximize2, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface PineEditorModalProps {
  indicatorId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const INDICATOR_SOURCE: Record<string, string> = {
  SMA: `//@version=6
indicator(title="Simple Moving Average", shorttitle="SMA", overlay=true, timeframe="", timeframe_gaps=true)
len = input.int(9, minval=1, title="Length")
src = input(close, title="Source")
offset = input.int(title="Offset", defval=0, minval=-500, maxval=500, display=display.data_window)
out = ta.sma(src, len)
plot(out, color=color.blue, title="MA", offset=offset)

// Smoothing MA inputs
GRP = "Smoothing"
TT_BB = "Only applies when 'SMA + Bollinger Bands' is selected. Determines the width of the bands."
maTypeInput = input.string("None", "Type", options = ["None", "SMA", "SMA + Bollinger Bands", "EMA", "SMMA (RMA)", "WMA", "VWMA"], group = GRP, display = display.data_window)
var isBB = maTypeInput == "SMA + Bollinger Bands"
maLengthInput = input.int(14, "Length", group = GRP, display = display.data_window)
bbMultInput = input.float(2.0, "BB StdDev", minval = 0.001, maxval = 50, step = 0.1, group = GRP, display = display.data_window, tooltip = TT_BB)
var enableMA = maTypeInput != "None"

// Smoothing MA Calculation
ma(source, length, MAtype) =>
    switch MAtype
        "SMA"                   => ta.sma(source, length)
        "SMA + Bollinger Bands" => ta.sma(source, length)
        "EMA"                   => ta.ema(source, length)
        "SMMA (RMA)"            => ta.rma(source, length)
        "WMA"                   => ta.wma(source, length)
        "VWMA"                  => ta.vwma(source, length)

// Smoothing MA plots
smoothingMA = enableMA ? ma(out, maLengthInput, maTypeInput) : na
smoothingStDev = isBB ? ta.stdev(out, maLengthInput) * bbMultInput : na
plot(smoothingMA, "SMA-based MA", color=color.yellow, display = enableMA ? display.all : display.none)
bbUpperBand = plot(smoothingMA + smoothingStDev, title = "Upper Bollinger Band", color = color.green, display = isBB ? display.all : display.none)
bbLowerBand = plot(smoothingMA - smoothingStDev, title = "Lower Bollinger Band", color = color.green, display = isBB ? display.all : display.none)
fill(bbUpperBand, bbLowerBand, color=isBB ? color.new(color.green, 90) : na, title="Bollinger Bands Background")`,
  EMA: `//@version=6
indicator(title="Exponential Moving Average", shorttitle="EMA", overlay=true)
len = input.int(9, minval=1, title="Length")
src = input(close, title="Source")
offset = input.int(0, title="Offset")
out = ta.ema(src, len)
plot(out, color=color.blue, title="EMA", offset=offset)`,
};

export const PineEditorModal: React.FC<PineEditorModalProps> = ({ indicatorId, isOpen, onClose }) => {
  const sourceCode = (indicatorId && INDICATOR_SOURCE[indicatorId]) || "// Source code not available";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-[#1e222d] border-[#2a2e39] p-0 overflow-hidden flex flex-col gap-0 text-[#d1d4dc]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2e39] bg-[#1e222d]">
          <div className="flex items-center gap-3">
            <span className="text-blue-500 font-bold text-sm">~</span>
            <span className="font-semibold text-sm">
              {indicatorId === 'SMA' ? 'Simple Moving Average' : indicatorId}
            </span>
            <span className="text-[10px] bg-white/5 px-1 rounded text-[#d1d4dc]/60 italic font-medium">v6</span>
            <button className="flex items-center gap-1 text-[11px] text-[#2962FF] hover:text-white transition-colors ml-2">
               <ChevronDown size={12} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 px-3 py-1 bg-[#2962FF] hover:bg-[#1E4BD8] rounded text-white text-[12px] font-bold h-7">
               <Play size={12} fill="white" /> Add to chart
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 border border-[#363a45] hover:bg-white/5 rounded text-[#d1d4dc] text-[12px] font-bold h-7">
               <ExternalLink size={12} /> Publish script
            </button>
            <div className="flex items-center gap-1 border-l border-[#2a2e39] pl-3 ml-1">
               <button className="p-1 hover:bg-white/5 rounded text-[#d1d4dc]/60 hover:text-white"><Maximize2 size={14} /></button>
               <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-[#d1d4dc]/60 hover:text-white"><X size={14} /></button>
            </div>
          </div>
        </div>

        {/* Read-only Alert Bar */}
        <div className="bg-[#4a3a0c]/20 border-b border-[#ffd700]/10 px-4 py-1.5 flex items-center gap-3">
           <div className="w-5 h-5 rounded-full bg-[#ffd700] flex items-center justify-center text-[#1e222d] font-bold text-xs">!</div>
           <span className="text-[12px] text-[#ffd700]/80">
             This script is read-only. To edit its code, <button className="text-[#2962FF] hover:underline">create a working copy.</button>
           </span>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Gutter */}
          <div className="w-10 bg-[#1e222d] border-r border-[#2a2e39] flex flex-col items-center py-4 gap-0 text-[11px] font-mono text-[#d1d4dc]/30">
            {sourceCode.split('\n').map((_, i) => (
              <div key={i} className="h-[21px] leading-[21px]">{i + 1}</div>
            ))}
          </div>
          
          {/* Code */}
          <div className="flex-1 overflow-auto bg-[#131722] p-4 font-mono text-[13px] leading-[21px] whitespace-pre-wrap select-text">
             {sourceCode.split('\n').map((line, i) => {
               // Simple syntax highlighting
               if (line.startsWith('//@')) return <div key={i} className="text-[#6a737d]">{line}</div>;
               if (line.startsWith('//')) return <div key={i} className="text-[#6a737d]">{line}</div>;
               
               return (
                 <div key={i} className="hover:bg-white/5 -mx-4 px-4">
                   {line.split(/([(),"']|\binput\b|\binput\.int\b|\bta\.sma\b|\bplot\b|\bcolor\b|\bindicator\b|\bvar\b|\bma\b|\bswitch\b|\bna\b)/).map((part, j) => {
                     if (['indicator', 'input', 'input.int', 'input.float', 'input.string', 'var', 'switch'].includes(part)) return <span key={j} className="text-[#c678dd]">{part}</span>;
                     if (['ta.sma', 'ta.ema', 'ta.rma', 'ta.wma', 'ta.vwma', 'ta.stdev', 'plot', 'fill'].includes(part)) return <span key={j} className="text-[#61afef]">{part}</span>;
                     if (part === 'color' || part.startsWith('color.')) return <span key={j} className="text-[#d19a66]">{part}</span>;
                     if (part.startsWith('"') || part.startsWith("'")) return <span key={j} className="text-[#98c379]">{part}</span>;
                     if (/\d+/.test(part) && !/[a-zA-Z]/.test(part)) return <span key={j} className="text-[#d19a66]">{part}</span>;
                     return <span key={j}>{part}</span>;
                   })}
                 </div>
               );
             })}
          </div>

          {/* Mini-map mock */}
          <div className="w-24 border-l border-[#2a2e39] bg-[#1e222d] opacity-20 pointer-events-none hidden md:block" />
        </div>
        
        {/* Footer */}
        <div className="bg-[#1e222d] border-t border-[#2a2e39] px-4 py-1.5 flex items-center justify-between text-[11px] text-[#d1d4dc]/40">
           <div className="flex gap-4">
             <span>Console</span>
             <span>Strategy Tester</span>
             <span className="text-[#2962FF] border-b border-[#2962FF] text-[#d1d4dc]">Pine Editor</span>
             <span>Stock Screener</span>
           </div>
           <div className="flex gap-3">
             <span>Line 1, Col 1</span>
             <span>UTF-8</span>
             <span>Pine Script</span>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
