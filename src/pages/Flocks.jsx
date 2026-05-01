import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, Bird, Hash, Tag, Users, Calendar, Home, Activity, MoreVertical, Filter, FileSpreadsheet, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusConfig = { 
  active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Activity, label: 'Faol' }, 
  sold: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileSpreadsheet, label: 'Sotilgan' }, 
  deceased: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle, label: 'Nobud bo\'lgan' } 
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

  if (loading) return <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full font-bold text-emerald-600"></div><p className="text-emerald-700 font-bold animate-pulse uppercase tracking-widest text-xs">Ma'lumotlar yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 italic">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Bird size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">PODALAR <span className="text-emerald-600">BOSHQARUVI</span></h1>
            <p className="text-sm font-medium text-gray-500">Jami faol qushlar ro'yxati</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all duration-200">
          <Plus size={20} /> Yangi Poda Qo'shish
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi yoki ID bo'yicha qidirish..." 
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all bg-white font-medium text-gray-700"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
              className="pl-10 pr-10 py-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500/30 transition-all font-bold text-gray-600 appearance-none cursor-pointer"
            >
              <option value="">Barcha holatlar</option>
              <option value="active">Faol</option>
              <option value="sold">Sotilgan</option>
              <option value="deceased">Nobud bo'lgan</option>
            </select>
            <MoreVertical size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table - "Excel Rival" Style */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-gray-400 font-bold uppercase tracking-wider text-xs">
                  <div className="flex items-center gap-2"><Hash size={14}/> ID</div>
                </th>
                <th className="px-6 py-5 text-gray-700 font-extrabold uppercase tracking-widest text-xs">
                  <div className="flex items-center gap-2"><Tag size={14}/> Poda nomi</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <div className="flex items-center gap-2"><Bird size={14}/> Zoti</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-center">
                  <div className="flex items-center justify-center gap-2"><Users size={14}/> Soni</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-center text-nowrap">
                  <div className="flex items-center justify-center gap-2 text-nowrap"><Calendar size={14}/> Yoshi (Kun)</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <div className="flex items-center gap-2"><Activity size={14}/> Holati</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs">
                  <div className="flex items-center gap-2"><Home size={14}/> Joylashuv</div>
                </th>
                <th className="px-6 py-5 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Search size={48} />
                      <p className="text-lg font-bold">Hech qanday ma'lumot topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((f, idx) => {
                const StatusIcon = statusConfig[f.status]?.icon || Activity;
                return (
                  <tr key={f._id} className={`group hover:bg-emerald-50/30 transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{f.flockId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-bold text-base group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{f.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">{new Date(f.arrivalDate).toLocaleDateString()} kelgan</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium italic">{f.breed}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-black text-gray-700 font-mono tracking-tighter">{f.quantity?.toLocaleString()}</span>
                      <span className="text-[10px] text-gray-400 block -mt-1 font-bold">ta</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-gray-50 text-gray-600 font-bold border border-gray-100">
                        {f.ageInDays}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border ${statusConfig[f.status]?.color}`}>
                        <StatusIcon size={14} />
                        <span className="text-[11px] font-black uppercase tracking-wider">{statusConfig[f.status]?.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 font-semibold group-hover:text-emerald-600 transition-colors">
                        <Home size={14} className="text-gray-300 group-hover:text-emerald-400" />
                        {f.housingUnit}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(f)} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => setDeleteOpen(f._id)} className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
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
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50 italic">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-2 bg-white rounded-full border border-gray-200">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Podalar
          </p>
          <div className="flex items-center gap-1.5 mt-4 sm:mt-0">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)} 
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all font-bold"
            >
              Oldingi
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                onClick={() => setPage(i + 1)} 
                className={`w-10 h-10 rounded-xl font-bold transition-all ${page === i + 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)} 
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 transition-all font-bold"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* Save/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] overflow-y-auto p-1 border border-white/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                    <Bird size={20} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{editing ? 'Podani Tahrirlash' : 'Yangi Poda Qo\'shish'}</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Poda ID</label>
                    <input 
                      value={form.flockId} 
                      onChange={e => setForm({...form, flockId: e.target.value.toUpperCase()})} 
                      placeholder="Masalan: P-001" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-700" 
                    />
                  </div>
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Poda Nomi</label>
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      placeholder="Masalan: Oq Tovuqlar" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-extrabold text-gray-800" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Zoti</label>
                    <input 
                      value={form.breed} 
                      onChange={e => setForm({...form, breed: e.target.value})} 
                      placeholder="Masalan: Broiler" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-700" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Soni</label>
                    <input 
                      type="number" 
                      value={form.quantity} 
                      onChange={e => setForm({...form, quantity: e.target.value})} 
                      placeholder="0" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-700" 
                    />
                  </div>
                  <div className="space-y-1.5 text-nowrap">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest text-nowrap">Yoshi (Kun)</label>
                    <input 
                      type="number" 
                      value={form.ageInDays} 
                      onChange={e => setForm({...form, ageInDays: e.target.value})} 
                      placeholder="0" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-700" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Keliish Sanasi</label>
                    <input 
                      type="date" 
                      value={form.arrivalDate} 
                      onChange={e => setForm({...form, arrivalDate: e.target.value})} 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-600" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Holati</label>
                    <select 
                      value={form.status} 
                      onChange={e => setForm({...form, status: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="active">Faol</option>
                      <option value="sold">Sotilgan</option>
                      <option value="deceased">Nobud bo'lgan</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Joylashuv</label>
                    <input 
                      value={form.housingUnit} 
                      onChange={e => setForm({...form, housingUnit: e.target.value})} 
                      placeholder="Masalan: Barn 1" 
                      required 
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-bold text-gray-700" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Izohlar</label>
                  <textarea 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                    placeholder="Qo'shimcha tafsilotlar..." 
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 font-medium text-gray-700" 
                    rows={3} 
                  />
                </div>
                <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                  {editing ? 'O\'zgarishlarni Saqlash' : 'Poda Qo\'shish'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/60 backdrop-blur-sm p-4 flex-col gap-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center border border-rose-100 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
              <Trash2 size={32} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tighter uppercase italic">O'chirishni tasdiqlang</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium italic">Ushbu podani o'chirishni xohlaysizmi? Ushbu amalni ortga qaytarib bo'lmaydi.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-4 border-2 border-gray-100 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition-all active:scale-95">Bekor qilish</button>
              <button 
                onClick={() => handleDelete(deleteOpen)} 
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
              >
                O'chirish
              </button>
            </div>
          </div>
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.5em] animate-pulse italic">Diqqat bilan qaror qiling</div>
        </div>
      )}
    </div>
  );
}
