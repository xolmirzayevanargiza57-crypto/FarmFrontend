import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Printer, CalendarDays, TrendingUp, TrendingDown, Egg, Bird, DollarSign, ArrowRight, RefreshCw } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10)
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange;
      const res = await axios.get(`${API}/api/reports?startDate=${startDate}&endDate=${endDate}`);
      setReport(res.data);
    } catch { 
      toast.error("Hisobot yuklashda xatolik yuz berdi"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden on Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            Ferma <span className="text-indigo-500">Hisobotlari</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Asosiy ko'rsatkichlarni tahlil qilish</p>
        </div>
      </div>

      {/* Filter Bar (Hidden on Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-end gap-6">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={14}/> Boshlanish sanasi</label>
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={e => setDateRange({...dateRange, startDate: e.target.value})} 
              className="w-full px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-mono transition-colors shadow-inner"
            />
          </div>
          <div className="flex items-center justify-center pt-2 sm:pt-0">
             <ArrowRight size={20} className="text-slate-600 hidden sm:block mt-6" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CalendarDays size={14}/> Tugash sanasi</label>
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={e => setDateRange({...dateRange, endDate: e.target.value})} 
              className="w-full px-5 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-mono transition-colors shadow-inner"
            />
          </div>
          <div className="flex gap-3 pt-6 sm:pt-0">
            <button 
              onClick={fetchReport} 
              disabled={loading}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={18}/> : 'Yangilash'}
            </button>
            <button 
              onClick={handlePrint} 
              className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 min-h-[40vh]">
          <div className="animate-spin h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full shadow-lg shadow-indigo-500/20"></div>
        </div>
      ) : report ? (
        <div className="print-content space-y-6 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Print Only Header */}
          <div className="hidden print:block text-center mb-10 text-black">
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Parrandachilik Fermasi Hisoboti</h1>
            <p className="text-sm font-mono text-gray-600">Davr: {dateRange.startDate} dan {dateRange.endDate} gacha</p>
            <div className="w-full h-px bg-black my-4"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden print:bg-white print:border-gray-200">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none print:hidden"></div>
              
              <h3 className="text-xl font-black text-white print:text-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <DollarSign className="text-emerald-500"/> Moliyaviy Holat
              </h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 print:bg-gray-50 print:border-gray-200">
                  <div>
                     <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Jami Daromad (Savdo)</p>
                     <p className="text-3xl font-black text-emerald-400 font-mono print:text-green-700">{report.totalRevenue.toLocaleString()} so'm</p>
                  </div>
                  <TrendingUp size={32} className="text-emerald-500/40" />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 print:bg-gray-50 print:border-gray-200">
                  <div>
                     <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Jami Xarajatlar (Chiqim)</p>
                     <p className="text-3xl font-black text-rose-400 font-mono print:text-red-700">{report.totalExpenses.toLocaleString()} so'm</p>
                  </div>
                  <TrendingDown size={32} className="text-rose-500/40" />
                </div>

                <div className="w-full h-px bg-slate-800 print:bg-gray-300 my-2"></div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400 print:text-gray-600 uppercase tracking-widest">Sof Foyda (Zarar):</span>
                  <span className={`text-4xl font-black font-mono tracking-tighter ${report.profit >= 0 ? 'text-white print:text-green-800' : 'text-rose-500 print:text-red-800'}`}>
                    {report.profit >= 0 ? '+' : ''}{report.profit.toLocaleString()} so'm
                  </span>
                </div>
              </div>
            </div>

            {/* Production Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden print:bg-white print:border-gray-200">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none print:hidden"></div>
              
              <h3 className="text-xl font-black text-white print:text-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <Egg className="text-amber-500"/> Ishlab Chiqarish
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center print:bg-gray-200 print:text-black"><Egg size={20}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 print:text-gray-500 uppercase tracking-widest">Yig'ilgan Tuxumlar</p>
                      <p className="text-white print:text-black font-black text-xl font-mono">{report.totalEggs.toLocaleString()} ta</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Singan / Brak</p>
                    <p className="text-rose-400 font-bold font-mono">{report.totalBrokenEggs.toLocaleString()} ta</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center print:bg-gray-200 print:text-black"><TrendingUp size={20}/></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 print:text-gray-500 uppercase tracking-widest">Sifat (Grade A)</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-black font-mono text-xl">{((report.totalEggs - report.totalBrokenEggs) / (report.totalEggs || 1) * 100).toFixed(1)}%</span>
                </div>

                <div className="w-full h-px bg-slate-800 print:bg-gray-300 my-2"></div>

                <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Sog'liq ko'rsatkichi</p>
                   <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 print:bg-gray-50 print:border-gray-200">
                     <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
                       <Bird size={16}/> O'lim soni
                     </div>
                     <span className="text-white print:text-black font-black font-mono text-xl">{report.totalMortality} ta</span>
                   </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="text-center pt-8 text-xs font-bold text-slate-500 uppercase tracking-widest print:text-black">
            Hisobot tizim orqali avtomatik generatsiya qilindi | {new Date().toLocaleString()}
          </div>
        </div>
      ) : null}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; color: black !important; }
        }
      `}</style>
    </div>
  );
}
