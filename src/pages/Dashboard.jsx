import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bird, Egg, TrendingUp, TrendingDown, DollarSign, Bot, RefreshCw, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';
const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const categoryNames = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const fetchStats = async () => {
    try { 
      const res = await axios.get(`${API}/api/dashboard/stats`); 
      setStats(res.data); 
    }
    catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchAIAdvice = async () => {
    setAiLoading(true); setAiError(null);
    try { 
      const res = await axios.get(`${API}/api/ai/advice`); 
      setAiAdvice(res.data); 
    }
    catch (err) { setAiError('AI tahlilida xatolik yuz berdi. Iltimos API kalitni tekshiring.'); } 
    finally { setAiLoading(false); }
  };

  useEffect(() => {
    fetchStats(); fetchAIAdvice();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="animate-spin h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full shadow-lg shadow-indigo-500/20"></div>
    </div>
  );

  const s = stats?.summary || {};
  const eggData = (stats?.charts?.eggProduction || []).map(e => ({ sana: e._id?.slice(5), tuxum: e.total }));
  const expCat = (stats?.charts?.expensesByCategory || []).map(e => ({ name: categoryNames[e._id] || e._id, value: e.total }));

  const cards = [
    { label: 'Jami tovuqlar', value: s.totalBirds?.toLocaleString() || '0', icon: Bird, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Bugungi tuxum', value: s.todayEggs?.toLocaleString() || '0', icon: Egg, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Oylik daromad', value: `${(s.monthlyRevenue || 0).toLocaleString()} so'm`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Oylik xarajat', value: `${(s.monthlyExpenses || 0).toLocaleString()} so'm`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { label: 'Foyda / Zarar', value: `${(s.profit || 0).toLocaleString()} so'm`, icon: DollarSign, color: s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: s.profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10', border: s.profit >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20' },
  ];

  const renderAdvice = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-black text-indigo-300 mt-5 mb-2 uppercase tracking-widest text-xs">{line.replace(/\*\*/g, '')}</p>;
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className="text-slate-300 leading-relaxed mb-2 text-sm">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-black">{part}</strong> : part)}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="text-slate-300 pl-4 leading-relaxed mb-2 text-sm flex gap-3 items-start"><span className="text-indigo-500 mt-1"><Activity size={14} /></span> {line.slice(2)}</p>;
      if (line.trim() === '') return <div key={i} className="h-2"></div>;
      return <p key={i} className="text-slate-300 leading-relaxed mb-2 text-sm">{line}</p>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase mb-1">Bosh <span className="text-indigo-500">Sahifa</span></h1>
          <p className="text-slate-400 font-medium tracking-wide">Fermaning umumiy holati va tahlili</p>
        </div>
      </div>

      {/* Modern Stats Cards Grid - Highly Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-3xl p-6 ${c.bg} border ${c.border} backdrop-blur-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
            {/* Geometric glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${c.bg} blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10 flex gap-4 items-start sm:flex-col sm:items-stretch sm:gap-6">
              <div className={`w-14 h-14 shrink-0 rounded-2xl ${c.bg} flex items-center justify-center ${c.color} shadow-inner border border-white/5`}>
                <c.icon size={26} strokeWidth={2.5} />
              </div>
              <div>
                <p className={`text-2xl xl:text-3xl font-black ${c.color} tracking-tighter drop-shadow-sm leading-none`}>{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-[0.2em] font-bold">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Premium AI Advice Panel */}
      <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-6 lg:p-10 border border-slate-700/50 relative overflow-hidden shadow-2xl mt-8">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[120%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row gap-8 xl:gap-12 items-start">
          {/* AI Panel Header & Action */}
          <div className="xl:w-1/3 w-full shrink-0 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner shrink-0">
                <Bot size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">AI Fermer</h3>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> Aql-idrok bilan tahlil</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">Ushbu assistent fermaning ishlab chiqarish, o'lim darajasi va xarajatlarini analiz qilib kunlik faoliyat uchun strategik maslahat beradi.</p>
            <button 
              onClick={fetchAIAdvice} 
              disabled={aiLoading} 
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <RefreshCw size={18} className={aiLoading ? 'animate-spin' : ''} /> {aiLoading ? 'Tahlil qilinmoqda...' : 'Maslahatni Yangilash'}
            </button>
          </div>

          {/* AI Response Area */}
          <div className="w-full xl:w-2/3 bg-slate-950/50 rounded-3xl border border-slate-800 p-6 min-h-[300px] flex flex-col items-center justify-center relative overlow-hidden shadow-inner">
            {aiLoading && !aiAdvice ? (
              <div className="flex flex-col items-center gap-4 py-10 fade-in animate-in">
                <div className="relative flex items-center justify-center">
                  <div className="animate-spin h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
                  <Bot size={24} className="absolute text-indigo-400" />
                </div>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">Ma'lumotlar miyada qayta ishlanmoqda...</p>
              </div>
            ) : aiError ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-10 w-full animate-in fade-in zoom-in-95">
                <AlertCircle size={40} className="text-rose-500 mb-2" />
                <p className="text-white font-bold text-lg">{aiError}</p>
                <p className="text-slate-500 text-sm max-w-md">Orqa fonda Groq API ulanish muammosi mavjud bo'lishi mumkin.</p>
              </div>
            ) : aiAdvice ? (
              <div className="w-full h-full max-h-[400px] overflow-y-auto pr-4 scrollbar-thin animate-in fade-in zoom-in-95">
                <div className="space-y-2">
                  {renderAdvice(aiAdvice.advice)}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                   <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                     <Activity size={10} /> Oxirgi marta: {new Date(aiAdvice.generatedAt).toLocaleString('uz-UZ')}
                   </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 font-medium">Boshlash uchun yangilash tugmasini bosing</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 pb-10">
        {/* Line Chart Component */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 lg:p-8 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20"><TrendingUp size={24}/></div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Oylik Tuxum Indeksi</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest mt-0.5">So'nggi 30 kun grafigi</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={eggData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="sana" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3'}} 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold', padding: '12px'}} 
                  itemStyle={{color: '#10b981'}}
                />
                <Line type="monotone" dataKey="tuxum" stroke="#10b981" strokeWidth={4} dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Component */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-[2rem] p-6 lg:p-8 border border-slate-700/50 shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20"><DollarSign size={24}/></div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Xarajatlar Tahlili</h3>
              <p className="text-xs text-slate-500 font-bold tracking-widest mt-0.5">Kategoriya bo'yicha</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} stroke="#0f172a" strokeWidth={5} paddingAngle={2}>
                  {expCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold'}} 
                  formatter={(v) => `${v.toLocaleString()} so'm`} 
                />
                <Legend formatter={(value) => <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
