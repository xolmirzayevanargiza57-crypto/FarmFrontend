import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Wheat, Filter, Calendar, LayoutGrid, Scale, DollarSign, Activity } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const emptyRecord = { flockId: '', date: '', feedType: '', quantityKg: '', totalCost: '', supplier: '', notes: '' };

export default function Feed() {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [flockFilter, setFlockFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const fetchData = async () => {
    try {
      const [r, f] = await Promise.all([
        axios.get(`${API}/api/feed`),
        axios.get(`${API}/api/flocks`)
      ]);
      setRecords(r.data);
      setFlocks(f.data);
    } catch { toast.error("Ma'lumot yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    (r.feedType || '').toLowerCase().includes(search.toLowerCase()) &&
    (flockFilter ? r.flockId?._id === flockFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, flockId: r.flockId?._id, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/api/feed/${editing}`, form);
        toast.success("Yem sarfi yangilandi");
      } else {
        await axios.post(`${API}/api/feed`, form);
        toast.success("Yem sarfi arxivlandi");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/feed/${id}`); toast.success("Yozuv o'chirildi"); setDeleteOpen(null); fetchData(); } 
    catch { toast.error("O'chirishda xatolik"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      <div className="animate-spin h-14 w-14 border-4 border-amber-600 border-t-transparent rounded-full shadow-lg shadow-amber-600/20"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            Yem <span className="text-amber-600">Sarfi</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Fermaning kunlik yem sarfi rekordi</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-600/20 active:scale-95">
          <Plus size={18} /> Yangi Yozuv
        </button>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Jami Yem (Kg)", value: filtered.reduce((s,r)=>s+r.quantityKg,0), icon: Scale, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: "Jami Xarajat", value: `${filtered.reduce((s,r)=>s+r.totalCost,0).toLocaleString()} so'm`, icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
          { label: "O'rtacha Narx / Kg", value: filtered.length ? `${Math.round(filtered.reduce((s,r)=>s+r.totalCost,0) / filtered.reduce((s,r)=>s+r.quantityKg,0)).toLocaleString()} so'm` : '0 so\'m', icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' }
        ].map((s,i)=>(
          <div key={i} className={`p-6 rounded-[2rem] border ${s.border} ${s.bg} flex items-center gap-4 shadow-lg`}>
            <div className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-900/50 flex items-center justify-center ${s.color} border border-white/5`}>
              <s.icon size={26} strokeWidth={2.5}/>
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color} tracking-tighter leading-none mb-1`}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={20} className="group-focus-within:text-amber-500 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Yem turi yordamida qidirish..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-200 font-bold placeholder:text-slate-600"
          />
        </div>
        <div className="relative min-w-[200px] md:w-64">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Filter size={20} />
          </div>
          <select 
            value={flockFilter} 
            onChange={e => { setFlockFilter(e.target.value); setPage(1); }} 
            className="w-full pl-14 pr-10 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-300 appearance-none cursor-pointer"
          >
            <option value="">Barcha Podalar</option>
            {flocks.map(f => <option key={f._id} value={f._id} className="bg-slate-900">{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-6 py-5 text-white font-black uppercase tracking-[0.2em] text-[10px]"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Poda</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Wheat size={14}/> Yem Turi</div></th>
                <th className="px-6 py-5 text-emerald-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Scale size={14}/> Miqdor (Kg)</div></th>
                <th className="px-6 py-5 text-amber-500 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><DollarSign size={14}/> Jami Xarajat</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : paginated.map((r) => (
                <tr key={r._id} className="group hover:bg-slate-800/30 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-sm uppercase tracking-wide">{r.flockId?.name || 'O\'chirilgan'}</span>
                      <span className="text-[10px] text-slate-500 font-bold tracking-widest">{r.flockId?.breed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-200 font-bold uppercase tracking-wider text-xs">{r.feedType}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-sm">{r.quantityKg?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-black text-amber-500 font-mono tracking-tighter drop-shadow-sm">{r.totalCost?.toLocaleString()} so'm</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(r)} className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-800/20">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {filtered.length > 0 ? (page - 1) * perPage + 1 : 0} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Fallowlar
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-amber-500 transition-colors disabled:opacity-50 text-sm">Orqaga</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${page === i + 1 ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-amber-500 transition-colors disabled:opacity-50 text-sm">Oldinga</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-500 flex items-center justify-center border border-amber-600/30">
                  <Wheat size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{editing ? 'Yozuvni Tahrirlash' : 'Yangi Yem Yozuvi'}</h3>
                  <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-1">Sarf-Xarajat tizimi</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poda tanlash</label>
                  <select value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white font-black transition-colors">
                    <option value="">Podani tanlang</option>
                    {flocks.map(f => <option key={f._id} value={f._id} className="bg-slate-900">{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white font-mono transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yem Turi</label>
                  <input value={form.feedType} onChange={e => setForm({...form, feedType: e.target.value})} placeholder="Masalan: Bug'doy, Makka" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white font-bold transition-colors uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Miqdor (Kg)</label>
                  <input type="number" value={form.quantityKg} onChange={e => setForm({...form, quantityKg: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-400 font-black text-xl transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Umumiy Xarajat (So'm)</label>
                  <input type="number" value={form.totalCost} onChange={e => setForm({...form, totalCost: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-amber-600/10 border border-amber-600/30 rounded-xl outline-none focus:ring-2 focus:ring-amber-600/30 text-amber-500 font-black text-xl transition-colors" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yetkazib Beruvchi</label>
                  <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} placeholder="Kompaniya yoki shaxs" className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white font-bold transition-colors" />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" disabled={saving} className="w-full px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50">
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
            <p className="text-slate-400 text-sm mb-8 font-medium">Ushbu yozuvni abadiyga o'chirasizmi?</p>
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
