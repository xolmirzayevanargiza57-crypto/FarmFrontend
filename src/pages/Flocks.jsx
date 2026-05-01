import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusColors = { active: 'bg-green-100 text-green-700', sold: 'bg-blue-100 text-blue-700', deceased: 'bg-red-100 text-red-700' };
const statusLabels = { active: 'Faol', sold: 'Sotilgan', deceased: 'Nobud' };

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
        toast.success('Poda yangilandi');
      } else {
        await axios.post(`${API}/api/flocks`, form);
        toast.success('Yangi poda qo\'shildi');
      }
      setModalOpen(false);
      fetchFlocks();
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/flocks/${id}`);
      toast.success('Poda o\'chirildi');
      setDeleteOpen(null);
      fetchFlocks();
    } catch { toast.error('O\'chirishda xatolik'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-5 lg:ml-0 ml-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Podalar boshqaruvi</h1>
          <p className="text-sm text-gray-500">Jami: {flocks.length} ta poda</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/20">
          <Plus size={18} /> Yangi poda
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Qidirish..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none transition bg-white" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500/30 outline-none">
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="sold">Sotilgan</option>
          <option value="deceased">Nobud</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="px-4 py-3 font-semibold">Poda ID</th>
                <th className="px-4 py-3 font-semibold">Nomi</th>
                <th className="px-4 py-3 font-semibold">Zoti</th>
                <th className="px-4 py-3 font-semibold">Soni</th>
                <th className="px-4 py-3 font-semibold">Yoshi (kun)</th>
                <th className="px-4 py-3 font-semibold">Holati</th>
                <th className="px-4 py-3 font-semibold">Joylashuv</th>
                <th className="px-4 py-3 font-semibold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400">Ma'lumot topilmadi</td></tr>
              ) : paginated.map(f => (
                <tr key={f._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{f.flockId}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{f.name}</td>
                  <td className="px-4 py-3">{f.breed}</td>
                  <td className="px-4 py-3 font-semibold">{f.quantity?.toLocaleString()}</td>
                  <td className="px-4 py-3">{f.ageInDays}</td>
                  <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[f.status]}`}>{statusLabels[f.status]}</span></td>
                  <td className="px-4 py-3">{f.housingUnit}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteOpen(f._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">{(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} / {filtered.length}</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? 'bg-green-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{i + 1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">{editing ? 'Podani tahrirlash' : 'Yangi poda qo\'shish'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} placeholder="Poda ID" required className="col-span-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nomi" required className="col-span-1 px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <input value={form.breed} onChange={e => setForm({...form, breed: e.target.value})} placeholder="Zoti" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="Soni" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <input type="number" value={form.ageInDays} onChange={e => setForm({...form, ageInDays: e.target.value})} placeholder="Yoshi (kun)" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <input type="date" value={form.arrivalDate} onChange={e => setForm({...form, arrivalDate: e.target.value})} required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30">
                  <option value="active">Faol</option>
                  <option value="sold">Sotilgan</option>
                  <option value="deceased">Nobud</option>
                </select>
                <input value={form.housingUnit} onChange={e => setForm({...form, housingUnit: e.target.value})} placeholder="Joylashuv" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" />
              </div>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Izohlar" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" rows={2} />
              <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition">
                {editing ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"><Trash2 size={24} className="text-red-500" /></div>
            <h3 className="text-lg font-bold mb-2">O'chirishni tasdiqlang</h3>
            <p className="text-gray-500 text-sm mb-5">Ushbu podani o'chirmoqchimisiz?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Bekor qilish</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
