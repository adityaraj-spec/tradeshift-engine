import React, { useState } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  ChevronRight, 
  RotateCcw, 
  BrainCircuit, 
  ShieldCheck, 
  AlertTriangle,
  Lightbulb,
  MessageSquareQuote
} from 'lucide-react';

interface AIAnalystProps {
  symbol: string;
  isLaymanMode: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const AIAnalyst: React.FC<AIAnalystProps> = ({ symbol, isLaymanMode }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [laymanExplanation, setLaymanExplanation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_BASE}/api/stock/${symbol}/analyze`);
      setAnalysis(response.data.analysis);
      setLaymanExplanation(null); // Reset explanation when new analysis comes
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getLaymanExplanation = async () => {
    if (!analysis) return;
    setIsSimplifying(true);
    try {
      const response = await axios.post(`${API_BASE}/api/stock/${symbol}/explain`, {
        text: analysis
      });
      setLaymanExplanation(response.data.explanation);
    } catch (error) {
      console.error("Layman simplification failed:", error);
    } finally {
      setIsSimplifying(false);
    }
  };

  // Auto-simplify if layman mode is toggled and we have analysis but no explanation
  React.useEffect(() => {
    if (isLaymanMode && analysis && !laymanExplanation && !isSimplifying) {
      getLaymanExplanation();
    }
  }, [isLaymanMode, analysis]);

  if (!analysis && !isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-[#0a0a0a] border border-white/5 border-dashed rounded-3xl space-y-4 text-center">
        <div className="p-4 bg-primary/10 rounded-full">
          <BrainCircuit className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Deep AI Thesis Pending</h3>
          <p className="text-gray-500 text-sm max-w-xs">
            Ask FinGPT to scan all fundamentals to generate a high-conviction investment thesis.
          </p>
        </div>
        <button 
          onClick={performAnalysis}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-xl font-bold hover:scale-105 transition-transform"
        >
          Generate AI Thesis
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const currentContent = isLaymanMode ? (laymanExplanation || "Simplifying for you...") : analysis;
  const isLoading = isAnalyzing || (isLaymanMode && isSimplifying);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {isLaymanMode ? (
            <BrainCircuit className="w-5 h-5 text-green-500" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-primary" />
          )}
          <span className="text-sm font-bold tracking-tight">
            {isLaymanMode ? "AI ANALYST (LAYMAN)" : "INSTITUTIONAL GRADE THESIS"}
          </span>
        </div>
        <button 
          onClick={performAnalysis}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
          title="Regenerate Analysis"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {isLoading ? (
          <div className="space-y-4 py-8">
            <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse"></div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none prose-sm">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {currentContent}
            </div>
            
            {!isLaymanMode && (
              <div className="mt-8 grid grid-cols-1 gap-4">
                <div className="flex gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                  <Lightbulb className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase mb-1">Key Insight</h4>
                    <p className="text-[11px] text-gray-400">Analysis indicates strong competitive positioning but suggests caution on current valuation multiples.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          Powered by FinGPT Engine v2.0
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/20"></div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyst;
