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
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik yuz berdi'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/eggs/${id}`);
      toast.success('Yozuv o\'chirildi');
      setDeleteOpen(null);
      fetchData();
    } catch { toast.error('O\'chirishda xatolik yuz berdi'); }
  };

  const exportToCSV = () => {
    const headers = ['Poda', 'Sana', 'Yig\'ilgan Tuxum', 'Singan Tuxum', 'Grade'];
    const rows = filtered.map(r => [
      r.flockId?.name,
      r.date?.slice(0, 10),
      r.eggsCollected,
      r.brokenEggs,
      r.category
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `tuxum_hisoboti_${new Date().toLocaleDateString()}.csv`);
    link.click();
    toast.success('Excel (CSV) fayl yuklab olindi!');
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="animate-spin h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full"></div><p className="text-amber-700 font-bold animate-pulse text-xs uppercase tracking-widest">Yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 italic">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
            <Egg size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">TUXUM <span className="text-amber-500 uppercase">ISHLAB CHIQARISH</span></h1>
            <p className="text-sm font-medium text-gray-500">Kunlik ishlab chiqarish jurnali</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-5 py-3 rounded-2xl font-bold border border-gray-200 hover:bg-gray-100 transition-all">
            <Download size={20} /> Excel
          </button>
          <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:-translate-y-0.5 active:scale-95 transition-all">
            <Plus size={20} /> Qiymat Qo'shish
          </button>
        </div>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Jami yig'ilgan", value: filtered.reduce((s,r)=>s+r.eggsCollected,0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Singan tuxumlar", value: filtered.reduce((s,r)=>s+(r.brokenEggs||0),0), icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: "Sifatli (Grade A)", value: filtered.filter(r=>r.category === 'Grade A').length, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((s,i)=>(
          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm group hover:shadow-md transition-shadow italic">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:scale-110`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} font-mono tracking-tighter`}>{s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi bo'yicha qidirish..." 
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-amber-500/30 bg-white font-medium italic"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={flockFilter} 
            onChange={e => { setFlockFilter(e.target.value); setPage(1); }} 
            className="w-full pl-10 pr-10 py-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none font-bold text-gray-600 appearance-none italic"
          >
            <option value="">Barcha podalar</option>
            {flocks.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Excel Style Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse font-sans">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-6 py-5 text-gray-700 font-extrabold uppercase tracking-widest text-xs"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Poda Nomi</div></th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><Egg size={14}/> Yig'ilgan</div></th>
                <th className="px-6 py-5 text-rose-500/60 font-bold uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><TrendingUp size={14} className="rotate-180"/> Singan</div></th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-center text-nowrap"><div className="flex items-center justify-center gap-2"><Share2 size={14}/> Sifat (Grade)</div></th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-20 text-center opacity-30 text-lg font-bold">Ma'lumot mavjud emas</td></tr>
              ) : paginated.map((r, idx) => (
                <tr key={r._id} className={`group hover:bg-amber-50/20 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-gray-500 px-3 py-1 bg-gray-100 rounded-lg">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-black text-base uppercase tracking-tighter group-hover:text-amber-600 transition-colors">{r.flockId?.name || 'O\'chirilgan'}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{r.flockId?.breed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xl font-black text-emerald-600 font-mono tracking-tighter">{r.eggsCollected?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 block -mt-1 font-bold">ta</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-black font-mono tracking-tighter ${(r.brokenEggs||0) > 5 ? 'text-rose-500' : 'text-gray-400'}`}>{(r.brokenEggs || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.category === 'Grade A' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {r.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Pencil size={18} /></button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50 italic">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-2 bg-white rounded-full border border-gray-200">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Rekordlar
          </p>
          <div className="flex gap-1.5 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-amber-600 disabled:opacity-30 transition-all">Oldingi</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`w-10 h-10 rounded-xl font-black transition-all ${page === i+1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-white border border-gray-100 text-gray-400'}`}>{i+1}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-amber-600 disabled:opacity-30 transition-all">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-0 shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden italic font-bold">
            <div className="bg-amber-500 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Egg size={24} />
                <h3 className="text-xl font-black uppercase tracking-tighter">{editing ? 'Rekordni tahrirlash' : 'Yangi Rekord'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Poda</label>
                  <select value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-gray-700">
                    <option value="">Podani tanlang</option>
                    {flocks.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-gray-700 font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-gray-700">
                    <option value="Grade A">Grade A (Sifatli)</option>
                    <option value="Grade B">Grade B (O'rtacha)</option>
                    <option value="Small">Small (Mayda)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yig'ilgan (Ta)</label>
                  <input type="number" value={form.eggsCollected} onChange={e => setForm({...form, eggsCollected: e.target.value})} placeholder="0" required className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-gray-700 font-black text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Singan (Ta)</label>
                  <input type="number" value={form.brokenEggs} onChange={e => setForm({...form, brokenEggs: e.target.value})} placeholder="0" className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/5 transition-all text-rose-500 font-black text-lg" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all uppercase tracking-tighter italic">
                {editing ? 'Yangilash' : 'Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in italic">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-rose-50 font-bold">
            <div className="w-20 h-20 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-100"><Trash2 size={32}/></div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter italic">O'chirish?</h3>
            <p className="text-gray-400 text-sm mb-8">Ushbu tuxum yig'imi yozuvini doimiyga o'chirmoqchimisiz?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 uppercase text-xs italic tracking-widest">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 shadow-xl shadow-rose-500/20 uppercase text-xs italic tracking-widest">Ha, o'chir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
