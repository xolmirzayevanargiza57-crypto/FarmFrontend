import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Wheat, Hash, LayoutGrid, Calendar, Scale, CircleDollarSign, AlignLeft, Filter, TrendingUp } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const emptyRecord = { flockId: '', date: '', feedType: '', quantityKg: '', totalCost: '', notes: '' };

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
  const perPage = 10;

  const fetchData = async () => {
    try {
      const [r, f] = await Promise.all([
        axios.get(`${API}/api/feed`),
        axios.get(`${API}/api/flocks`)
      ]);
      setRecords(r.data);
      setFlocks(f.data);
    } catch { toast.error('Yuklanmadi'); }
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
        await axios.put(`${API}/api/feed/${editing}`, form);
        toast.success('Yem rekordi yangilandi');
      } else {
        await axios.post(`${API}/api/feed`, form);
        toast.success('Yozildi');
      }
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/feed/${id}`);
      toast.success('O\'chirildi');
      setDeleteOpen(null);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 font-bold text-emerald-600 gap-2"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full font-bold"></div><p className="animate-pulse tracking-widest text-[10px] uppercase">Yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2 italic">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
            <Wheat size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">YEM <span className="text-emerald-600">SARFI</span></h1>
            <p className="text-sm font-medium text-gray-500">Ozuqa iste'moli jurnali</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all text-sm uppercase tracking-tighter">
          <Plus size={20} /> Sarfni Qayd Etish
        </button>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Jami Yem (kg)", value: filtered.reduce((s,r)=>s+r.quantityKg,0), icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Jami Xarajat", value: filtered.reduce((s,r)=>s+(r.totalCost||0),0), icon: CircleDollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "O'rtacha Narx", value: Math.round(filtered.reduce((s,r)=>s+(r.totalCost||0),0) / (filtered.reduce((s,r)=>s+r.quantityKg,0) || 1)), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: "Yozuvlar soni", value: filtered.length, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((s,i)=>(
          <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm group hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} transition-transform group-hover:scale-110 shadow-inner`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-xl font-black ${s.color} font-mono tracking-tighter`}>{s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda bo'yicha qidirish..." 
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500/30 bg-white font-bold"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={flockFilter} 
            onChange={e => { setFlockFilter(e.target.value); setPage(1); }} 
            className="w-full pl-10 pr-10 py-4 bg-white border-2 border-gray-100 rounded-2xl outline-none font-black text-gray-600 appearance-none italic cursor-pointer shadow-sm"
          >
            <option value="">Barcha Podalar</option>
            {flocks.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-6 text-gray-400 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-6 py-6 text-gray-700 font-black uppercase tracking-widest text-xs"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Poda Nomi</div></th>
                <th className="px-6 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Wheat size={14}/> Yem Turi</div></th>
                <th className="px-6 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><Scale size={14}/> Miqdor (Kg)</div></th>
                <th className="px-6 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right"><div className="flex items-center justify-end gap-2"><CircleDollarSign size={14}/> Jami Narx</div></th>
                <th className="px-6 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right text-nowrap"><div className="flex items-center justify-end gap-2"><AlignLeft size={14}/> Amallar</div></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-24 text-center opacity-30 text-2xl font-black italic uppercase tracking-tighter">Ma'lumot mavjud emas</td></tr>
              ) : paginated.map((r, idx) => (
                <tr key={r._id} className={`group hover:bg-emerald-50/20 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/10'}`}>
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs font-black text-gray-500 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-black text-base uppercase tracking-tighter group-hover:text-emerald-700 transition-colors">{r.flockId?.name || 'O\'chirilgan'}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase font-sans tracking-widest">{r.flockId?.housingUnit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 font-black text-[10px] uppercase tracking-wider border border-gray-200">{r.feedType}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xl font-black text-gray-800 font-mono tracking-tighter italic">{r.quantityKg?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">kg</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-lg font-black text-emerald-600 font-mono tracking-tighter">{r.totalCost?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">so'm</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                      <button onClick={() => openEdit(r)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Pencil size={18} /></button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-100/30">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-5 py-2.5 bg-white rounded-2xl border border-gray-200">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} YEM YOZUVLARI
          </p>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-black text-gray-400 hover:text-emerald-600 disabled:opacity-30 transition-all">Oldingi</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${page === i+1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}>{i+1}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs font-black text-gray-400 hover:text-emerald-600 disabled:opacity-30 transition-all">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-0 shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden font-bold italic">
            <div className="bg-emerald-500 p-8 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <Wheat size={24} className="animate-pulse" />
                <h3 className="text-xl font-black uppercase tracking-tighter">{editing ? 'Rekordni Yangilash' : 'Yem Sarfini Qayd Etish'}</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2.5 hover:bg-white/20 rounded-2xl transition-all"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Poda</label>
                  <select value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-gray-700 font-black">
                    <option value="">Podani tanlang</option>
                    {flocks.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-gray-700 font-mono text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yem Turi</label>
                  <input value={form.feedType} onChange={e => setForm({...form, feedType: e.target.value})} placeholder="Masalan: Makkajo'xori" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-gray-700 uppercase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Miqdor (Kg)</label>
                  <input type="number" value={form.quantityKg} onChange={e => setForm({...form, quantityKg: e.target.value})} placeholder="0" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-gray-800 font-black text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jami Xarajat</label>
                  <input type="number" value={form.totalCost} onChange={e => setForm({...form, totalCost: e.target.value})} placeholder="0" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all text-emerald-600 font-black text-lg" />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 transition-all uppercase tracking-tighter italic">
                {editing ? 'Sarfni Yangilash' : 'Sarfni Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-rose-50 font-bold italic">
            <div className="w-24 h-24 mx-auto bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-inner group"><Trash2 size={40} className="group-hover:scale-110 transition-transform"/></div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter italic">O'CHIRISH?</h3>
            <p className="text-gray-400 text-sm mb-10 font-medium">Ushbu yem sarfi yozuvini tizimdan butunlay o'chirib tashlamoqchimisiz?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl font-black text-gray-400 hover:bg-gray-50 uppercase text-xs tracking-widest transition-all">Bekor</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 shadow-xl shadow-rose-500/20 uppercase text-xs tracking-widest transition-all">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
