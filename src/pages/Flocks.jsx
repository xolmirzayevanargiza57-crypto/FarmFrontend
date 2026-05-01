import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Bird, Hash, Tag, Users, Calendar, Home, Activity, Filter, FileSpreadsheet, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusConfig = { 
  active: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Activity, label: 'Faol' }, 
  sold: { color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: FileSpreadsheet, label: 'Sotilgan' }, 
  deceased: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertCircle, label: 'Nobud bo\'lgan' } 
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
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const fetchFlocks = async () => {
    try {
      const res = await axios.get(`${API}/api/flocks`);
      setFlocks(res.data);
    } catch { toast.error("Ma'lumotlarni yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFlocks(); }, []);

  const filtered = flocks.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? f.status === statusFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm(emptyFlock); setEditing(null); setModalOpen(true); };
  const openEdit = (f) => { setForm({ ...f, arrivalDate: f.arrivalDate?.slice(0, 10) }); setEditing(f._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/api/flocks/${editing}`, form);
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await axios.post(`${API}/api/flocks`, form);
        toast.success("Yangi poda qo'shildi");
      }
      setModalOpen(false);
      fetchFlocks();
    } catch (err) { toast.error(err.response?.data?.message || "Saqlashda xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/flocks/${id}`);
      toast.success("Poda o'chirildi");
      setDeleteOpen(null);
      fetchFlocks();
    } catch { toast.error("O'chirishda xatolik"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
      <div className="animate-spin h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full shadow-lg shadow-indigo-500/20"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-1 flex items-center gap-3">
            Podalar <span className="text-indigo-500">Boshqaruvi</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Fermaning asosiy hayot manbai nazorati</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
          <Plus size={18} /> Yangi Poda Qo'shish
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={20} className="group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi bilan izlash..." 
            className="w-full pl-14 pr-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-200 font-bold placeholder:text-slate-600"
          />
        </div>
        <div className="relative min-w-[200px] md:w-64">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Filter size={20} />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
            className="w-full pl-14 pr-10 py-4 bg-slate-900 border border-slate-700 rounded-2xl outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-300 appearance-none cursor-pointer"
          >
            <option value="">Barcha holatlar</option>
            <option value="active" className="bg-slate-900">Faol</option>
            <option value="sold" className="bg-slate-900">Sotilgan</option>
            <option value="deceased" className="bg-slate-900">Nobud bo'lgan</option>
          </select>
        </div>
      </div>

      {/* Modern Table Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Hash size={14}/> ID</div></th>
                <th className="px-6 py-5 text-white font-black uppercase tracking-[0.2em] text-[10px]"><div className="flex items-center gap-2"><Tag size={14}/> Poda</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><div className="flex items-center gap-2"><Bird size={14}/> Zoti</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Users size={14}/> Soni</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Calendar size={14}/> Yashash muddati</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><div className="flex items-center gap-2"><Activity size={14}/> Holati</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><div className="flex items-center gap-2"><Home size={14}/> Katak</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : paginated.map((f, idx) => {
                const StatusIcon = statusConfig[f.status]?.icon || Activity;
                return (
                  <tr key={f._id} className="group hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">{f.flockId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-black text-sm uppercase tracking-wide">{f.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold tracking-widest">{new Date(f.arrivalDate).toLocaleDateString()} da kelgan</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-bold uppercase tracking-widest text-[11px]">{f.breed}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-black text-white font-mono">{f.quantity?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl bg-slate-800 text-indigo-400 font-black border border-slate-700 text-sm">
                        {f.ageInDays} kun
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusConfig[f.status]?.color}`}>
                        <StatusIcon size={12} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{statusConfig[f.status]?.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                        <Home size={14} />
                        {f.housingUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(f)} className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteOpen(f._id)} className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
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
            {filtered.length > 0 ? (page - 1) * perPage + 1 : 0} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Podalar
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-50 text-sm">Orqaga</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-50 text-sm">Oldinga</button>
          </div>
        </div>
      </div>

      {/* Save/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Bird size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{editing ? 'Podani Tahrirlash' : 'Poda Qo\'shish'}</h3>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Yangi hayot avlodi</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl transition-colors shrink-0">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poda ID</label>
                  <input value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value.toUpperCase()})} placeholder="P-001" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-mono uppercase transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Poda Nomi</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Oq Tovuqlar" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Zoti</label>
                  <input value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} placeholder="Broiler" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soni (Ta)</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Keliish sanasi</label>
                  <input type="date" value={form.arrivalDate} onChange={e => setForm({...form, arrivalDate: e.target.value})} required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-mono transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joylashuv (Katak)</label>
                  <input value={form.housingUnit} onChange={e => setForm({...form, housingUnit: e.target.value})} placeholder="Block-A" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-colors" />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" disabled={saving} className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
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
            <p className="text-slate-400 text-sm mb-8 font-medium">Bu amalni ortga qaytarib bo'lmaydi.</p>
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
