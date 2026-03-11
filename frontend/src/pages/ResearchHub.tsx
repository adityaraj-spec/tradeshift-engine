import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  Search, 
  Info, 
  Brain, 
  TrendingUp, 
  ShieldAlert, 
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import RatioGrid from '../components/features/analysis/RatioGrid';
import FinancialCharts from '../components/features/analysis/FinancialCharts';
import AIAnalyst from '../components/features/analysis/AIAnalyst';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ResearchHub: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLaymanMode, setIsLaymanMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/api/stock/${symbol}/profile`);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching stock profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchProfile();
    }
  }, [symbol]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-6 space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-white">{symbol}</h1>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium border border-primary/30">
              EQUITY
            </span>
          </div>
          <p className="text-gray-400 text-sm max-w-lg">
            Institutional-grade deep dive and fundamental analysis powered by FinGPT.
          </p>
        </div>

        <div className="flex items-center gap-4 p-1.5 bg-black/40 rounded-xl border border-white/10">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${!isLaymanMode ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`} onClick={() => setIsLaymanMode(false)}>
            Professional
          </span>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${isLaymanMode ? 'bg-green-500 text-black' : 'text-gray-400 hover:text-white'}`} onClick={() => setIsLaymanMode(true)}>
            <Brain className="w-3.5 h-3.5" />
            Layman Explain
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Content: Fundamentals & Charts */}
        <div className="xl:col-span-2 space-y-8">
          {/* Key Metrics Grid */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Key Fundamental Ratios</h2>
            </div>
            <RatioGrid data={profile?.fundamentals} isLaymanMode={isLaymanMode} />
          </section>

          {/* Financial Visualizations */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Yearly Financial Growth</h2>
            </div>
            <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 h-[400px]">
              <FinancialCharts data={profile?.financials} />
            </div>
          </section>
        </div>

        {/* Right Content: AI Analyst Section */}
        <div className="space-y-8">
          <section className="space-y-4 h-full">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h2 className="text-xl font-semibold">The AI's Thesis</h2>
            </div>
            <AIAnalyst symbol={symbol || ''} isLaymanMode={isLaymanMode} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResearchHub;
