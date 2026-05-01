import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Receipt, Hash, LayoutGrid, Calendar, CircleDollarSign, CreditCard, Filter, TrendingDown, AlignLeft, Tags } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';
const catLabels = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };
const payLabels = { cash: 'Naqd', card: 'Karta', transfer: 'O\'tkazma' };
const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6'];

const emptyRecord = { date: '', category: 'feed', description: '', amount: '', paymentMethod: 'cash', notes: '' };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const perPage = 10;

  const fetchData = async () => {
    try { const r = await axios.get(`${API}/api/expenses`); setRecords(r.data); }
    catch { toast.error('Yuklanmadi'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r => (r.description || '').toLowerCase().includes(search.toLowerCase()) && (catFilter ? r.category === catFilter : true));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0);

  // Monthly chart data
  const monthlyData = records.reduce((acc, r) => {
    const m = r.date?.slice(0, 7);
    if (m) { acc[m] = (acc[m] || 0) + r.amount; }
    return acc;
  }, {});
  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/api/expenses/${editing}`, form); toast.success('O\'zgartirildi'); }
      else { await axios.post(`${API}/api/expenses`, form); toast.success('Qo\'shildi'); }
      setModalOpen(false); fetchData();
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/expenses/${id}`); toast.success('O\'chirildi'); setDeleteOpen(null); fetchData(); } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 font-black text-rose-600 gap-2"><div className="animate-spin h-14 w-14 border-4 border-rose-500 border-t-transparent rounded-full shadow-inner"></div><p className="animate-pulse tracking-widest text-[10px] uppercase italic">Xarajatlar tarkibi yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2 italic font-bold">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-7 rounded-[2.5rem] shadow-sm border border-rose-50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-inner group">
            <Receipt size={32} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase leading-none mb-1">XARAJATLAR <span className="text-rose-600">REKORDLARI</span></h1>
            <p className="text-sm font-bold text-gray-400">Jami xarajat: {totalAmount.toLocaleString()} so'm</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-3 bg-gradient-to-br from-rose-500 to-rose-700 text-white px-8 py-4.5 rounded-2xl font-black shadow-xl shadow-rose-500/30 hover:-translate-y-1 active:scale-95 transition-all uppercase text-sm tracking-tighter">
          <Plus size={22} className="stroke-[3]" /> Yangi Xarajat
        </button>
      </div>

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-50 group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2"><TrendingDown size={22} className="text-rose-500"/> Oylik moliyaviy chiqimlar</h3>
            <div className="flex gap-1.5">{COLORS.map((c,i)=>(<div key={i} className="w-2 h-2 rounded-full" style={{backgroundColor:c}}></div>))}</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize:10, fontWeight:900, fill:'#94a3b8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:10, fontWeight:900, fill:'#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius:'1.5rem', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight:900}} formatter={(v)=>`${v.toLocaleString()} so'm`}/>
              <Bar dataKey="amount" radius={[12,12,0,0]} barSize={40}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Xarajat tavsifi bo'yicha tahlil..." 
            className="w-full pl-14 pr-6 py-4.5 border-2 border-gray-100 rounded-[1.75rem] outline-none focus:border-rose-300 focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-700 bg-white font-black"
          />
        </div>
        <div className="relative min-w-[220px]">
          <Tags size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={catFilter} 
            onChange={e => { setCatFilter(e.target.value); setPage(1); }} 
            className="w-full pl-14 pr-12 py-4.5 bg-white border-2 border-gray-100 rounded-[1.75rem] outline-none font-black text-gray-600 appearance-none cursor-pointer focus:border-rose-300 transition-all shadow-sm uppercase italic"
          >
            <option value="">Barcha turlar</option>
            {Object.keys(catLabels).map(k => <option key={k} value={k}>{catLabels[k]}</option>)}
          </select>
        </div>
      </div>

      {/* Excel Style Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-6 text-gray-400 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-8 py-6 text-gray-800 font-black uppercase tracking-widest text-xs"><div className="flex items-center gap-2"><Tags size={14}/> Kategoriya</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><AlignLeft size={14}/> Tavsif</div></th>
                <th className="px-8 py-6 text-rose-600 font-black uppercase tracking-wider text-xs text-right"><div className="flex items-center justify-end gap-2"><CircleDollarSign size={14}/> Summa</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><CreditCard size={14}/> To'lov usuli</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`group hover:bg-rose-50/20 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/5'}`}>
                  <td className="px-8 py-6 text-nowrap">
                    <span className="font-mono text-xs font-black text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-gray-100 text-gray-600 border border-gray-200 group-hover:bg-rose-100 group-hover:text-rose-700 transition-colors`}>
                      {catLabels[r.category] || r.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 max-w-[200px]">
                    <p className="text-gray-700 text-xs font-bold leading-relaxed line-clamp-2 italic uppercase tracking-tighter">{r.description}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-xl font-black text-rose-600 font-mono tracking-tighter">-{r.amount?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-black">so'm</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-xl shadow-inner text-[10px] font-black text-gray-500 uppercase">
                      <CreditCard size={12} /> {payLabels[r.paymentMethod] || r.paymentMethod}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <button onClick={() => openEdit(r)} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white shadow-sm transition-all"><Pencil size={20} /></button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white shadow-sm transition-all"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-7 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-3 bg-white rounded-[2rem] border border-gray-200 shadow-sm italic">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} CHIQIM REKORDLARI
          </p>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-rose-600 transition-all">Oldingi</button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-11 h-11 rounded-2xl font-black text-sm transition-all ${page === i+1 ? 'bg-rose-600 text-white shadow-2xl shadow-rose-600/30' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-100'}`}>{i+1}</button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-rose-600 transition-all">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-0 shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden italic font-bold">
            <div className="bg-rose-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-500 to-rose-700"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500"><Receipt size={32}/></div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{editing ? 'Xarajatni tahrirlash' : 'Yangi Xarajat'}</h3>
                  <p className="text-[10px] opacity-80 font-black tracking-[0.3em] uppercase">Fermadagi barcha chiqimlar nazorati</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all relative z-10"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-7 bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-mono text-sm shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategoriya</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-black shadow-sm uppercase italic">
                    {Object.keys(catLabels).map(k => <option key={k} value={k}>{catLabels[k]}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Xarajat tavsifi</label>
                  <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Masalan: Yandeksdan qum olib keldik" required className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-800 font-black shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-1">Summa (so'm)</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" required className="w-full px-6 py-4.5 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-black text-2xl text-rose-700 shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To'lov usuli</label>
                  <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all font-black shadow-sm uppercase italic">
                    <option value="cash">Naqd</option><option value="card">Karta</option><option value="transfer">O'tkazma</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-rose-600 text-white rounded-[2.25rem] font-black text-xl shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-100 transition-all uppercase tracking-tighter">
                {editing ? 'Yangilash' : 'Xarajatni Qayd Etish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/70 backdrop-blur-md p-4 animate-in fade-in italic font-black">
          <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-rose-50 relative overflow-hidden group shadow-rose-500/10">
            <div className="w-24 h-24 mx-auto bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-600 mb-8 border border-rose-100 shadow-inner group-hover:-rotate-12 transition-transform duration-500"><Trash2 size={40}/></div>
            <h3 className="text-3xl font-black text-gray-800 mb-3 uppercase tracking-tighter">O'chirib yuboramiz?</h3>
            <p className="text-gray-400 text-sm mb-12 font-bold italic leading-relaxed px-4">Ushbu xarajat yozuvini o'chirsangiz, u buxgalteriya hisobidan butunlay yo'qoladi. Rozimisiz?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-5 border-2 border-gray-100 rounded-3xl font-black text-gray-400 hover:bg-gray-50 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-5 bg-rose-600 text-white rounded-3xl font-black hover:bg-rose-700 shadow-xl shadow-rose-500/30 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Ha, o'chir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
