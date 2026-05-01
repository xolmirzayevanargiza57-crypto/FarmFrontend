import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Bird, Hash, Tag, Users, Calendar, Home, Activity, MoreVertical, Filter, FileSpreadsheet, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusConfig = { 
  active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Activity, label: 'Faol' }, 
  sold: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: FileSpreadsheet, label: 'Sotilgan' }, 
  deceased: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: AlertCircle, label: 'Nobud bo\'lgan' } 
};

const emptyFlock = { flockId: '', name: '', breed: '', quantity: '', ageInDays: '', arrivalDate: '', status: 'active', housingUnit: '', notes: '' };

export default function Flocks() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [form, setForm] = useState(emptyFlock);
  const [editing, setEditing] = useState(null);
  const perPage = 10;

  const fetchFlocks = async () => {
    try {
      const res = await axios.get(`${API}/api/flocks`);
      setFlocks(res.data);
    } catch { toast.error('Ma\'lumot yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFlocks(); }, []);

  const filtered = flocks.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? f.status === statusFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm(emptyFlock); setEditing(null); setModalOpen(true); };
  const openEdit = (f) => { setForm({ ...f, arrivalDate: f.arrivalDate?.slice(0, 10) }); setEditing(f._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/api/flocks/${editing}`, form);
        toast.success('Poda ma\'lumotlari yangilandi');
      } else {
        await axios.post(`${API}/api/flocks`, form);
        toast.success('Yangi poda muvaffaqiyatli qo\'shildi');
      }
      setModalOpen(false);
      fetchFlocks();
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik yuz berdi'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/flocks/${id}`);
      toast.success('Poda o\'chirildi');
      setDeleteOpen(null);
      fetchFlocks();
    } catch { toast.error('O\'chirishda xatolik yuz berdi'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full opacity-80 shadow-lg shadow-indigo-500/30"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col px-2 py-4 lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none mb-1">PODALAR <span className="text-indigo-400">BOSHQARUVI</span></h1>
          <p className="text-sm font-medium text-slate-400">Jami faol qushlar ro'yxati</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
          <Plus size={18} /> Yangi Poda Qo'shish
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-2">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 border-r border-slate-700 pr-3">
            <Search size={18} className="group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi bo'yicha tahlil qilish..." 
            className="w-full pl-16 pr-6 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-[1.5rem] outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-200 font-medium placeholder:text-slate-500 shadow-inner"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 border-r border-slate-700 pr-3">
            <Filter size={18} />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
            className="w-full pl-16 pr-10 py-4 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-[1.5rem] outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-300 appearance-none cursor-pointer shadow-inner"
          >
            <option value="">Barcha holatlar</option>
            <option value="active" className="bg-slate-900">Faol</option>
            <option value="sold" className="bg-slate-900">Sotilgan</option>
            <option value="deceased" className="bg-slate-900">Nobud bo'lgan</option>
          </select>
        </div>
      </div>

      {/* Main Table - Premium Dark Style */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl relative mx-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px]"><div className="flex items-center gap-2"><Hash size={14}/> ID</div></th>
                <th className="px-8 py-6 text-white font-black uppercase tracking-[0.2em] text-[#10px]"><div className="flex items-center gap-2"><Tag size={14}/> Poda</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px]"><div className="flex items-center gap-2"><Bird size={14}/> Zoti</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px] text-center"><div className="flex items-center justify-center gap-2"><Users size={14}/> Soni</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px] text-center text-nowrap"><div className="flex items-center justify-center gap-2"><Calendar size={14}/> Yashash muddati</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px]"><div className="flex items-center gap-2"><Activity size={14}/> Holati</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px]"><div className="flex items-center gap-2"><Home size={14}/> Katak</div></th>
                <th className="px-8 py-6 text-slate-400 font-bold uppercase tracking-widest text-[#10px] text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <p className="text-xl font-bold text-slate-600 uppercase tracking-widest">Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : paginated.map((f, idx) => {
                const StatusIcon = statusConfig[f.status]?.icon || Activity;
                return (
                  <tr key={f._id} className={`group hover:bg-slate-800/50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}>
                    <td className="px-8 py-5">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 drop-shadow-sm">{f.flockId}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-white font-black text-base uppercase tracking-tighter group-hover:text-indigo-400 transition-colors drop-shadow-sm">{f.name}</span>
                        <span className="text-[9px] text-slate-500 font-black tracking-[0.2em] uppercase">{new Date(f.arrivalDate).toLocaleDateString()} da kelgan</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-400 font-bold uppercase tracking-wider text-[11px]">{f.breed}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-2xl font-black text-slate-200 font-mono tracking-tighter drop-shadow-md">{f.quantity?.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800/80 text-indigo-400 font-black border border-slate-700/50 drop-shadow-sm text-lg">
                        {f.ageInDays}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${statusConfig[f.status]?.color}`}>
                        <StatusIcon size={14} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{statusConfig[f.status]?.label}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                        <Home size={14} className="text-slate-600" />
                        {f.housingUnit}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(f)} className="p-3 rounded-2xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => setDeleteOpen(f._id)} className="p-3 rounded-2xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-6 border-t border-slate-700/50 bg-slate-800/30">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-6 py-3 bg-slate-900/50 rounded-full border border-slate-700/50 drop-shadow-sm">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Podalar
          </p>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-30">Oldingi</button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-11 h-11 rounded-2xl font-black text-sm transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-6 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-30">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Save/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/80 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-inner">
                  <Bird size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{editing ? 'Podani Tahrirlash' : 'Poda Qo\'shish'}</h3>
                  <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mt-1">Yangi hayot avlodi</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Poda ID</label>
                  <input value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value.toUpperCase()})} placeholder="P-001" required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-mono placeholder:text-slate-600 transition-all shadow-inner" />
                </div>
                <div className="space-y-2 col-span-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Poda Nomi</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Oq Tovuqlar" required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-black placeholder:text-slate-600 transition-all shadow-inner uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Zoti</label>
                  <input value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} placeholder="Broiler" required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-200 font-bold placeholder:text-slate-600 transition-all shadow-inner uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Soni (Ta)</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-white font-black text-xl placeholder:text-slate-600 transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Keliish sanasi</label>
                  <input type="date" value={form.arrivalDate} onChange={e => setForm({...form, arrivalDate: e.target.value})} required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-300 font-mono transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Joylashuv (Katak)</label>
                  <input value={form.housingUnit} onChange={e => setForm({...form, housingUnit: e.target.value})} placeholder="Block-A" required className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 text-slate-200 font-bold placeholder:text-slate-600 transition-all shadow-inner uppercase" />
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-800 flex gap-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-indigo-500/20 active:translate-y-0.5 transition-all">
                  {editing ? 'Yangilash' : 'Yangi Poda Qo\'shish'}
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
            <p className="text-slate-400 text-sm mb-12 font-bold leading-relaxed px-4">Podani butunlay olib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.</p>
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
