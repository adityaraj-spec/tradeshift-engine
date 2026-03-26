import React, { useState } from 'react';
import { X, Info, ChevronDown } from 'lucide-react';
import { useAlerts } from '../../store/useAlerts';
import type { AlertCondition, AlertTrigger } from '../../store/useAlerts';
import { toast } from 'sonner';
import { PremiumSelect, type Option } from '@/components/ui/PremiumSelect';

const CONDITION_1_OPTIONS: Option[] = [{ value: 'Price', label: 'Price' }];
const CONDITION_OPTIONS: Option[] = [
  { value: 'crossing', label: 'Crossing' },
  { value: 'crossing_up', label: 'Crossing Up' },
  { value: 'crossing_down', label: 'Crossing Down' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' }
];
const TRIGGER_OPTIONS: Option[] = [
  { value: 'once', label: 'Once only' },
  { value: 'every_time', label: 'Every time' }
];

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  symbol,
  currentPrice,
}) => {
  const [condition, setCondition] = useState<AlertCondition>('crossing');
  const [value, setValue] = useState<number>(Math.round(currentPrice * 100) / 100);
  const [trigger, setTrigger] = useState<AlertTrigger>('once');
  const [message, setMessage] = useState(`${symbol} Crossing ${value.toFixed(2)}`);
  
  const { addAlert } = useAlerts();

  if (!isOpen) return null;

  const handleCreate = () => {
    addAlert({
      id: Math.random().toString(36).substr(2, 9),
      symbol,
      condition,
      value,
      trigger,
      expiration: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days default
      message,
      active: true,
      createdAt: Date.now(),
    });
    toast.success('Alert created successfully');
    onClose();
  };

  const handleValueChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setValue(num);
      setMessage(`${symbol} ${condition.replace('_', ' ')} ${num.toFixed(2)}`);
    } else {
      setValue(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2e39] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">Create alert on</span>
            <div className="flex items-center gap-2 bg-[#2a2e39] px-2 py-1 rounded cursor-pointer hover:bg-[#363a45] transition-colors">
               <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-[10px] font-bold text-white">H</div>
               <span className="text-sm font-bold text-[#d1d4dc]">{symbol}</span>
               <ChevronDown size={14} className="text-[#5d606b]" />
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-md transition-colors text-[#5d606b] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Condition Section */}
          <div className="space-y-3">
             <label className="text-sm font-medium text-[#d1d4dc]">Condition</label>
             <div className="grid grid-cols-1 gap-2">
                <PremiumSelect
                  value="Price"
                  onChange={() => {}}
                  options={CONDITION_1_OPTIONS}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                
                <div className="flex gap-2">
                <div className="flex-[2]">
                  <PremiumSelect
                    value={condition}
                    onChange={(v) => setCondition(v as AlertCondition)}
                    options={CONDITION_OPTIONS}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                  
                  <div className="flex-[3] flex gap-1">
                    <div className="min-w-[80px]">
                      <PremiumSelect
                        value="Value"
                        onChange={() => {}}
                        options={[{ value: 'Value', label: 'Value' }]}
                        className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      value={value}
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                  </div>
                </div>
             </div>
             
             <button className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 mt-1 transition-colors">
               <span className="text-base leading-none">+</span> Add condition
               <Info size={12} className="text-[#5d606b] ml-1" />
             </button>
          </div>

          <div className="h-[1px] bg-[#2a2e39]" />

          {/* Trigger & Expiration */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#d1d4dc]">Trigger</label>
              <div className="relative">
                <PremiumSelect
                  value={trigger}
                  onChange={(v) => setTrigger(v as AlertTrigger)}
                  options={TRIGGER_OPTIONS}
                  className="w-full bg-transparent border-none text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#d1d4dc]">Expiration</label>
              <div className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-blue-400 transition-colors">
                <span>April 19, 2026 at 17:57</span>
                <ChevronDown size={14} className="text-[#5d606b]" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
             <label className="text-sm font-medium text-[#d1d4dc]">Message</label>
             <div className="flex gap-2">
                <textarea 
                  className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors min-h-[60px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="p-2 border border-[#2a2e39] rounded hover:bg-[#2a2e39] transition-colors text-[#d1d4dc]">
                   <ChevronDown size={16} />
                </button>
             </div>
          </div>

          {/* Notifications */}
          <div className="space-y-1.5">
             <label className="text-sm font-medium text-[#d1d4dc]">Notifications</label>
             <div className="flex items-center gap-3 text-sm text-white cursor-pointer hover:text-blue-400 transition-colors">
                <span className="bg-[#2a2e39] px-2 py-1 rounded text-xs flex items-center gap-1.5">
                   App, Toasts <ChevronDown size={14} className="text-[#5d606b]" />
                </span>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-[#2a2e39] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#2a2e39] hover:bg-[#363a45] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-black bg-[#f0f3fa] hover:bg-white transition-colors"
          >
            Create
          </button>
        </div>

      </div>
    </div>
  );
};
