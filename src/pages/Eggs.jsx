import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Egg, Filter, Calendar, LayoutGrid, FileText, Download, Share2, ClipboardList, TrendingUp } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const emptyRecord = { flockId: '', date: '', eggsCollected: '', brokenEggs: '', category: 'Grade A', notes: '' };

export default function Eggs() {
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
        axios.get(`${API}/api/eggs`),
        axios.get(`${API}/api/flocks`)
      ]);
      setRecords(r.data);
      setFlocks(f.data);
    } catch { toast.error("Ma'lumot yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    (r.flockId?.name || '').toLowerCase().includes(search.toLowerCase()) &&
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
        await axios.put(`${API}/api/eggs/${editing}`, form);
        toast.success("Tuxum yig'imi yangilandi");
      } else {
        await axios.post(`${API}/api/eggs`, form);
        toast.success("Yangi yig'im saqlandi");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { 
      await axios.delete(`${API}/api/eggs/${id}`); 
      toast.success("Yozuv o'chirildi"); 
      setDeleteOpen(null); 
      fetchData(); 
    } 
    catch { toast.error("O'chirishda xatolik"); }
  };

  const exportToCSV = () => {
    const headers = ['Poda', 'Sana', 'Yig\'ilgan Tuxum', 'Singan Tuxum', 'Grade'];
    const rows = filtered.map(r => [r.flockId?.name, r.date?.slice(0, 10), r.eggsCollected, r.brokenEggs, r.category]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tuxum_hisoboti_${new Date().toLocaleDateString()}.csv`);
    link.click();
    toast.success('Excel yuklab olindi');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      <div className="animate-spin h-14 w-14 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            Tuxum <span className="text-amber-500">Hajmi</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Kunlik ishlab chiqarish jurnali</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-slate-800 text-slate-300 px-6 py-4 rounded-2xl font-black border border-slate-700 hover:bg-slate-700 transition-all uppercase text-sm tracking-wider shadow-lg">
            <Download size={18} /> CSV Yuklash
          </button>
          <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-4 rounded-2xl font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider">
            <Plus size={18} /> Qiymat Qo'shish
          </button>
        </div>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Jami Yig'ilgan", value: filtered.reduce((s,r)=>s+r.eggsCollected,0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: "Singan Tuxumlar", value: filtered.reduce((s,r)=>s+(r.brokenEggs||0),0), icon: FileText, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: "Sifatli (Grade A)", value: filtered.filter(r=>r.category === 'Grade A').length, icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
        ].map((s,i)=>(
          <div key={i} className={`p-6 rounded-[2rem] border ${s.border} ${s.bg} flex items-center gap-4 shadow-lg`}>
            <div className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-900/50 flex items-center justify-center ${s.color} border border-white/5`}>
              <s.icon size={26} strokeWidth={2.5}/>
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color} tracking-tighter leading-none mb-1`}>{s.value.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={20} className="group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi orqali qidirish..." 
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
                <th className="px-6 py-5 text-emerald-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Egg size={14}/> Yig'ilgan</div></th>
                <th className="px-6 py-5 text-rose-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><TrendingUp size={14} className="rotate-180"/> Singan</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Share2 size={14}/> Sifat</div></th>
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
                  <td className="px-6 py-4 text-center">
                    <span className="text-xl font-black text-emerald-400 font-mono tracking-tight bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">{r.eggsCollected?.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-black font-mono tracking-tight ${(r.brokenEggs||0) > 5 ? 'text-rose-400' : 'text-slate-500'}`}>{(r.brokenEggs || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${r.category === 'Grade A' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      {r.category}
                    </span>
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
            {filtered.length > 0 ? (page - 1) * perPage + 1 : 0} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Qaydlari
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-amber-400 transition-colors disabled:opacity-50 text-sm">Orqaga</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${page === i + 1 ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-amber-400 transition-colors disabled:opacity-50 text-sm">Oldinga</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                  <Egg size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{editing ? 'Rekordni tahrirlash' : 'Yangi Rekord'}</h3>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mt-1">Kunlik ishlab chiqarish</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
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
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sifat darajasi</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white font-bold transition-colors">
                    <option value="Grade A" className="bg-slate-900">Grade A (Sifatli)</option>
                    <option value="Grade B" className="bg-slate-900">Grade B (O'rtacha)</option>
                    <option value="Small" className="bg-slate-900">Small (Mayda)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Yig'ildi (Dona)</label>
                  <input type="number" value={form.eggsCollected} onChange={e => setForm({...form, eggsCollected: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-400 font-black text-xl transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Singan (Dona)</label>
                  <input type="number" value={form.brokenEggs} onChange={e => setForm({...form, brokenEggs: e.target.value})} placeholder="0" className="w-full px-5 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-rose-400 font-black text-xl transition-colors" />
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" disabled={saving} className="w-full px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50">
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
            <p className="text-slate-400 text-sm mb-8 font-medium">Bu yozuv abadiyga o'chiriladi.</p>
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
