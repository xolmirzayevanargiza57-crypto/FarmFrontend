import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';
const feedTypeLabels = { starter: 'Starter', grower: 'Grower', finisher: 'Finisher', layer: 'Layer' };

export default function Feed() {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ flockId: '', date: '', feedType: 'grower', quantityKg: '', costPerKg: '', supplier: '', notes: '' });
  const perPage = 10;

  const fetchData = async () => {
    try {
      const [f, fl] = await Promise.all([axios.get(`${API}/api/feed`), axios.get(`${API}/api/flocks`)]);
      setRecords(f.data); setFlocks(fl.data);
    } catch { toast.error('Yuklanmadi'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r => (r.flockId?.name || '').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalCost = records.reduce((s, r) => s + (r.totalCost || 0), 0);

  const openAdd = () => { setForm({ flockId: flocks[0]?._id || '', date: new Date().toISOString().slice(0,10), feedType: 'grower', quantityKg: '', costPerKg: '', supplier: '', notes: '' }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, flockId: r.flockId?._id || r.flockId, date: r.date?.slice(0,10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/api/feed/${editing}`, form); toast.success('Yangilandi'); }
      else { await axios.post(`${API}/api/feed`, form); toast.success('Qo\'shildi'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/feed/${id}`); toast.success('O\'chirildi'); setDeleteOpen(null); fetchData(); }
    catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-5 lg:ml-0 ml-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Yem hisobi</h1>
          <p className="text-sm text-gray-500">Jami xarajat: {totalCost.toLocaleString()} so'm</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/20"><Plus size={18}/> Yangi</button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Qidirish..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none bg-white"/>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left">
              <th className="px-4 py-3 font-semibold">Sana</th>
              <th className="px-4 py-3 font-semibold">Poda</th>
              <th className="px-4 py-3 font-semibold">Yem turi</th>
              <th className="px-4 py-3 font-semibold">Miqdor (kg)</th>
              <th className="px-4 py-3 font-semibold">Narx/kg</th>
              <th className="px-4 py-3 font-semibold">Jami</th>
              <th className="px-4 py-3 font-semibold">Ta'minotchi</th>
              <th className="px-4 py-3 font-semibold">Amallar</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length===0?(<tr><td colSpan="8" className="text-center py-10 text-gray-400">Ma'lumot topilmadi</td></tr>)
              :paginated.map(r=>(
                <tr key={r._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">{r.date?.slice(0,10)}</td>
                  <td className="px-4 py-3 font-medium">{r.flockId?.name||'—'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">{feedTypeLabels[r.feedType]||r.feedType}</span></td>
                  <td className="px-4 py-3">{r.quantityKg}</td>
                  <td className="px-4 py-3">{r.costPerKg?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-orange-600">{r.totalCost?.toLocaleString()}</td>
                  <td className="px-4 py-3">{r.supplier||'—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={16}/></button>
                    <button onClick={()=>setDeleteOpen(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100"><p className="text-sm text-gray-500">{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} / {filtered.length}</p><div className="flex gap-1">{Array.from({length:totalPages},(_,i)=>(<button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 rounded-lg text-sm ${page===i+1?'bg-green-500 text-white':'hover:bg-gray-100 text-gray-600'}`}>{i+1}</button>))}</div></div>)}
      </div>

      {modalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setModalOpen(false)}>
        <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5"><h3 className="text-lg font-bold">{editing?'Tahrirlash':'Yangi yem hisobi'}</h3><button onClick={()=>setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20}/></button></div>
          <form onSubmit={handleSave} className="space-y-3">
            <select value={form.flockId} onChange={e=>setForm({...form,flockId:e.target.value})} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"><option value="">Poda tanlang</option>{flocks.map(f=>(<option key={f._id} value={f._id}>{f.name}</option>))}</select>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
              <select value={form.feedType} onChange={e=>setForm({...form,feedType:e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"><option value="starter">Starter</option><option value="grower">Grower</option><option value="finisher">Finisher</option><option value="layer">Layer</option></select>
              <input type="number" value={form.quantityKg} onChange={e=>setForm({...form,quantityKg:e.target.value})} placeholder="Miqdor (kg)" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
              <input type="number" value={form.costPerKg} onChange={e=>setForm({...form,costPerKg:e.target.value})} placeholder="Narx/kg" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
            </div>
            <input value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} placeholder="Ta'minotchi" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Izoh" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" rows={2}/>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium transition">{editing?'Saqlash':'Qo\'shish'}</button>
          </form>
        </div>
      </div>)}

      {deleteOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"><Trash2 size={24} className="text-red-500"/></div><h3 className="text-lg font-bold mb-2">O'chirishni tasdiqlang</h3><p className="text-gray-500 text-sm mb-5">Bu yozuvni o'chirmoqchimisiz?</p><div className="flex gap-3"><button onClick={()=>setDeleteOpen(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Bekor qilish</button><button onClick={()=>handleDelete(deleteOpen)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">O'chirish</button></div></div></div>)}
    </div>
  );
}
