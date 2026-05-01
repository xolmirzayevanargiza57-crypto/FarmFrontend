import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Pencil, Trash2, Search, X, HeartPulse, ShieldAlert, Syringe, Skull, FileText, Calendar, LayoutGrid, ClipboardCheck, Filter, AlertTriangle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const typeConfig = {
  vaccination: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Syringe, label: 'Emlash' },
  checkup: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ClipboardCheck, label: 'Tekshiruv' },
  medication: { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: PillIcon, label: 'Dori berish' },
  mortality: { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: Skull, label: 'O\'lim holati' },
  disease: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: ShieldAlert, label: 'Kasallik' }
};

function PillIcon({size}) { return <div style={{width:size, height:size}} className="border-2 border-current rounded-full flex items-center justify-center font-bold text-[8px] leading-none">💊</div>; }

const emptyRecord = { flockId: '', date: '', recordType: 'checkup', description: '', mortalityCount: 0, nextCheckDate: '', notes: '' };

export default function Health() {
  const [records, setRecords] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(null);
  const [form, setForm] = useState(emptyRecord);
  const [editing, setEditing] = useState(null);
  const perPage = 10;

  const fetchData = async () => {
    try {
      const [r, f] = await Promise.all([
        axios.get(`${API}/api/health`),
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
    (typeFilter ? r.recordType === typeFilter : true)
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const openAdd = () => { setForm({ ...emptyRecord, date: new Date().toISOString().slice(0, 10) }); setEditing(null); setModalOpen(true); };
  const openEdit = (r) => { setForm({ ...r, flockId: r.flockId?._id, date: r.date?.slice(0, 10), nextCheckDate: r.nextCheckDate?.slice(0, 10) }); setEditing(r._id); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.put(`${API}/api/health/${editing}`, form);
        toast.success('Yangilandi');
      } else {
        await axios.post(`${API}/api/health`, form);
        toast.success('Yozildi');
      }
      setModalOpen(false);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/health/${id}`);
      toast.success('O\'chirildi');
      setDeleteOpen(null);
      fetchData();
    } catch { toast.error('Xatolik'); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white/50 animate-pulse"><div className="h-14 w-14 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div><p className="text-rose-600 font-black uppercase text-[10px] tracking-widest italic">Yuklanmoqda...</p></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10 p-2 italic font-bold">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-rose-50 italic">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 shadow-inner group">
            <HeartPulse size={32} className="group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter uppercase">SOG'LIQ <span className="text-rose-600">JURNALI</span></h1>
            <p className="text-sm font-bold text-gray-400">Kasalliklar, vaksinalar va tekshiruvlar</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center justify-center gap-3 bg-gradient-to-br from-rose-500 to-rose-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-rose-500/30 hover:-translate-y-1 active:scale-95 transition-all uppercase text-sm tracking-tighter">
          <Plus size={22} className="stroke-[3]" /> Yangi Qayd Qo'shish
        </button>
      </div>

      {/* Analytics Mini-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Jami O'lim", value: filtered.reduce((s,r)=>s+(r.mortalityCount||0),0), icon: Skull, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: "Vaksinalar", value: filtered.filter(r=>r.recordType === 'vaccination').length, icon: Syringe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: "Kasalliklar", value: filtered.filter(r=>r.recordType === 'disease').length, icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: "Kelgusi rejalar", value: filtered.filter(r=>r.nextCheckDate && new Date(r.nextCheckDate) > new Date()).length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' }
        ].map((s,i)=>(
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color} z-10 transition-transform group-hover:scale-110 shadow-inner`}><s.icon size={26} /></div>
            <div className="z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{s.label}</p>
              <p className={`text-2xl font-black ${s.color} font-mono tracking-tighter`}>{s.value.toLocaleString()}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${s.color} opacity-[0.03] transform rotate-12 group-hover:scale-150 transition-transform`}><s.icon size={80} /></div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            placeholder="Poda nomi bo'yicha tahlil qilish..." 
            className="w-full pl-14 pr-6 py-4.5 border-2 border-gray-100 rounded-3xl outline-none focus:border-rose-300 focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-700 bg-white shadow-sm font-black"
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            value={typeFilter} 
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }} 
            className="pl-14 pr-12 py-4.5 bg-white border-2 border-gray-100 rounded-3xl outline-none font-black text-gray-600 appearance-none cursor-pointer focus:border-rose-300 transition-all shadow-sm"
          >
            <option value="">Barcha turlar</option>
            {Object.keys(typeConfig).map(k => <option key={k} value={k}>{typeConfig[k].label}</option>)}
          </select>
        </div>
      </div>

      {/* Excel Style Data Table */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 italic">
                <th className="px-8 py-6 text-gray-400 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><Calendar size={14}/> Sana</div></th>
                <th className="px-8 py-6 text-gray-800 font-black uppercase tracking-widest text-xs"><div className="flex items-center gap-2"><LayoutGrid size={14}/> Poda</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><HeartPulse size={14}/> Qayd turi</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs"><div className="flex items-center gap-2"><FileText size={14}/> Tavsif</div></th>
                <th className="px-8 py-6 text-rose-600 font-black uppercase tracking-wider text-xs text-center"><div className="flex items-center justify-center gap-2"><Skull size={14}/> O'lim</div></th>
                <th className="px-8 py-6 text-gray-500 font-bold uppercase tracking-wider text-xs text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((r, idx) => {
                const TConfig = typeConfig[r.recordType] || { label: r.recordType, icon: FileText, color: 'bg-gray-100' };
                return (
                  <tr key={r._id} className={`group hover:bg-rose-50/30 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/5'}`}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-black text-gray-500 bg-white border border-gray-100 px-3 py-1 rounded-xl shadow-sm inline-block w-fit">{r.date?.slice(0, 10)}</span>
                        {r.nextCheckDate && (
                          <span className="text-[9px] text-blue-500 mt-1 uppercase tracking-tighter">Navbatdagi: {r.nextCheckDate.slice(0,10)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-black text-base uppercase tracking-tighter group-hover:text-rose-600 transition-colors">{r.flockId?.name || '---'}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-sans tracking-widest">{r.flockId?.breed}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-[1.25rem] border ${TConfig.color}`}>
                        <TConfig.icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{TConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-[250px]">
                      <p className="text-gray-600 text-xs font-bold leading-relaxed line-clamp-2 italic">{r.description}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {r.mortalityCount > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-black text-rose-600 font-mono tracking-tighter italic">-{r.mortalityCount}</span>
                          <span className="text-[9px] text-rose-400 uppercase tracking-widest font-black leading-none">O'lim</span>
                        </div>
                      ) : <span className="text-gray-300 font-mono text-xl">0</span>}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button onClick={() => openEdit(r)} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white shadow-sm transition-all"><Pencil size={20} /></button>
                        <button onClick={() => setDeleteOpen(r._id)} className="p-3.5 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white shadow-sm transition-all"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-10 py-6 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 py-3 bg-white rounded-[2rem] border border-gray-200 shadow-sm italic">
            {(page - 1) * perPage + 1} – {Math.min(page * perPage, filtered.length)} / {filtered.length} SOG'LIQ QAYDLARI
          </p>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-rose-600 hover:border-rose-200 disabled:opacity-30 transition-all shadow-sm">Oldingi</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i+1)} className={`w-12 h-12 rounded-2xl font-black text-sm transition-all ${page === i+1 ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-100'}`}>{i+1}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-6 py-3 bg-white rounded-2xl border border-gray-100 text-xs font-black text-gray-400 hover:text-rose-600 hover:border-rose-200 disabled:opacity-30 transition-all shadow-sm">Keyingi</button>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-xl p-0 shadow-2xl border border-white/20 animate-in zoom-in-95 overflow-hidden italic font-bold">
            <div className="bg-rose-500 p-8 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-12 -translate-y-12 animate-pulse"></div>
              <div className="flex items-center gap-4 relative z-10">
                <HeartPulse size={32} className="animate-bounce" />
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{editing ? 'Qaydni tahrirlash' : 'Yangi salomatlik qaydi'}</h3>
                  <p className="text-[10px] opacity-80 font-black tracking-widest uppercase">Fermani himoya qilish va nazorat</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all relative z-10"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 bg-[#fafafa]">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Poda tanlash</label>
                  <select value={form.flockId} onChange={e => setForm({...form, flockId: e.target.value})} required className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-700 font-black shadow-sm">
                    <option value="">Podani tanlang</option>
                    {flocks.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Sana</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-700 font-mono shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Qayd turi</label>
                  <select value={form.recordType} onChange={e => setForm({...form, recordType: e.target.value})} className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-700 font-black shadow-sm uppercase">
                    {Object.keys(typeConfig).map(k => <option key={k} value={k}>{typeConfig[k].label}</option>)}
                  </select>
                </div>
                {form.recordType === 'mortality' && (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-1">O'lim soni (Tovoqlar)</label>
                    <input type="number" value={form.mortalityCount} onChange={e => setForm({...form, mortalityCount: e.target.value})} placeholder="0" className="w-full px-6 py-5 bg-rose-50/50 border border-rose-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-rose-700 font-black text-2xl shadow-sm" />
                  </div>
                )}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tavsif (Nima bo'ldi?)</label>
                  <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Masalan: Gumboro vaksina berildi yoki podada tumov aniqlandi" required className="w-full px-6 py-5 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-8 focus:ring-rose-500/5 transition-all text-gray-800 font-bold shadow-sm italic" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2"><AlertTriangle size={14}/> Keyingi tekshiruv (Ixtiyoriy)</label>
                  <input type="date" value={form.nextCheckDate} onChange={e => setForm({...form, nextCheckDate: e.target.value})} className="w-full px-6 py-5 bg-blue-50/20 border border-blue-100 rounded-2xl outline-none focus:ring-8 focus:ring-blue-500/5 transition-all text-blue-700 font-mono shadow-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-gradient-to-r from-rose-500 to-rose-700 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-rose-500/30 hover:scale-[1.02] active:scale-100 transition-all uppercase tracking-tighter">
                {editing ? 'O\'zgartirishlarni Saqlash' : 'Ma\'lumotni Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in italic">
          <div className="bg-white rounded-[3.5rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-rose-50 font-black relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-24 h-24 mx-auto bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-inner group-hover:rotate-12 transition-transform"><Trash2 size={40}/></div>
            <h3 className="text-3xl font-black text-gray-800 mb-3 uppercase tracking-tighter">O'chirib tashlaymi?</h3>
            <p className="text-gray-400 text-sm mb-12 font-bold leading-relaxed px-4">Bu yozuvni o'chirsangiz, uni qayta tiklab bo'lmaydi. Ishonchingiz komilmi?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteOpen(null)} className="flex-1 py-5 border-2 border-gray-100 rounded-3xl font-black text-gray-400 hover:bg-gray-50 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Yo'q</button>
              <button onClick={() => handleDelete(deleteOpen)} className="flex-1 py-5 bg-rose-500 text-white rounded-3xl font-black hover:bg-rose-600 shadow-xl shadow-rose-500/30 uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95">Ha, albatta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
