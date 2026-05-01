import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Printer, Calendar, TrendingUp, TrendingDown, DollarSign, Egg, Bird, Receipt, PieChart, BarChart3, ChevronRight, Share2, Download, Filter } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [eggs, setEggs] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, e, eg, f] = await Promise.all([
        axios.get(`${API}/api/sales`),
        axios.get(`${API}/api/expenses`),
        axios.get(`${API}/api/eggs`),
        axios.get(`${API}/api/flocks`)
      ]);
      setSales(s.data); setExpenses(e.data); setEggs(eg.data); setFlocks(f.data);
    } catch { toast.error('Ma\'lumot yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const inRange = (d) => {
    const date = new Date(d);
    return date >= new Date(dateFrom) && date <= new Date(dateTo + 'T23:59:59');
  };

  const filteredSales = sales.filter(s => inRange(s.date));
  const filteredExpenses = expenses.filter(e => inRange(e.date));
  const filteredEggs = eggs.filter(e => inRange(e.date));

  const totalRevenue = filteredSales.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalExpense = filteredExpenses.reduce((s, r) => s + (r.amount || 0), 0);
  const profit = totalRevenue - totalExpense;

  const totalEggs = filteredEggs.reduce((s, e) => s + (e.eggsCollected || 0), 0);
  const totalBroken = filteredEggs.reduce((s, e) => s + (e.brokenEggs || 0), 0);
  const eggEfficiency = totalEggs > 0 ? (((totalEggs - totalBroken) / totalEggs) * 100).toFixed(1) : 0;

  const activeFlocks = flocks.filter(f => f.status === 'active');
  const totalBirds = activeFlocks.reduce((s, f) => s + (f.quantity || 0), 0);

  const expenseBreakdown = filteredExpenses.reduce((acc, e) => {
    const cat = e.category || 'other';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  const catLabels = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };
  const handlePrint = () => window.print();

  if (loading) return <div className="flex flex-col items-center justify-center py-24 gap-3"><div className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p className="text-indigo-700 font-black uppercase text-xs tracking-widest italic animate-pulse">Analitik hisobotlar tayyorlanmoqda...</p></div>;

  return (
    <div className="space-y-8 lg:ml-0 ml-10 p-2 italic font-bold">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full translate-x-12 -translate-y-12 transition-transform group-hover:scale-150 duration-700"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-[1.75rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase leading-none">ANALITIK <span className="text-indigo-600">HISOBOTLAR</span></h1>
            <p className="text-sm font-bold text-gray-400 mt-1">Fermaning moliyaviy va ishlab chiqarish tahlili</p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all active:scale-95"><Share2 size={20}/></button>
          <button onClick={handlePrint} className="flex items-center gap-3 bg-gradient-to-br from-indigo-500 to-blue-700 text-white px-8 py-4.5 rounded-2xl font-black shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 transition-all uppercase text-sm tracking-tighter print:hidden">
            <Printer size={20} /> Chop Etish (PDF)
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 print:hidden relative group">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black"><Filter size={20}/></div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Davr starti:</span>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all text-xs font-black font-mono shadow-inner" />
        </div>
        <div className="w-4 h-0.5 bg-gray-100"></div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Davr yakuni:</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all text-xs font-black font-mono shadow-inner" />
        </div>
      </div>

      {/* Main P&L Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden group">
          <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><DollarSign size={20}/></div>
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic">Foyda / Zarar hisoboti</h3>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">G'alaba va mag'lubiyat</p>
          </div>
          <div className="p-10 space-y-6">
            <div className="flex items-center justify-between group/row p-4 rounded-3xl hover:bg-emerald-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm"><TrendingUp size={24}/></div>
                <div><p className="text-sm font-black text-gray-800 uppercase tracking-tighter">Jami Daromad</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Barcha savdolar yig'indisi</p></div>
              </div>
              <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">{totalRevenue.toLocaleString()} so'm</p>
            </div>
            <div className="flex items-center justify-between group/row p-4 rounded-3xl hover:bg-rose-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm"><TrendingDown size={24}/></div>
                <div><p className="text-sm font-black text-gray-800 uppercase tracking-tighter">Jami Xarajat</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Barcha operatsion xarajatlar</p></div>
              </div>
              <p className="text-2xl font-black text-rose-600 font-mono tracking-tighter">-{totalExpense.toLocaleString()} so'm</p>
            </div>
            <div className="h-px bg-gray-100 mx-4"></div>
            <div className={`flex items-center justify-between p-8 rounded-[2.5rem] border-2 transition-all ${profit >= 0 ? 'bg-emerald-600 text-white border-emerald-400 shadow-2xl shadow-emerald-500/30' : 'bg-rose-600 text-white border-rose-400 shadow-2xl shadow-rose-500/30'}`}>
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner"><DollarSign size={28}/></div>
                <div><h4 className="text-2xl font-black uppercase tracking-tighter italic leading-none mb-1">SOF FOYDA</h4><p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Sizning sof cho'ntagingiz</p></div>
              </div>
              <p className="text-4xl font-black font-mono tracking-tighter">{profit >= 0 ? '+' : ''}{profit.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden flex flex-col italic font-bold">
          <div className="px-8 py-8 border-b border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600"><PieChart size={20}/></div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tighter text-nowrap">Xarajatlar tarkibi</h3>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between italic">
            <div className="space-y-4">
              {Object.entries(expenseBreakdown).map(([cat, amount], i) => (
                <div key={cat} className="space-y-2 group">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-1">
                    <span className="text-gray-400 flex items-center gap-2 italic">{catLabels[cat] || cat} <ChevronRight size={10}/></span>
                    <span className="text-gray-800 font-mono italic">{amount.toLocaleString()} so'm</span>
                  </div>
                  <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                    <div className="h-full bg-indigo-500 rounded-full transition-all group-hover:bg-indigo-600 shadow-sm" style={{width: `${totalExpense > 0 ? (amount / totalExpense) * 100 : 0}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between italic">
               <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Umumiy tarkib:</p>
               <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black shadow-inner italic">{Object.keys(expenseBreakdown).length}ta kategoriya</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production & Efficiency Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Jami Tuxum", value: totalEggs.toLocaleString(), icon: Egg, color: 'text-amber-600', bg: 'bg-amber-50', unit: ' dona' },
          { label: "Samaradorlik", value: eggEfficiency + "%", icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', unit: '' },
          { label: "Faol Podalar", value: activeFlocks.length, icon: LayoutGrid, color: 'text-indigo-600', bg: 'bg-indigo-50', unit: ' ta' },
          { label: "Jami Tovuq", value: totalBirds.toLocaleString(), icon: Bird, color: 'text-emerald-700', bg: 'bg-emerald-100', unit: ' ta' }
        ].map((s,i)=>(
          <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-gray-200/30 border border-gray-50 flex items-center gap-5 group hover:-translate-y-2 transition-all">
            <div className={`w-16 h-16 rounded-3xl ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:rotate-12 shadow-sm italic`}><s.icon size={32} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} font-mono tracking-tighter italic`}>{s.value}<span className="text-xs opacity-50 font-sans tracking-normal font-bold uppercase">{s.unit}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Activity */}
        <div className="bg-[#1a1a2e] text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group font-bold italic">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-x-24 -translate-y-24"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400"><TrendingUp size={24}/></div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Savdo faolligi</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Savdolar soni:</p>
                <p className="text-3xl font-black font-mono tracking-tighter uppercase text-nowrap">{filteredSales.length} ta operatsiya</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Tugallangan:</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-3xl font-black font-mono tracking-tighter text-nowrap text-emerald-400">{filteredSales.filter(s => s.paymentStatus === 'paid').length} ta</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">To'lov kutilmoqda:</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-3xl font-black font-mono tracking-tighter text-nowrap text-amber-400">{filteredSales.filter(s => s.paymentStatus === 'pending').length} ta</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">O'rtacha daromad:</p>
                <p className="text-3xl font-black font-mono tracking-tighter text-nowrap text-indigo-400">{filteredSales.length > 0 ? Math.round(totalRevenue / filteredSales.length).toLocaleString() : 0}</p>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-nowrap">
              To'liq savdo jurnali <ChevronRight size={14}/>
            </button>
          </div>
        </div>

        {/* Efficiency High/Low */}
        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl flex flex-col justify-between italic font-bold">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Egg size={24}/></div>
            <h3 className="text-2xl font-black uppercase text-gray-800 tracking-tighter italic">Ishlab chiqarish sifati</h3>
          </div>
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black italic shadow-inner">#1</div>
                <div><p className="text-lg font-black text-gray-800 tracking-tighter uppercase leading-none">STANDART TUXUM</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sifat darajasi: Grade A</p></div>
              </div>
              <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter italic">{totalEggs - totalBroken} dona</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black italic shadow-inner">#2</div>
                <div><p className="text-lg font-black text-gray-800 tracking-tighter uppercase leading-none">NODIFAKT TUXUM</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sifat darajasi: Singan/Yaroqsiz</p></div>
              </div>
              <p className="text-2xl font-black text-rose-500 font-mono tracking-tighter italic">{totalBroken} dona</p>
            </div>
            <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 mt-4 italic font-bold">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-amber-600" size={16}/>
                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Eslatma</h4>
              </div>
              <p className="text-xs text-amber-700/80 leading-relaxed font-bold italic uppercase tracking-tighter">Singan tuxumlar soni jami ishlab chiqarishning <span className="font-black text-amber-900">{(totalEggs > 0 ? (totalBroken / totalEggs) * 100 : 0).toFixed(1)}%</span> ini tashkil qilmoqda. Me'yoriy holat: 2% dan past bo'lishi tavsiya etiladi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertTriangle({size, className}) { return <div style={{width:size, height:size}} className={`border-2 border-current rounded-full flex items-center justify-center font-bold text-[10px] leading-none ${className}`}>!</div>; }
