import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
   Search, Download, Filter, TrendingUp, TrendingDown,
  Clock, Target, RefreshCw, AlertCircle, Award, Briefcase, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const api = axios.create({ baseURL: '', withCredentials: true });

export default function HistoryPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [summary, setSummary] = useState<any[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const { sessionType } = useGame();
  
  // Pagination & Filtering state
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    symbol: '',
    direction: '',
    search: '',
  });

  const [sortConfig, setSortConfig] = useState({ key: 'entry_time', order: 'desc' });

  // Load symbols once
  // Load symbols and summary when session changes
  useEffect(() => {
    api.get('/api/history/symbols', { params: { session_type: sessionType } })
      .then(res => setSymbols(res.data.symbols || []))
      .catch(console.error);
    fetchSummary();
  }, [sessionType]);

  // Fetch Summary
  const fetchSummary = async () => {
    try {
      const res = await api.get('/api/history/monthly-summary', { params: { session_type: sessionType } });
      setSummary(res.data.months || []);
    } catch (e) {
      console.error('Failed to fetch summary:', e);
    }
  };

  // Fetch Trades definition
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.append('from', filters.dateFrom);
      if (filters.dateTo) params.append('to', filters.dateTo);
      if (filters.symbol) params.append('symbol', filters.symbol);
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.search) params.append('search', filters.search);
      
      params.append('sort_by', sortConfig.key);
      params.append('sort_order', sortConfig.order);
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      params.append('session_type', sessionType);

      const res = await api.get(`/api/history/trades?${params.toString()}`);
      setTrades(res.data.trades || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (e) {
      console.error('Failed to fetch trades:', e);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig, page, limit, sessionType]);

  // Refetch trades on dep change
  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Handlers
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      order: current.key === key && current.order === 'desc' ? 'asc' : 'desc'
    }));
    setPage(1);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.search) params.append('search', filters.search);
    params.append('session_type', sessionType);
    
    window.location.href = `/api/history/trades/export?${params.toString()}`;
  };

  const currentMonthSummary = summary.length > 0 ? summary[0] : null;

  return (
    <div className="p-6 space-y-6 w-full pb-20">
      
      {/* ─── HEADER & QUICK LINKS ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Clock className="text-sidebar-primary" /> Trade History
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1 text-sm">Review past trades, filter performance, and export tax reports.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-primary/50 transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] shadow-sm dark:shadow-none p-1 mr-2">
            <button className="px-3 py-1.5 text-xs text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 rounded-md hover:bg-sidebar-accent/20">
              <FileText size={14} /> Trade Journal
            </button>
            <button className="px-3 py-1.5 text-xs text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 rounded-md hover:bg-sidebar-accent/20">
              <Target size={14} /> Performance
            </button>
          </div>
          <button onClick={handleExport} className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-primary/50 transition-all duration-500 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-muted-foreground flex items-center gap-2">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ─── MONTHLY SUMMARY CARDS ─── */}
      {currentMonthSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SummaryCard 
            icon={<Briefcase />} label="Total Trades" 
            value={currentMonthSummary.total_trades} 
            subtitle={`in ${currentMonthSummary.label}`} 
          />
          <SummaryCard 
            icon={<Award />} label="Win Rate" 
            value={`${currentMonthSummary.win_rate}%`} 
            subtitle={`${currentMonthSummary.wins}W - ${currentMonthSummary.losses}L`}
            color={currentMonthSummary.win_rate >= 50 ? 'text-green-500' : 'text-red-500'} 
          />
          <SummaryCard 
            icon={<Target />} label="Net P&L" 
            value={`₹${Math.abs(currentMonthSummary.total_pnl).toLocaleString('en-IN')}`} 
            subtitle={currentMonthSummary.total_pnl >= 0 ? "Profitable month" : "Loss-making month"}
            color={currentMonthSummary.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'} 
            isCurrency={true}
            isPositive={currentMonthSummary.total_pnl >= 0}
          />
          <SummaryCard 
            icon={<Clock />} label="Avg Hold Time" 
            value={currentMonthSummary.avg_holding_time > 60 ? `${(currentMonthSummary.avg_holding_time / 60).toFixed(1)}h` : `${currentMonthSummary.avg_holding_time}m`} 
            subtitle="Time in market" 
            color="text-blue-400" 
          />
        </div>
      )}

      {/* ─── FILTER BAR ─── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm dark:shadow-none p-4 flex flex-col lg:flex-row gap-4 items-end">
        
        <div className="flex-1 w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Symbol or exit reason..."
                className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-sidebar-primary transition-colors"
                value={filters.search}
                onChange={e => { setFilters(f => ({...f, search: e.target.value})); setPage(1); }}
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Symbol</label>
            <Select 
              value={filters.symbol || "all"}
              onValueChange={val => { setFilters(f => ({...f, symbol: val === "all" ? "" : val})); setPage(1); }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-lg h-[38px] px-4 text-sm text-gray-900 dark:text-white focus-visible:ring-1 focus-visible:ring-sidebar-primary focus-visible:ring-offset-0 focus:outline-none focus:border-sidebar-primary cursor-pointer">
                <SelectValue placeholder="All Symbols" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5 rounded-xl shadow-lg dark:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]">
                <SelectItem value="all" className="cursor-pointer text-sm font-medium focus:bg-gray-100 dark:focus:bg-white/10 dark:text-gray-300 dark:focus:text-white rounded-md my-0.5">All Symbols</SelectItem>
                {symbols.map(s => <SelectItem key={s} value={s} className="cursor-pointer text-sm font-medium focus:bg-gray-100 dark:focus:bg-white/10 dark:text-gray-300 dark:focus:text-white rounded-md my-0.5">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-36 space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">Direction</label>
            <Select 
              value={filters.direction || "all"}
              onValueChange={val => { setFilters(f => ({...f, direction: val === "all" ? "" : val})); setPage(1); }}
            >
              <SelectTrigger className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-lg h-[38px] px-4 text-sm text-gray-900 dark:text-white focus-visible:ring-1 focus-visible:ring-sidebar-primary focus-visible:ring-offset-0 focus:outline-none focus:border-sidebar-primary cursor-pointer">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-white/5 rounded-xl shadow-lg dark:shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]">
                <SelectItem value="all" className="cursor-pointer text-sm font-medium focus:bg-gray-100 dark:focus:bg-white/10 dark:text-gray-300 dark:focus:text-white rounded-md my-0.5">All</SelectItem>
                <SelectItem value="BUY" className="cursor-pointer text-sm font-medium focus:bg-gray-100 dark:focus:bg-white/10 dark:text-gray-300 dark:focus:text-white rounded-md my-0.5">Long (BUY)</SelectItem>
                <SelectItem value="SELL" className="cursor-pointer text-sm font-medium focus:bg-gray-100 dark:focus:bg-white/10 dark:text-gray-300 dark:focus:text-white rounded-md my-0.5">Short (SELL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-full md:w-40 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">From Date</label>
              <input 
                type="date" 
                className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-sidebar-primary color-scheme-dark"
                value={filters.dateFrom}
                onChange={e => { setFilters(f => ({...f, dateFrom: e.target.value})); setPage(1); }}
              />
            </div>
            <div className="mt-6 text-gray-500 dark:text-muted-foreground">-</div>
            <div className="w-full md:w-40 space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider">To Date</label>
              <input 
                type="date" 
                className="w-full bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2e2e2e] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-sidebar-primary color-scheme-dark"
                value={filters.dateTo}
                onChange={e => { setFilters(f => ({...f, dateTo: e.target.value})); setPage(1); }}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            setFilters({dateFrom: '', dateTo: '', symbol: '', direction: '', search: ''});
            setPage(1);
          }}
          className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-primary/50 transition-all duration-500 shadow-sm dark:shadow-none hover:shadow-xl dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-muted-foreground whitespace-nowrap"
        >
          Clear Filters
        </button>
      </div>

      {/* ─── TRADE TABLE ─── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl shadow-sm dark:shadow-none flex flex-col flex-1 min-h-[400px]">
        {loading && trades.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center flex-1">
            <RefreshCw className="w-8 h-8 text-sidebar-primary animate-spin opacity-50 mb-4" />
            <p className="text-gray-500 dark:text-muted-foreground animate-pulse">Loading trade history...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-500 dark:text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Trades Found</h3>
            <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-sm text-center">Try adjusting your filters or date range to view historical trades.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-muted-foreground">
                  <Th label="Date/Time" sortKey="entry_time" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Symbol" sortKey="symbol" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Type" sortKey="direction" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Qty" sortKey="quantity" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Entry" />
                  <Th label="Exit" />
                  <Th label="P&L" sortKey="pnl" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Hold Time" sortKey="holding_time" currentSort={sortConfig} onSort={handleSort} />
                  <Th label="Exit Reason" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{t.entry_time?.split(' ')[0]}</span>
                        <span className="text-xs text-gray-500 dark:text-muted-foreground">{t.entry_time?.split(' ')[1]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sidebar-primary/10 flex items-center justify-center text-[10px] font-bold text-sidebar-primary border border-sidebar-primary/20">
                          {t.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{t.symbol}</p>
                          <p className="text-[10px] text-gray-500 dark:text-muted-foreground uppercase">{t.sector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${t.direction === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm text-gray-500 dark:text-muted-foreground">{t.quantity}</td>
                    <td className="px-4 py-2.5 font-mono text-sm text-gray-900 dark:text-white">₹{t.entry_price}</td>
                    <td className="px-4 py-2.5 font-mono text-sm text-gray-900 dark:text-white">₹{t.exit_price}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {t.is_win ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                        <span className={`font-mono text-sm font-bold ${t.is_win ? 'text-green-500' : 'text-red-500'}`}>
                          {t.is_win ? '+' : ''}₹{t.pnl}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} /> {t.holding_time > 60 ? `${(t.holding_time / 60).toFixed(1)}h` : `${t.holding_time}m`}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-gray-500 dark:text-muted-foreground">
                       <span className="bg-white/5 border border-white/10 px-2 py-1 rounded uppercase font-black tracking-widest">{t.exit_reason || 'Manual'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── PAGINATION ─── */}
        {!loading && total > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-muted-foreground">
              Showing <span className="text-gray-900 dark:text-white font-medium">{(page - 1) * limit + 1}</span> to <span className="text-gray-900 dark:text-white font-medium">{Math.min(page * limit, total)}</span> of <span className="text-gray-900 dark:text-white font-medium">{total}</span> trades
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-sidebar-accent/20 text-gray-900 dark:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // simple pagination logic for demonstration
                  let pNum = i + 1;
                  if (totalPages > 5 && page > 3) pNum = page - 2 + i;
                  if (pNum > totalPages) return null;
                  
                  return (
                    <button 
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center font-medium transition-colors ${page === pNum ? 'bg-sidebar-primary text-black' : 'hover:bg-sidebar-accent/20 text-gray-500 dark:text-muted-foreground'}`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md hover:bg-sidebar-accent/20 text-gray-900 dark:text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


// Optional Sortable Th
function Th({ label, sortKey, currentSort, onSort }: { label: string, sortKey?: string, currentSort?: any, onSort?: (key: string) => void }) {
  if (!sortKey || !onSort) {
    return <th className="px-6 py-4">{label}</th>;
  }
  
  const isSorted = currentSort?.key === sortKey;
  const isAsc = isSorted && currentSort?.order === 'asc';

  return (
    <th 
      className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:bg-white/5 transition-all select-none group"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="flex flex-col opacity-30 group-hover:opacity-100 transition-opacity">
           {isSorted ? (
             isAsc ? <ChevronLeft size={10} className="rotate-90 text-sidebar-primary opacity-100" /> : <ChevronRight size={10} className="rotate-90 text-sidebar-primary opacity-100" />
           ) : (
             <Filter size={10} />
           )}
        </div>
      </div>
    </th>
  );
}


function SummaryCard({ icon, label, value, subtitle, color = "text-gray-900 dark:text-white", isCurrency, isPositive }: any) {
  return (
    <div className="group relative bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl hover:border-gray-300 dark:hover:border-primary/50 transition-all duration-500 hover:shadow-xl dark:hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.3)] shadow-sm dark:shadow-none p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-sidebar-primary/5 rounded-full blur-2xl group-hover:bg-sidebar-primary/10 transition-colors" />
      <div className={`w-8 h-8 rounded-xl bg-sidebar-accent/20 flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-muted-foreground font-bold mb-1">{label}</p>
      <div className="flex items-end gap-1 mb-1">
         {isCurrency && <span className={`text-lg font-bold font-mono ${color}`}>{isPositive ? '+' : '-'}</span>}
         <p className={`text-3xl font-black font-mono tracking-tight ${color}`}>{value}</p>
      </div>
      <p className="text-xs text-gray-500 dark:text-muted-foreground">{subtitle}</p>
    </div>
  );
}