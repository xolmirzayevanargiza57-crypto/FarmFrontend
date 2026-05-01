import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bird, Egg, TrendingUp, TrendingDown, DollarSign, Bot, RefreshCw, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';
const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

const categoryNames = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const fetchStats = async () => {
    try { const res = await axios.get(`${API}/api/dashboard/stats`); setStats(res.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAIAdvice = async () => {
    setAiLoading(true); setAiError(null);
    try { const res = await axios.get(`${API}/api/ai/advice`); setAiAdvice(res.data); }
    catch (err) { setAiError('AI maslahat olishda xatolik yuz berdi'); } finally { setAiLoading(false); }
  };

  useEffect(() => {
    fetchStats(); fetchAIAdvice();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="animate-spin h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full shadow-lg shadow-indigo-500/20"></div></div>;

  const s = stats?.summary || {};
  const eggData = (stats?.charts?.eggProduction || []).map(e => ({ sana: e._id?.slice(5), tuxum: e.total }));
  const expCat = (stats?.charts?.expensesByCategory || []).map(e => ({ name: categoryNames[e._id] || e._id, value: e.total }));

  const cards = [
    { label: 'Jami tovuqlar', value: s.totalBirds?.toLocaleString(), icon: Bird, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'Bugungi tuxum', value: s.todayEggs?.toLocaleString(), icon: Egg, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Oylik daromad', value: `${(s.monthlyRevenue || 0).toLocaleString()} so'm`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Oylik xarajat', value: `${(s.monthlyExpenses || 0).toLocaleString()} so'm`, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
    { label: 'Foyda / Zarar', value: `${(s.profit || 0).toLocaleString()} so'm`, icon: DollarSign, color: s.profit >= 0 ? 'text-emerald-400' : 'text-rose-400', bg: s.profit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10', border: s.profit >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20' },
  ];

  const renderAdvice = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-black text-indigo-300 mt-4 mb-2 uppercase tracking-wide text-xs">{line.replace(/\*\*/g, '')}</p>;
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} className="text-slate-300 leading-relaxed mb-1">{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part)}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="text-slate-300 pl-4 leading-relaxed mb-1 flex gap-2 items-start"><span className="text-indigo-400">•</span> {line.slice(2)}</p>;
      if (line.trim() === '') return <div key={i} className="h-2"></div>;
      return <p key={i} className="text-slate-300 leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="space-y-8 lg:ml-0 ml-10 p-2 italic font-bold">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-1">BOSH <span className="text-indigo-400">SAHIFA</span></h1>
          <p className="text-slate-400 text-sm font-medium">Fermaning umumiy holati va tahlili</p>
        </div>
      </div>

      {/* Modern Glassmorphic Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`rounded-3xl p-6 ${c.bg} border ${c.border} backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
            {/* Ambient glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 ${c.bg} blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform`}></div>
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${c.bg} flex items-center justify-center ${c.color} shadow-inner`}>
                  <c.icon size={24} />
                </div>
                <span className="text-[10px] bg-slate-800/50 text-slate-300 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">{i === 0 ? 'ta' : s.profit >= 0 && i === 4 ? 'Foyda' : ''}</span>
              </div>
              <div>
                <p className={`text-2xl lg:text-3xl font-black ${c.color} font-mono tracking-tighter shadow-black drop-shadow-sm`}>{c.value}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Advice Panel - Premium Dark */}
      <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] p-8 lg:p-10 border border-slate-700/50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30%] h-[80%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:items-start">
          <div className="lg:w-1/3 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                <Sparkles size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">AI Fermer</h3>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Aql-idrok bilan tahlil</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">Ushbu assistent fermaning ishlab chiqarish, o'lim darajasi va xarajatlarini analiz qilib kunlik faoliyat uchun maslahat beradi.</p>
            <button onClick={fetchAIAdvice} disabled={aiLoading} className="w-full xl:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50">
              <RefreshCw size={18} className={aiLoading ? 'animate-spin' : ''} /> {aiLoading ? 'Tahlil ketmoqda...' : 'Maslahatni Yangilash'}
            </button>
          </div>

          <div className="lg:w-2/3 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
            {aiLoading && !aiAdvice ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
                <div className="relative">
                  <div className="animate-spin h-16 w-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"></div>
                  <Bot size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" />
                </div>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs animate-pulse">Ma'lumotlar miyada qayta ishlanmoqda...</p>
              </div>
            ) : aiError ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 text-rose-400 font-bold text-center">
                {aiError}
              </div>
            ) : aiAdvice ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
                  {renderAdvice(aiAdvice.advice)}
                </div>
                <p className="text-[10px] text-slate-500 text-right uppercase tracking-[0.2em] font-black">
                  Oxirgi marta: {new Date(aiAdvice.generatedAt).toLocaleString('uz-UZ')}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {/* Egg Chart */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><TrendingUp size={20}/></div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Oylik tuxum indeksi</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={eggData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="sana" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{stroke: '#334155', strokeWidth: 1}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold'}} />
              <Line type="monotone" dataKey="tuxum" stroke="#10b981" strokeWidth={4} dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses Pie */}
        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center"><DollarSign size={20}/></div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter">Xarajatlar kesimi</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} stroke="#0f172a" strokeWidth={4} paddingAngle={2}>
                {expCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold'}} formatter={(v) => `${v.toLocaleString()} so'm`} />
              <Legend formatter={(value) => <span className="text-xs font-bold text-slate-300 uppercase">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
