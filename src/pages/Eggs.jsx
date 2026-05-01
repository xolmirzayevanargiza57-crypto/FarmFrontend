import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Egg, Hash, Filter, Calendar, LayoutGrid, FileText, Download, Share2, ClipboardList, TrendingUp } from 'lucide-react';

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
  const perPage = 10;

  const fetchData = async () => {
    try {
      const [r, f] = await Promise.all([
        axios.get(`${API}/api/eggs`),
        axios.get(`${API}/api/flocks`)
      ]);
      setRecords(r.data);
      setFlocks(f.data);
    } catch { toast.error('Ma\'lumot yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    (r.flockId?.name || '').toLowerCase().includes(search.toLowerCase()) &&
    (flockFilter ? r.flockId?._id === flockFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, flockId: r.flockId?._id, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/api/eggs/${editing}`, form);
        toast.success('Tuxum yig\'im rekord yangilandi');
      } else {
        await axios.post(`${API}/api/eggs`, form);
        toast.success('Yangi tuxum yig\'imi yozildi');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error('Xatolik yuz berdi'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/eggs/${id}`); toast.success('Yozuv o\'chirildi'); setDeleteOpen(null); fetchData(); } 
    catch { toast.error('O\'chirishda xatolik yuz berdi'); }
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
    toast.success('Excel fayl yuklab olindi!');
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="animate-spin h-14 w-14 border-4 border-amber-500 border-t-transparent rounded-full shadow-lg shadow-amber-500/20"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-2 py-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">TUXUM <span className="text-amber-400">ISHLAB CHIQARISH</span></h1>
          <p className="text-sm font-medium text-slate-400">Kunlik ishlab chiqarish jurnali</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-slate-800 text-slate-300 px-6 py-4 rounded-2xl font-black border border-slate-700 hover:bg-slate-700 transition-all uppercase text-sm tracking-wider shadow-lg">
            <Download size={18} /> Yuklab Olish
          </button>
          <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-2xl font-black shadow-xl shadow-amber-500/20 active:scale-95 transition-all text-sm uppercase tracking-wider">
            <Plus size={18} /> Qiymat Qo'shish
          </button>
        </div>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        {[
          { label: "Jami Yig'ilgan", value: filtered.reduce((s,r)=>s+r.eggsCollected,0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { label: "Singan Tuxumlar", value: filtered.reduce((s,r)=>s+(r.brokenEggs||0),0), icon: FileText, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
          { label: "Sifatli (Grade A)", value: filtered.filter(r=>r.category === 'Grade A').length, icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }
        ].map((s,i)=>(
          <div key={i} className={`p-6 rounded-[2rem] border ${s.border} ${s.bg} flex items-center gap-4 shadow-lg backdrop-blur-md group hover:-translate-y-1 transition-transform`}>
            <div className={`w-14 h-14 rounded-2xl bg-slate-900/50 flex items-center justify-center ${s.color} transition-transform group-hover:scale-110 shadow-inner`}>
              <s.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} font-mono tracking-tighter drop-shadow-sm`}>{s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 border-r border-slate-700 pr-3">
            <Search size={18} className="group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi bo'yicha qidirish..." 
            className="w-full pl-16 pr-6 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-[1.5rem] outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-200 font-medium placeholder:text-slate-500 shadow-inner"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 border-r border-slate-700 pr-3">
            <Filter size={18} />
          </div>
          <select 
            value={flockFilter} 
            onChange={e => { setFlockFilter(e.target.value); setPage(1); }} 
            className="w-full pl-16 pr-10 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-[1.5rem] outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-bold text-slate-300 appearance-none cursor-pointer shadow-inner"
          >
            <option value="">Barcha Podalar</option>
            {flocks.map(f => <option key={f._id} value={f._id} className="bg-slate-900">{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table - Premium Dark Style */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl relative mx-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px]"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-8 py-6 text-white font-black uppercase tracking-[0.2em] text-[#10px]"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Poda</div></th>
                <th className="px-8 py-6 text-emerald-400 font-bold uppercase tracking-widest text-[#10px] text-center"><div className="flex items-center justify-center gap-2"><Egg size={14}/> Yig'ilgan</div></th>
                <th className="px-8 py-6 text-rose-400 font-bold uppercase tracking-widest text-[#10px] text-center"><div className="flex items-center justify-center gap-2"><TrendingUp size={14} className="rotate-180"/> Singan</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px] text-center"><div className="flex items-center justify-center gap-2"><Share2 size={14}/> Sifat</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : paginated.map((r, idx) => (
                <tr key={r._id} className={`group hover:bg-slate-800/50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}>
                  <td className="px-8 py-5">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 drop-shadow-sm">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-base uppercase tracking-tighter group-hover:text-amber-400 transition-colors drop-shadow-sm">{r.flockId?.name || 'O\'chirilgan'}</span>
                      <span className="text-[10px] text-slate-500 font-black tracking-[0.2em] uppercase">{r.flockId?.breed}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-md">{r.eggsCollected?.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-xl font-black font-mono tracking-tighter drop-shadow-md ${(r.brokenEggs||0) > 5 ? 'text-rose-400' : 'text-slate-500'}`}>{(r.brokenEggs || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] ${r.category === 'Grade A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                      {r.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-3 rounded-2xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-3 rounded-2xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-6 border-t border-slate-700/50 bg-slate-800/30">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-6 py-3 bg-slate-900/50 rounded-full border border-slate-700/50 drop-shadow-sm">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Rekordlar
          </p>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 font-bold hover:text-amber-400 transition-colors disabled:opacity-30">Oldingi</button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-11 h-11 rounded-2xl font-black text-sm transition-all ${page === i + 1 ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 font-bold hover:text-amber-400 transition-colors disabled:opacity-30">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/80 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center bg-amber-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-10 -translate-y-10"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-slate-900/30 text-amber-100 flex items-center justify-center border border-white/20 shadow-inner">
                  <Egg size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{editing ? 'Rekordni tahrirlash' : 'Yangi Rekord'}</h3>
                  <p className="text-[10px] text-amber-900 font-black uppercase tracking-[0.2em] mt-1">Kunlik ishlab chiqarish</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 text-amber-800 hover:text-slate-900 hover:bg-white/20 rounded-2xl transition-colors relative z-10">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Poda tanlash</label>
                  <select value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 text-white font-black transition-all shadow-inner uppercase">
                    <option value="">Podani tanlang</option>
                    {flocks.map(f => <option key={f._id} value={f._id} className="bg-slate-900">{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 text-slate-300 font-mono transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategoriya (Grade)</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 text-slate-200 font-bold transition-all shadow-inner uppercase">
                    <option value="Grade A" className="bg-slate-900">Grade A (Sifatli)</option>
                    <option value="Grade B" className="bg-slate-900">Grade B (O'rtacha)</option>
                    <option value="Small" className="bg-slate-900">Small (Mayda)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-1">Yig'ildi (Dona)</label>
                  <input type="number" value={form.eggsCollected} onChange={e => setForm({...form, eggsCollected: e.target.value})} placeholder="0" required className="w-full px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/20 text-emerald-400 font-black text-2xl transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] ml-1">Singan (Dona)</label>
                  <input type="number" value={form.brokenEggs} onChange={e => setForm({...form, brokenEggs: e.target.value})} placeholder="0" className="w-full px-6 py-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/20 text-rose-400 font-black text-2xl transition-all shadow-inner" />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-800 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" className="flex-[2] py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-amber-500/20 active:translate-y-0.5 transition-all">
                  {editing ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-[3.5rem] p-12 max-w-sm w-full text-center border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="w-24 h-24 mx-auto bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-inner scale-110 group-hover:-rotate-12 transition-transform duration-500"><Trash2 size={40}/></div>
            <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">O'chirish?</h3>
            <p className="text-slate-400 text-sm mb-12 font-bold leading-relaxed px-4">Tuxum yig'imi bo'yicha yozuv olib tashlanadi. Tasdiqlaysizmi?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-5 border border-slate-700 rounded-3xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 uppercase text-[10px] tracking-[0.3em] transition-all">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-5 bg-rose-600 text-white rounded-3xl font-black hover:bg-rose-500 shadow-xl shadow-rose-500/30 uppercase text-[10px] tracking-[0.3em] transition-all">Ha, o'chir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
