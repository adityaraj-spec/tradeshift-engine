import React, { useEffect, useState } from 'react';
import { Activity, Database } from 'lucide-react';

interface PerformanceMonitorProps {
  indicatorCount: number;
  drawingCount: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  indicatorCount,
  drawingCount,
}) => {
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<string | null>(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        
        // Memory usage (Chrome only)
        if ((performance as any).memory) {
          const used = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
          setMemory(`${used}MB`);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="absolute top-20 right-4 z-40 bg-[#1e222d]/80 backdrop-blur-md border border-[#2a2e39] rounded-xl p-3 shadow-2xl flex flex-col gap-2 pointer-events-none select-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Activity size={16} className={fps < 30 ? 'text-red-500' : 'text-emerald-500'} />
        </div>
        <div>
          <p className="text-[10px] text-[#d1d4dc]/40 font-black uppercase tracking-widest leading-none mb-1">FPS</p>
          <p className={`text-sm font-black leading-none ${fps < 30 ? 'text-red-500' : 'text-emerald-500'}`}>{fps}</p>
        </div>
      </div>

      <div className="h-px bg-[#2a2e39]" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[9px] text-[#d1d4dc]/30 font-bold uppercase tracking-tight mb-1">Indicators</p>
          <p className="text-xs font-black text-blue-400">{indicatorCount}</p>
        </div>
        <div>
          <p className="text-[9px] text-[#d1d4dc]/30 font-bold uppercase tracking-tight mb-1">Drawings</p>
          <p className="text-xs font-black text-purple-400">{drawingCount}</p>
        </div>
      </div>

      {memory && (
        <>
          <div className="h-px bg-[#2a2e39]" />
          <div className="flex items-center gap-2">
            <Database size={12} className="text-[#d1d4dc]/20" />
            <p className="text-[9px] text-[#d1d4dc]/40 font-black uppercase tracking-widest">{memory} Heap</p>
          </div>
        </>
      )}
    </div>
  );
};
