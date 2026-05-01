import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || '';
const catLabels = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };
const payLabels = { cash: 'Naqd', card: 'Karta', transfer: 'O\'tkazma' };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ date: '', category: 'feed', description: '', amount: '', paymentMethod: 'cash', notes: '' });
  const perPage = 10;

  const fetchData = async () => {
    try { const r = await axios.get(`${API}/api/expenses`); setRecords(r.data); }
    catch { toast.error('Yuklanmadi'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r => (r.description || '').toLowerCase().includes(search.toLowerCase()) && (catFilter ? r.category === catFilter : true));
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalAmount = records.reduce((s, r) => s + (r.amount || 0), 0);

  // Monthly chart data
  const monthlyData = records.reduce((acc, r) => {
    const m = r.date?.slice(0, 7);
    if (m) { acc[m] = (acc[m] || 0) + r.amount; }
    return acc;
  }, {});
  const chartData = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));

  const openAdd = () => { setForm({ date: new Date().toISOString().slice(0,10), category: 'feed', description: '', amount: '', paymentMethod: 'cash', notes: '' }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, date: r.date?.slice(0,10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await axios.put(`${API}/api/expenses/${editing}`, form); toast.success('Yangilandi'); }
      else { await axios.post(`${API}/api/expenses`, form); toast.success('Qo\'shildi'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Xatolik'); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/expenses/${id}`); toast.success('O\'chirildi'); setDeleteOpen(null); fetchData(); } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-5 lg:ml-0 ml-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-800">Xarajatlar</h1><p className="text-sm text-gray-500">Jami: {totalAmount.toLocaleString()} so'm</p></div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/20"><Plus size={18}/> Yangi</button>
      </div>

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Oylik xarajatlar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
              <XAxis dataKey="month" tick={{fontSize:11}}/>
              <YAxis tick={{fontSize:11}}/>
              <Tooltip formatter={(v)=>`${v.toLocaleString()} so'm`}/>
              <Bar dataKey="amount" fill="#e63946" radius={[8,8,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Qidirish..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/30 outline-none bg-white"/>
        </div>
        <select value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1)}} className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-green-500/30 outline-none">
          <option value="">Barcha kategoriyalar</option>
          <option value="feed">Yem</option><option value="medicine">Dori</option><option value="equipment">Jihozlar</option>
          <option value="labor">Ish haqi</option><option value="utilities">Kommunal</option><option value="other">Boshqa</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-600 text-left">
              <th className="px-4 py-3 font-semibold">Sana</th>
              <th className="px-4 py-3 font-semibold">Kategoriya</th>
              <th className="px-4 py-3 font-semibold">Tavsif</th>
              <th className="px-4 py-3 font-semibold">Summa</th>
              <th className="px-4 py-3 font-semibold">To'lov usuli</th>
              <th className="px-4 py-3 font-semibold">Amallar</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length===0?(<tr><td colSpan="6" className="text-center py-10 text-gray-400">Ma'lumot topilmadi</td></tr>)
              :paginated.map(r=>(
                <tr key={r._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">{r.date?.slice(0,10)}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 font-medium">{catLabels[r.category]||r.category}</span></td>
                  <td className="px-4 py-3">{r.description}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{r.amount?.toLocaleString()} so'm</td>
                  <td className="px-4 py-3">{payLabels[r.paymentMethod]||r.paymentMethod}</td>
                  <td className="px-4 py-3"><div className="flex gap-1"><button onClick={()=>openEdit(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={16}/></button><button onClick={()=>setDeleteOpen(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={16}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100"><p className="text-sm text-gray-500">{(page-1)*perPage+1}–{Math.min(page*perPage,filtered.length)} / {filtered.length}</p><div className="flex gap-1">{Array.from({length:totalPages},(_,i)=>(<button key={i} onClick={()=>setPage(i+1)} className={`px-3 py-1 rounded-lg text-sm ${page===i+1?'bg-green-500 text-white':'hover:bg-gray-100 text-gray-600'}`}>{i+1}</button>))}</div></div>)}
      </div>

      {modalOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setModalOpen(false)}>
        <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
          <div className="flex justify-between items-center mb-5"><h3 className="text-lg font-bold">{editing?'Tahrirlash':'Yangi xarajat'}</h3><button onClick={()=>setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20}/></button></div>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"><option value="feed">Yem</option><option value="medicine">Dori</option><option value="equipment">Jihozlar</option><option value="labor">Ish haqi</option><option value="utilities">Kommunal</option><option value="other">Boshqa</option></select>
            </div>
            <input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Tavsif" required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} placeholder="Summa (so'm)" required className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
              <select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"><option value="cash">Naqd</option><option value="card">Karta</option><option value="transfer">O'tkazma</option></select>
            </div>
            <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Izoh" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30" rows={2}/>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium transition">{editing?'Saqlash':'Qo\'shish'}</button>
          </form>
        </div>
      </div>)}

      {deleteOpen&&(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center"><div className="w-14 h-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4"><Trash2 size={24} className="text-red-500"/></div><h3 className="text-lg font-bold mb-2">O'chirishni tasdiqlang</h3><p className="text-gray-500 text-sm mb-5">Bu yozuvni o'chirmoqchimisiz?</p><div className="flex gap-3"><button onClick={()=>setDeleteOpen(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Bekor qilish</button><button onClick={()=>handleDelete(deleteOpen)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">O'chirish</button></div></div></div>)}
    </div>
  );
}
