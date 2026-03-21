import React from 'react';
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, 
  GripVertical, Box, LineChart, ChevronRight 
} from 'lucide-react';
import { useChartObjects, type ChartObject } from '../../store/useChartObjects';

interface ObjectTreeProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectObject?: (id: string) => void;
}

export const ObjectTree: React.FC<ObjectTreeProps> = ({ isOpen, onClose }) => {
  const { objects, removeObject, toggleVisibility, toggleLock } = useChartObjects();

  const indicators = objects.filter(o => o.type === 'indicator');
  const drawings = objects.filter(o => o.type === 'drawing');

  const ObjectItem = ({ obj }: { obj: ChartObject }) => (
    <div 
      className="group flex items-center justify-between p-2 hover:bg-[#2a2e39] rounded transition-colors border border-transparent hover:border-[#363a45]"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <GripVertical size={14} className="text-[#5d606b] cursor-grab active:cursor-grabbing shrink-0" />
        <div 
          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: obj.color }}
        />
        <span className="text-xs font-medium text-[#d1d4dc] truncate max-w-[120px]">
          {obj.name}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => toggleVisibility(obj.id)}
          className={`p-1.5 rounded hover:bg-[#363a45] transition-colors ${obj.visible ? 'text-[#d1d4dc]' : 'text-[#f23645]'}`}
        >
          {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button 
          onClick={() => toggleLock(obj.id)}
          className={`p-1.5 rounded hover:bg-[#363a45] transition-colors ${obj.locked ? 'text-blue-500' : 'text-[#5d606b]'}`}
        >
          {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
        <button 
          onClick={() => removeObject(obj.id)}
          className="p-1.5 rounded hover:bg-[#f23645]/10 text-[#5d606b] hover:text-[#f23645] transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className={`fixed top-16 right-0 bottom-0 w-72 bg-[#1e222d] border-l border-[#2a2e39] z-[100] transition-transform duration-300 shadow-2xl flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[#2a2e39] bg-[#1e222d]/50">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Box size={16} className="text-blue-500" />
          Object Tree
        </h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[#2a2e39] text-[#d1d4dc] transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-6">
        {/* Indicators Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold text-[#5d606b] tracking-wider flex items-center gap-1">
              <LineChart size={12} />
              Indicators
            </span>
            <span className="text-[10px] text-[#5d606b]">{indicators.length}</span>
          </div>
          <div className="space-y-1">
            {indicators.length === 0 ? (
              <p className="text-[10px] text-[#5d606b] italic px-2">No active indicators</p>
            ) : (
              indicators.map((obj) => (
                <ObjectItem key={obj.id} obj={obj} />
              ))
            )}
          </div>
        </div>

        {/* Drawings Section */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold text-[#5d606b] tracking-wider flex items-center gap-1">
              <Box size={12} />
              Drawings
            </span>
            <span className="text-[10px] text-[#5d606b]">{drawings.length}</span>
          </div>
          <div className="space-y-1">
            {drawings.length === 0 ? (
              <p className="text-[10px] text-[#5d606b] italic px-2">No drawings created</p>
            ) : (
              drawings.map((obj) => (
                <ObjectItem key={obj.id} obj={obj} />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#2a2e39] bg-[#1e222d]/50">
         <div className="text-[10px] text-[#5d606b] text-center">
            Drag items to change layer order
         </div>
      </div>
    </div>
  );
};
