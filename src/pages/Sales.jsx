import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, ShoppingCart, User, Hash, LayoutGrid, Calendar, Boxes, CircleDollarSign, CreditCard, ChevronRight, Filter, TrendingUp } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusConfig = { 
  paid: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'To\'langan' }, 
  pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Kutilmoqda' }, 
  partial: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Qisman' } 
};

const emptyRecord = { customerName: '', date: '', productType: 'eggs', amount: '', unit: 'dona', totalAmount: '', paymentStatus: 'pending', notes: '' };

export default function Sales() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const [editing, setEditing] = useState(null);
  const perPage = 10;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/sales`);
      setRecords(res.data);
    } catch { toast.error('Yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    r.customerName.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? r.paymentStatus === statusFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/api/sales/${editing}`, form);
        toast.success('Yangilandi');
      } else {
        await axios.post(`${API}/api/sales`, form);
        toast.success('Yozildi');
      }
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/sales/${id}`);
      toast.success('O\'chirildi');
      setDeleteOpen(null);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-24 gap-3"><div className="h-14 w-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div><p className="text-emerald-700 font-black uppercase text-[10px] tracking-widest italic animate-pulse">Savdolar yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2 italic font-bold">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 italic">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner group">
            <ShoppingCart size={32} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase leading-none mb-1">SAVDO <span className="text-indigo-600">REKORDLARI</span></h1>
            <p className="text-sm font-bold text-gray-400">Mijozlar va mablag' harakati</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-500 to-blue-700 text-white px-8 py-4.5 rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 transition-all uppercase text-sm tracking-tighter">
          <Plus size={22} className="stroke-[3]" /> Yangi Savdo
        </button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Jami Savdo", value: filtered.reduce((s,r)=>s+r.totalAmount,0), icon: CircleDollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: "To'langan", value: filtered.filter(r=>r.paymentStatus==='paid').reduce((s,r)=>s+r.totalAmount,0), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Qarzlar", value: filtered.filter(r=>r.paymentStatus!=='paid').reduce((s,r)=>s+r.totalAmount,0), icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: "Savdolar soni", value: filtered.length, icon: Hash, color: 'text-gray-600', bg: 'bg-gray-100' }
        ].map((s,i)=>(
          <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} z-10 shadow-inner group-hover:scale-110 transition-transform`}><s.icon size={26} /></div>
            <div className="z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} font-mono tracking-tighter`}>{s.value.toLocaleString()}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${s.color} opacity-[0.03] transform rotate-12`}><s.icon size={80} /></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Mijoz ismi yoki mahsulot bo'yicha qidiruv..." 
            className="w-full pl-14 pr-6 py-4.5 border-2 border-gray-100 rounded-[1.75rem] outline-none focus:border-indigo-300 focus:ring-8 focus:ring-indigo-500/5 transition-all text-gray-700 bg-white font-black"
          />
        </div>
        <div className="relative min-w-[220px]">
          <Filter size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }} 
            className="w-full pl-14 pr-12 py-4.5 bg-white border-2 border-gray-100 rounded-[1.75rem] outline-none font-black text-gray-600 appearance-none cursor-pointer focus:border-indigo-300 transition-all shadow-sm"
          >
            <option value="">Barcha To'lovlar</option>
            {Object.keys(statusConfig).map(k => <option key={k} value={k}>{statusConfig[k].label}</option>)}
          </select>
        </div>
      </div>

      {/* Excel Style Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-6 text-gray-400 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-8 py-6 text-gray-800 font-black uppercase tracking-widest text-xs"><div className="flex items-center gap-2"><User size={14}/> Mijoz Nomi</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Mahsulot</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><Boxes size={14}/> Miqdor</div></th>
                <th className="px-8 py-6 text-indigo-600 font-black uppercase tracking-wider text-xs text-right"><div className="flex items-center justify-end gap-2"><CircleDollarSign size={14}/> Summa</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><CreditCard size={14}/> Holat</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((r, idx) => (
                <tr key={r._id} className={`group hover:bg-indigo-50/30 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/5'}`}>
                  <td className="px-8 py-7">
                    <span className="font-mono text-xs font-black text-gray-500 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm">{r.date?.slice(0, 10)}</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col">
                      <span className="text-gray-800 font-black text-base uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{r.customerName}</span>
                      <span className="text-[10px] text-gray-400 font-medium tracking-[0.2em]">{r.notes?.slice(0, 20)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 uppercase text-[10px] tracking-widest text-gray-500">{r.productType}</td>
                  <td className="px-8 py-7 text-center">
                    <span className="text-xl font-black text-gray-700 font-mono tracking-tighter italic">{r.amount?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">{r.unit}</span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <span className="text-xl font-black text-indigo-600 font-mono tracking-tighter">{r.totalAmount?.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 ml-1 font-bold">so'm</span>
                  </td>
                  <td className="px-8 py-7">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${statusConfig[r.paymentStatus]?.color}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                      {statusConfig[r.paymentStatus]?.label}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <button onClick={() => openEdit(r)} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white shadow-sm transition-all"><Pencil size={20} /></button>
                      <button onClick={() => setDeleteOpen(r._id)} className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white shadow-sm transition-all"><Trash2 size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-7 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-3 bg-white rounded-[2rem] border border-gray-200 shadow-sm italic">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} SAVDO REKORDLARI
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-indigo-600 transition-all">Oldingi</button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-11 h-11 rounded-2xl font-black text-sm transition-all ${page === i+1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'bg-white border border-gray-100 text-gray-400'}`}>{i+1}</button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-indigo-600 transition-all">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-0 shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden italic font-bold">
            <div className="bg-indigo-600 p-10 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-12 -translate-y-12"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner animate-pulse"><ShoppingCart size={28}/></div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">{editing ? 'Savdoni tahrirlash' : 'Yangi Savdo'}</h3>
                  <p className="text-[10px] opacity-80 font-black tracking-widest uppercase">Mijozlar bilan hamkorlik jurnali</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all relative z-10"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-7 bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mijoz Ism-sharifi</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Masalan: Aziz Rahimov" required className="w-full pl-14 pr-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all text-gray-800 font-black shadow-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-mono text-sm shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mahsulot</label>
                  <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value})} className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black shadow-sm uppercase italic">
                    <option value="eggs">Tuxum</option><option value="chicken">Tovuq</option><option value="manure">Go'ng</option><option value="other">Boshqa</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Miqdor</label>
                  <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" required className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black text-lg shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">O'lchov birliği</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="dona / kg" required className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black text-gray-500 shadow-sm uppercase" />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Jami To'lov (so'm)</label>
                  <input type="number" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} placeholder="0" required className="w-full px-6 py-4.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black text-2xl text-indigo-700 shadow-sm" />
                </div>
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To'lov Holati</label>
                  <select value={form.paymentStatus} onChange={e => setForm({...form, paymentStatus: e.target.value})} className="w-full px-6 py-4.5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-indigo-500/5 transition-all font-black shadow-sm uppercase italic">
                    <option value="pending">Kutilmoqda</option><option value="paid">To'langan</option><option value="partial">Qisman</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.25rem] font-black text-xl shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-100 transition-all uppercase tracking-tighter">
                {editing ? 'Savdoni Yangilash' : 'Savdoni Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1a1a2e]/70 backdrop-blur-md p-4 animate-in fade-in italic font-black">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-indigo-50 relative overflow-hidden group">
            <div className="w-24 h-24 mx-auto bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-8 border border-indigo-100 shadow-inner scale-110 group-hover:rotate-12 transition-transform"><Trash2 size={40}/></div>
            <h3 className="text-3xl font-black text-gray-800 mb-3 uppercase tracking-tighter">O'chirib tashlaymi?</h3>
            <p className="text-gray-400 text-sm mb-12 font-bold italic leading-relaxed px-4">Bu savdo yozuvini o'chirsangiz, uni qayta tiklab bo'lmaydi. Ishonchingiz komilmi?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-5 border-2 border-gray-100 rounded-3xl font-black text-gray-400 hover:bg-gray-50 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Ha, albatta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
