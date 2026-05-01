import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bird, Egg, TrendingUp, TrendingDown, DollarSign, Bot, RefreshCw, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';

const COLORS = ['#2d6a4f', '#d4a373', '#e63946', '#457b9d', '#f4a261', '#264653'];

const categoryNames = {
  feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar',
  labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa'
};

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAdvice = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await axios.get(`${API}/api/ai/advice`);
      setAiAdvice(res.data);
    } catch (err) {
      console.error(err);
      setAiError('AI maslahat olishda xatolik yuz berdi');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAIAdvice();
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div>
    </div>
  );

  const s = stats?.summary || {};
  const eggData = (stats?.charts?.eggProduction || []).map(e => ({ sana: e._id?.slice(5), tuxum: e.total }));
  const expCat = (stats?.charts?.expensesByCategory || []).map(e => ({ name: categoryNames[e._id] || e._id, value: e.total }));

  const cards = [
    { label: 'Jami tovuqlar', value: s.totalBirds?.toLocaleString(), icon: Bird, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
    { label: 'Bugungi tuxum', value: s.todayEggs?.toLocaleString(), icon: Egg, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Oylik daromad', value: `${(s.monthlyRevenue || 0).toLocaleString()} so'm`, icon: TrendingUp, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
    { label: 'Oylik xarajat', value: `${(s.monthlyExpenses || 0).toLocaleString()} so'm`, icon: TrendingDown, color: 'from-red-500 to-pink-500', shadow: 'shadow-red-500/20' },
    { label: 'Foyda / Zarar', value: `${(s.profit || 0).toLocaleString()} so'm`, icon: DollarSign, color: s.profit >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-600 to-red-700', shadow: s.profit >= 0 ? 'shadow-emerald-500/20' : 'shadow-red-500/20' },
  ];

  // Format AI text with basic markdown-like rendering
  const renderAdvice = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-gray-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-gray-700 leading-relaxed">
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-gray-900">{part}</strong> : part)}
          </p>
        );
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <p key={i} className="text-gray-700 pl-4 leading-relaxed">• {line.slice(2)}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-gray-700 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="space-y-6 lg:ml-0 ml-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Bosh sahifa</h1>
        <p className="text-gray-500 text-sm">Ferma boshqaruv paneli</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-xl ${c.shadow} hover:scale-[1.02] transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <c.icon size={28} className="opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{i === 0 ? 'ta' : ''}</span>
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm opacity-80 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* AI Advice Panel */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 shadow-xl border border-white/5 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Bot size={20} className="text-emerald-400" />
                  AI Ferma Maslahatchisi
                </h3>
                <p className="text-xs text-gray-400">Real ma'lumotlar asosida tahlil va maslahatlar</p>
              </div>
            </div>
            <button
              onClick={fetchAIAdvice}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition border border-white/10 disabled:opacity-50"
            >
              <RefreshCw size={16} className={aiLoading ? 'animate-spin' : ''} />
              {aiLoading ? 'Tahlil qilinmoqda...' : 'Yangilash'}
            </button>
          </div>

          {aiLoading && !aiAdvice && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <div className="animate-spin h-16 w-16 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full"></div>
                <Bot size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400" />
              </div>
              <p className="mt-4 text-gray-400 text-sm animate-pulse">AI ferma ma'lumotlarini tahlil qilmoqda...</p>
            </div>
          )}

          {aiError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
              {aiError}
            </div>
          )}

          {aiAdvice && (
            <div className="space-y-4">
              {/* Mini summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-gray-400">Faol podalar</p>
                  <p className="text-lg font-bold text-emerald-400">{aiAdvice.farmSummary?.activeFlocks}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-gray-400">7 kunlik tuxum</p>
                  <p className="text-lg font-bold text-amber-400">{aiAdvice.farmSummary?.eggs7d?.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-gray-400">Oylik foyda</p>
                  <p className={`text-lg font-bold ${(aiAdvice.farmSummary?.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(aiAdvice.farmSummary?.profit || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-xs text-gray-400">O'lim holatlari</p>
                  <p className={`text-lg font-bold ${(aiAdvice.farmSummary?.mortalityCount || 0) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{aiAdvice.farmSummary?.mortalityCount || 0}</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="bg-white/5 rounded-xl p-5 border border-white/10 max-h-[400px] overflow-y-auto prose-invert">
                <div className="space-y-1 text-sm">
                  {renderAdvice(aiAdvice.advice)}
                </div>
              </div>

              <p className="text-xs text-gray-500 text-right">
                Oxirgi yangilanish: {new Date(aiAdvice.generatedAt).toLocaleString('uz-UZ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Egg Production Line Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">So'nggi 30 kunlik tuxum ishlab chiqarish</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eggData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="sana" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tuxum" stroke="#2d6a4f" strokeWidth={2.5} dot={{ fill: '#2d6a4f', r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Xarajatlar kategoriyasi bo'yicha</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expCat} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {expCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${v.toLocaleString()} so'm`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue vs Expenses Bar Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daromad va xarajatlar taqqoslash</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ name: 'Shu oy', daromad: s.monthlyRevenue || 0, xarajat: s.monthlyExpenses || 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => `${v.toLocaleString()} so'm`} />
            <Legend />
            <Bar dataKey="daromad" fill="#2d6a4f" radius={[8, 8, 0, 0]} />
            <Bar dataKey="xarajat" fill="#e63946" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
