import React, { useState } from 'react';
import { X, HelpCircle, ChevronRight, LayoutGrid } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { PremiumSelect, type Option } from '@/components/ui/PremiumSelect';

const CONDITION_1_OPTIONS: Option[] = [{ value: 'Price', label: 'Price' }];
const CONDITION_2_OPTIONS: Option[] = [{ value: 'Crossing', label: 'Crossing' }];
const TRIGGER_OPTIONS: Option[] = [
  { value: 'Once only', label: 'Once only' },
  { value: 'Once per bar', label: 'Once per bar' },
  { value: 'Once per bar close', label: 'Once per bar close' },
  { value: 'Once per minute', label: 'Once per minute' }
];
const EXPIRATION_OPTIONS: Option[] = [
  { value: 'April 18, 2026 at 03:02', label: 'April 18, 2026 at 03:02' },
  { value: 'Open-ended', label: 'Open-ended' }
];

interface DrawingAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolDetails?: string;
}

export const DrawingAlertModal: React.FC<DrawingAlertModalProps> = ({ isOpen, onClose, toolDetails = 'ray' }) => {
  const { selectedSymbol } = useGame();
  
  const [cond1, setCond1] = useState('Price');
  const [cond2, setCond2] = useState('Crossing');
  const [cond3, setCond3] = useState(toolDetails);
  const [trigger, setTrigger] = useState('Once only');
  const [expiration, setExpiration] = useState('Open-ended');

  // Keep cond3 options dynamic based on toolDetails
  const CONDITION_3_OPTIONS: Option[] = [
    { value: toolDetails, label: toolDetails },
    { value: 'Value', label: 'Value' }
  ];

  if (!isOpen) return null;

  const symbolText = selectedSymbol || 'NIFTY1!';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-[#1e222d] rounded shadow-2xl w-[480px] flex flex-col overflow-hidden text-[#131722] dark:text-[#d1d4dc]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2e39]">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Create alert on</h2>
            <div className="flex items-center gap-2 text-sm font-semibold bg-gray-100 dark:bg-[#2a2e39] px-2 py-1 rounded">
              <span className="w-4 h-4 rounded-full overflow-hidden inline-flex items-center justify-center flex-shrink-0">
                <img src="https://flagcdn.com/w20/in.png" alt="IN" className="h-full object-cover" />
              </span>
              <span>{symbolText}, 1D</span>
              <span className="opacity-50 text-xs">▼</span>
            </div>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <LayoutGrid size={18} />
            <button onClick={onClose} className="hover:opacity-100 transition-opacity"><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-[13px]">
          
          {/* Condition */}
          <div className="flex gap-4">
            <div className="w-[100px] text-gray-500 pt-2 shrink-0">Condition</div>
            <div className="flex-1 space-y-2">
              <div className="relative">
                <PremiumSelect
                  value={cond1}
                  onChange={setCond1}
                  options={CONDITION_1_OPTIONS}
                  className="w-full bg-white dark:bg-[#2a2e39] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none flex z-10 w-4 h-4 text-white">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                </div>
                <PremiumSelect
                  value={cond2}
                  onChange={setCond2}
                  options={CONDITION_2_OPTIONS}
                  className="w-full bg-white dark:bg-[#2a2e39] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 pl-9 outline-none focus:border-blue-500"
                />
              </div>

              <div className="relative">
                <PremiumSelect
                  value={cond3}
                  onChange={setCond3}
                  options={CONDITION_3_OPTIONS}
                  className="w-full bg-white dark:bg-[#2a2e39] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 py-1 font-medium">
                <span className="text-lg leading-none">+</span> Add condition <HelpCircle size={14} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="w-full h-px bg-gray-200 dark:bg-[#2a2e39] my-2"></div>

          {/* Trigger */}
          <div className="flex items-center gap-4">
            <div className="w-[100px] text-gray-500 shrink-0">Trigger</div>
            <div className="flex-1 relative z-40">
              <PremiumSelect
                value={trigger}
                onChange={setTrigger}
                options={TRIGGER_OPTIONS}
                className="w-full bg-transparent outline-none py-1 border-none font-medium text-[13px]"
              />
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-center gap-4">
            <div className="w-[100px] text-gray-500 shrink-0">Expiration</div>
            <div className="flex-1 flex gap-2 relative z-30">
              <PremiumSelect
                value={expiration}
                onChange={setExpiration}
                options={EXPIRATION_OPTIONS}
                className="w-full bg-transparent outline-none py-1 border-none font-medium text-[13px]"
              />
            </div>
          </div>

          {/* Message */}
          <div className="flex items-center gap-4">
            <div className="w-[100px] text-gray-500 shrink-0">Message</div>
            <div className="flex-1 flex justify-between items-center group cursor-pointer font-medium p-1 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-[#2a2e39]">
              <span>{symbolText}, 1D Crossing {toolDetails}</span>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100" />
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center gap-4">
            <div className="w-[100px] text-gray-500 shrink-0">Notifications</div>
            <div className="flex-1 flex justify-between items-center group cursor-pointer font-medium p-1 -ml-1 rounded hover:bg-gray-100 dark:hover:bg-[#2a2e39]">
              <span>App, Toasts</span>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100" />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-[#1e222d] border-t border-gray-200 dark:border-[#2a2e39]">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-md font-semibold text-gray-700 dark:text-[#d1d4dc] border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
