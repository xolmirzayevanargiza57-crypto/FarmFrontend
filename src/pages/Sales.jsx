import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, ShoppingCart, Filter, Calendar, DollarSign, Package, User, Hash, CheckCircle2, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const statusConfig = { 
  paid: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2, label: 'To\'langan' }, 
  pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock, label: 'Kutilmoqda' }
};

const emptyRecord = { saleId: '', date: '', productType: 'tuxum', quantity: '', unitPrice: '', customerName: '', status: 'paid', notes: '' };

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
  const [saving, setSaving] = useState(false);
  const perPage = 10;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/api/sales`);
      setRecords(res.data);
    } catch { toast.error("Ma'lumot yuklashda xatolik"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r =>
    (r.customerName || '').toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? r.status === statusFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, date: r.date?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`${API}/api/sales/${editing}`, form);
        toast.success("Savdo rekordi yangilandi");
      } else {
        await axios.post(`${API}/api/sales`, form);
        toast.success("Yangi savdo qo'shildi");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error("Xatolik yuz berdi"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API}/api/sales/${id}`); toast.success("Yozuv o'chirildi"); setDeleteOpen(null); fetchData(); } 
    catch { toast.error("O'chirishda xatolik"); }
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
            Savdo <span className="text-indigo-500">Tarixi</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 tracking-wide">Fermaning barcha kiruvchi daromad nazorati</p>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          <Plus size={18} /> Yangi Savdo
        </button>
      </div>

      {/* Analytics Mini-Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Jami Daromad", value: `${filtered.reduce((s,r)=>s+(r.totalAmount||0),0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', suffix: " so'm" },
          { label: "Tuxum Savdosi (Dona)", value: filtered.filter(f=>f.productType==='tuxum').reduce((s,r)=>s+r.quantity,0).toLocaleString(), icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', suffix: '' },
          { label: "Kutilayotgan To'lovlar", value: filtered.filter(f=>f.status==='pending').length, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', suffix: ' ta' }
        ].map((s,i)=>(
          <div key={i} className={`p-6 rounded-[2rem] border ${s.border} ${s.bg} flex items-center gap-4 shadow-lg group hover:-translate-y-1 transition-transform`}>
            <div className={`w-14 h-14 shrink-0 rounded-2xl bg-slate-900/50 flex items-center justify-center ${s.color} border border-white/5`}>
              <s.icon size={26} strokeWidth={2.5}/>
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color} tracking-tighter leading-none mb-1`}>{s.value}<span className="text-sm">{s.suffix}</span></p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
            <Search size={20} className="group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Xaridor nomi bo'yicha qidirish..." 
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
            <option value="paid" className="bg-slate-900">To'langan</option>
            <option value="pending" className="bg-slate-900">Kutilmoqda (Qarz)</option>
          </select>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800">
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-6 py-5 text-white font-black uppercase tracking-[0.2em] text-[10px]"><div className="flex items-center gap-2"><User size={14}/> Xaridor</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap"><div className="flex items-center gap-2"><Package size={14}/> Mahsulot</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><Hash size={14}/> Miqdor</div></th>
                <th className="px-6 py-5 text-emerald-400 font-bold uppercase tracking-widest text-[10px] text-center"><div className="flex items-center justify-center gap-2"><DollarSign size={14}/> Jami (So'm)</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px]"><div className="flex items-center gap-2"><CheckCircle2 size={14}/> Holat</div></th>
                <th className="px-6 py-5 text-slate-400 font-bold uppercase tracking-widest text-[10px] text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Ma'lumot topilmadi</p>
                  </td>
                </tr>
              ) : paginated.map((r) => {
                const StatusIcon = statusConfig[r.status]?.icon || Clock;
                return (
                  <tr key={r._id} className="group hover:bg-slate-800/30 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 max-w-max">{r.saleId || 'Savdo'}</span>
                         <span className="font-mono text-[10px] text-slate-500 ml-1">{r.date?.slice(0, 10)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-black text-sm uppercase tracking-wide group-hover:text-indigo-400 transition-colors">{r.customerName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-300 font-bold uppercase tracking-widest text-[11px] bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20">{r.productType}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-black text-white font-mono">{r.quantity?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-black text-emerald-400 font-mono tracking-tighter drop-shadow-sm">{(r.totalAmount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${statusConfig[r.status]?.color}`}>
                        <StatusIcon size={12} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">{statusConfig[r.status]?.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 pr-2">
                        <button onClick={() => openEdit(r)} className="p-2.5 rounded-xl bg-slate-800 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors border border-slate-700">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setDeleteOpen(r._id)} className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors border border-slate-700">
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
            {filtered.length > 0 ? (page - 1) * perPage + 1 : 0} – {Math.min(page * perPage, filtered.length)} / {filtered.length} Yozuvlar
          </p>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-50 text-sm">Orqaga</button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-bold hover:text-indigo-400 transition-colors disabled:opacity-50 text-sm">Oldinga</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{editing ? 'Savdoni Tahrirlash' : 'Yangi Savdo'}</h3>
                  <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Sotish Operatsiyasi</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-500 hover:text-white bg-slate-800 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2 flex flex-col sm:flex-row gap-6">
                   <div className="flex-1 space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sana</label>
                     <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-mono transition-colors" />
                   </div>
                   <div className="flex-1 space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Xaridor</label>
                     <input value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="Ism yoki Tashkilot" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold transition-colors uppercase" />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mahsulot Turi</label>
                  <select value={form.productType} onChange={e => setForm({...form, productType: e.target.value})} className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-slate-200 font-bold transition-colors">
                    <option value="tuxum" className="bg-slate-900">Tuxum</option>
                    <option value="tovuq" className="bg-slate-900">Tovuq (Go'sht/Tirik)</option>
                    <option value="go'ng" className="bg-slate-900">Go'ng (O'g'it)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To'lov Holati</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-slate-200 font-bold transition-colors">
                    <option value="paid" className="bg-slate-900">To'langan</option>
                    <option value="pending" className="bg-slate-900">Kutilmoqda (Qarz)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soni / Miqdor</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-black text-xl transition-colors" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Birlik Narxi (So'm)</label>
                  <input type="number" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} placeholder="0" required className="w-full px-5 py-3 bg-slate-800/80 border border-slate-700 rounded-xl outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-black text-xl transition-colors" />
                </div>
                
                <div className="space-y-2 sm:col-span-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Jami Hisoblangan Summa</label>
                    <span className="text-2xl font-black text-emerald-400 font-mono">{(Number(form.quantity || 0) * Number(form.unitPrice || 0)).toLocaleString()} so'm</span>
                  </div>
                </div>

              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row gap-4">
                <button type="button" onClick={() => setModalOpen(false)} disabled={saving} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 uppercase tracking-widest text-xs transition-colors">Bekor Qilish</button>
                <button type="submit" disabled={saving} className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50">
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
            <p className="text-slate-400 text-sm mb-8 font-medium">Ushbu tranzaksiyani abadiyga o'chirasizmi?</p>
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
