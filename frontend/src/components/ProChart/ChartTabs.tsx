import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useMultiChartStore } from '../../store/useMultiChartStore';
import { SymbolSearch } from '../features/SymbolSearch';
import './ChartTabs.css';

export const ChartTabs: React.FC = () => {
    const { charts, activeChartId, setActiveChart, removeChart, addChart } = useMultiChartStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleAddTab = () => {
        setIsSearchOpen(true);
    };

    const handleSelectSymbol = (symbol: string) => {
        addChart(symbol);
    };

    return (
        <div className="chart-tabs-container">
            <SymbolSearch 
                open={isSearchOpen} 
                onOpenChange={setIsSearchOpen} 
                onSelect={handleSelectSymbol}
            />
            
            <div className="chart-tabs-list">
                {charts.map((chart) => {
                    const isActive = chart.id === activeChartId;
                    return (
                        <div 
                            key={chart.id}
                            className={`chart-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveChart(chart.id)}
                        >
                            <div className="chart-tab-content">
                                <span className="chart-tab-symbol">{chart.symbol}</span>
                                <span className="chart-tab-timeframe">{chart.timeframe}</span>
                            </div>
                            {charts.length > 1 && (
                                <button 
                                    className="chart-tab-close"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeChart(chart.id);
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <div className="chart-tab-active-indicator" />
                        </div>
                    );
                })}
                
                {charts.length < 4 && (
                    <button 
                        className="chart-tab-add"
                        onClick={handleAddTab}
                        title="Add Tab (Ctrl+N)"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>
            
        </div>
    );
};

export default ChartTabs;
