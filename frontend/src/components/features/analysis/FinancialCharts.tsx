import React from 'react';
import {
  
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from 'recharts';

interface FinancialChartsProps {
  data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f0f0f] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-gray-300 text-xs font-bold mb-2 uppercase tracking-tighter">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <p className="text-sm font-medium">
              <span className="text-gray-400 capitalize">{entry.name}: </span>
              <span className="text-white">₹{(entry.value / 1000).toFixed(1)}K Cr</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Recharts prefers chronological order (oldest to newest)
  const sortedData = [...data].sort((a, b) => a.year - b.year);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={sortedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis 
          dataKey="year" 
          stroke="#4b5563" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          dy={10}
        />
        <YAxis 
          stroke="#4b5563" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          align="right" 
          iconType="circle" 
          wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
        />
        <Bar 
          name="Revenue" 
          dataKey="revenue" 
          fill="url(#colorRev)" 
          stroke="#3b82f6" 
          strokeWidth={1}
          radius={[4, 4, 0, 0]} 
          barSize={40}
        />
        <Line 
          name="Net Profit" 
          type="monotone" 
          dataKey="net_profit" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#000' }}
          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default FinancialCharts;
