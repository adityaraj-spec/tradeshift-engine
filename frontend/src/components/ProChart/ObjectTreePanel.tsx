import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, Unlock, Settings, GripVertical, Search, Layers, PenTool, X } from 'lucide-react';
import { useChartObjects } from '../../store/useChartObjects';
import type { ChartObject } from '../../store/useChartObjects';

interface ObjectTreePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onIndicatorSettings?: (id: string) => void;
  onToggleIndicator?: (id: string) => void;
}

export const ObjectTreePanel: React.FC<ObjectTreePanelProps> = ({
  isOpen,
  onClose,
  onIndicatorSettings,
  onToggleIndicator,
}) => {
  const { objects, toggleVisibility, toggleLock, reorder } = useChartObjects();
  const [search, setSearch] = useState('');
  const dragItemRef = useRef<number | null>(null);
  const dragOverRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const indicators = objects.filter((o) => o.type === 'indicator');
  const drawings = objects.filter((o) => o.type === 'drawing');

  const filterObjects = (items: ChartObject[]) =>
    search ? items.filter((o) => o.name.toLowerCase().includes(search.toLowerCase())) : items;

  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverRef.current !== null && dragItemRef.current !== dragOverRef.current) {
      reorder(dragItemRef.current, dragOverRef.current);
    }
    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  const ObjectRow = ({ obj, globalIndex }: { obj: ChartObject; globalIndex: number }) => (
    <div
      draggable
      onDragStart={() => handleDragStart(globalIndex)}
      onDragEnter={() => handleDragEnter(globalIndex)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-md transition-colors group cursor-grab active:cursor-grabbing"
    >
      <GripVertical size={12} className="text-white/20 group-hover:text-white/40 shrink-0" />

      {/* Color Swatch */}
      <div
        className="w-3 h-3 rounded-full shrink-0 border border-white/10"
        style={{ backgroundColor: obj.color }}
      />

      {/* Name */}
      <span className={`text-xs font-semibold flex-1 truncate ${obj.visible ? 'text-[#d1d4dc]' : 'text-[#d1d4dc]/30 line-through'}`}>
        {obj.name}
      </span>

      {/* Eye */}
      <button
        onClick={() => {
          toggleVisibility(obj.id);
          if (obj.type === 'indicator' && onToggleIndicator) {
            onToggleIndicator(obj.id);
          }
        }}
        className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        title={obj.visible ? 'Hide' : 'Show'}
      >
        {obj.visible ? <Eye size={12} className="text-[#d1d4dc]/60" /> : <EyeOff size={12} className="text-[#d1d4dc]/30" />}
      </button>

      {/* Lock */}
      <button
        onClick={() => toggleLock(obj.id)}
        className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
        title={obj.locked ? 'Unlock' : 'Lock'}
      >
        {obj.locked ? <Lock size={12} className="text-orange-400/60" /> : <Unlock size={12} className="text-[#d1d4dc]/30" />}
      </button>

      {/* Settings */}
      {obj.type === 'indicator' && onIndicatorSettings && (
        <button
          onClick={() => onIndicatorSettings(obj.id)}
          className="p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Settings"
        >
          <Settings size={12} className="text-[#d1d4dc]/40" />
        </button>
      )}
    </div>
  );

  return (
    <div className="w-72 h-full border-l border-[#2a2e39] bg-[#131722] flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
        <h3 className="text-xs font-black uppercase tracking-widest text-white">Object Tree</h3>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X size={14} className="text-[#d1d4dc]/50" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#2a2e39]">
        <div className="flex items-center gap-2 bg-[#1e222d] rounded-md px-2.5 py-1.5 border border-[#2a2e39]">
          <Search size={12} className="text-[#d1d4dc]/30 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter objects..."
            className="bg-transparent text-xs text-[#d1d4dc] placeholder:text-[#d1d4dc]/20 focus:outline-none w-full font-medium"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Indicators Section */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-2">
            <Layers size={12} className="text-blue-400/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400/60">
              Indicators ({filterObjects(indicators).length})
            </span>
          </div>
          {filterObjects(indicators).length === 0 ? (
            <p className="text-[10px] text-[#d1d4dc]/20 px-3 py-2 italic">No active indicators</p>
          ) : (
            filterObjects(indicators).map((obj) => {
              const globalIndex = objects.findIndex((o) => o.id === obj.id);
              return <ObjectRow key={obj.id} obj={obj} globalIndex={globalIndex} />;
            })
          )}
        </div>

        <div className="mx-3 h-px bg-[#2a2e39] my-2" />

        {/* Drawings Section */}
        <div className="px-3 pt-1 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <PenTool size={12} className="text-purple-400/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400/60">
              Drawings ({filterObjects(drawings).length})
            </span>
          </div>
          {filterObjects(drawings).length === 0 ? (
            <p className="text-[10px] text-[#d1d4dc]/20 px-3 py-2 italic">No drawings</p>
          ) : (
            filterObjects(drawings).map((obj) => {
              const globalIndex = objects.findIndex((o) => o.id === obj.id);
              return <ObjectRow key={obj.id} obj={obj} globalIndex={globalIndex} />;
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#2a2e39] text-[9px] text-[#d1d4dc]/20 font-bold uppercase tracking-widest text-center">
        {objects.length} objects · Drag to reorder
      </div>
    </div>
  );
};

export default ObjectTreePanel;
