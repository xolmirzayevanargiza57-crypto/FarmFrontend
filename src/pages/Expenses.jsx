import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Receipt, Filter, Calendar, DollarSign, Briefcase, Activity, Tag, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';

const categoryConfig = { 
  feed: { label: 'Yem', color: '#10b981' }, 
  medicine: { label: 'Dori/Vaksina', color: '#f43f5e' }, 
  equipment: { label: 'Jihozlar', color: '#6366f1' }, 
  labor: { label: 'Ish haqi', color: '#f59e0b' },
  utilities: { label: 'Kommunal', color: '#0ea5e9' },
  other: { label: 'Boshqa', color: '#8b5cf6' }
};

const emptyRecord = { date: '', category: 'feed', amount: '', description: '', supplier: '', receiptImage: '' };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/expenses`);
      setRecords(res.data);
    } catch { toast.error("Ma'lumot yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    (r.description || '').toLowerCase().includes(search.toLowerCase()) &&
    (categoryFilter ? r.category === categoryFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/api/expenses/${editing}`, form);
        toast.success("Xarajat yangilandi");
      } else {
        await axios.post(`${API}/api/expenses`, form);
        toast.success("Yangi xarajat qo'shildi");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/expenses/${id}`); toast.success("Yozuv o'chirildi"); setDeleteOpen(null); fetchData(); } 
    catch { toast.error("O'chirishda xatolik"); }
  };

  // Chart Data Preparation
  const chartData = Object.entries(categoryConfig).map(([key, value]) => {
    const total = records.filter(r => r.category === key).reduce((sum, r) => sum + (r.amount || 0), 0);
    return { name: value.label, total, color: value.color };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      <div className="animate-spin h-14 w-14 border-4 border-rose-500 border-t-transparent rounded-full shadow-lg shadow-rose-500/20"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            Ferma <span className="text-rose-500">Xarajatlari</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Barcha chiqimlar ro'yxati</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-rose-600/20 active:scale-95">
          <Plus size={18} /> Xarajat Qo'shish
        </button>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-[2rem] border border-rose-500/20 bg-rose-500/10 flex items-center gap-4 shadow-lg group hover:-translate-y-1 transition-transform`}>
           <div className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-900/50 flex items-center justify-center text-rose-400 border border-white/5`}>
             <DollarSign size={26} strokeWidth={2.5}/>
           </div>
           <div>
             <p className={`text-3xl font-black text-rose-400 tracking-tighter leading-none mb-1`}>{filtered.reduce((s,r)=>s+(r.amount||0),0).toLocaleString()} so'm</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jami Xarajat (Joriy royxat)</p>
           </div>
        </div>
        <div className={`p-6 rounded-[2rem] border border-slate-700/50 bg-slate-900 flex items-center gap-4 shadow-lg group hover:-translate-y-1 transition-transform`}>
           <div className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5`}>
             <Receipt size={26} strokeWidth={2.5}/>
           </div>
           <div>
             <p className={`text-3xl font-black text-white tracking-tighter leading-none mb-1`}>{filtered.length}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Xarajatlar Soni</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={20} className="group-focus-within:text-rose-500 transition-colors" />
              </div>
              <input 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Tavsif bo'yicha qidirish..." 
                className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-200 font-bold placeholder:text-slate-600"
              />
            </div>
            <div className="relative min-w-[200px] sm:w-64">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                <Filter size={20} />
              </div>
              <select 
                value={categoryFilter} 
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} 
                className="w-full pl-14 pr-10 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-300 appearance-none cursor-pointer"
              >
                <option value="">Barcha Kategoriyalar</option>
                {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Modern Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                    <th className="px-6 py-5 text-white font-black uppercase tracking-[0.2em] text-[10px]"><div className="flex items-center gap-2"><Tag size={14}/> Kategoriya</div></th>
                    <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Briefcase size={14}/> Tavsif</div></th>
                    <th className="px-6 py-5 text-rose-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><DollarSign size={14}/> Summa (So'm)</div></th>
                    <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ma'lumot topilmadi</p>
                      </td>
                    </tr>
                  ) : paginated.map((r) => {
                    const cConfig = categoryConfig[r.category] || categoryConfig.other;
                    return (
                      <tr key={r._id} className="group hover:bg-slate-800/30 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{r.date?.slice(0, 10)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700`} style={{ backgroundColor: `${cConfig.color}15` }}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: cConfig.color }}>{cConfig.label}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-200 font-bold text-sm">{r.description}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-black text-rose-400 font-mono tracking-tighter drop-shadow-sm">{(r.amount || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 pr-2">
                            <button onClick={() => openEdit(r)} className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => setDeleteOpen(r._id)} className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/20">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {filtered.length > 0 ? (page - 1) * perPage + 1 : 0} – {Math.min(page * perPage, filtered.length)} / {filtered.length}
              </p>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-rose-500 transition-colors disabled:opacity-50 text-sm">Orqaga</button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${page === i + 1 ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-rose-500 transition-colors disabled:opacity-50 text-sm">Oldinga</button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2"><BarChart3 size={20} className="text-rose-500"/> Kategoriya Kesimida</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Barcha tahlillar</p>
            
            {chartData.length > 0 ? (
              <div className="flex-1 w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 'bold' }} width={90} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(244, 63, 94, 0.1)' }}
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', color: '#f8fafc', fontWeight: 'bold' }}
                      formatter={(v) => `${v.toLocaleString()} so'm`}
                    />
                    <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 min-h-[350px]">
                <Activity size={48} className="mb-4 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">Ma'lumot kam</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center border border-rose-500/30">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{editing ? 'Xarajatni Tahrirlash' : 'Yangi Xarajat'}</h3>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mt-1">Chiqim Operatsiyasi</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 text-white font-mono transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategoriya</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 text-slate-200 font-bold transition-colors">
                    {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maqsad / Tavsif</label>
                  <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Nima uchun xarajat qilindi?" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 text-white font-bold transition-colors" />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Summa (So'm)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-rose-400 font-black text-xl transition-colors" />
                </div>

              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" disabled={saving} className="w-full px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50">
                  {saving ? 'Saqlanmoqda...' : (editing ? 'Yangilash' : 'Saqlash')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteOpen(null)}>
          <div className="bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full text-center border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20 shadow-inner"><Trash2 size={32}/></div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">O'chirish?</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">Ushbu chiqimni abadiyga o'chirasizmi?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-4 border border-slate-700 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all">Ha, o'chir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
