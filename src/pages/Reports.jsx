import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Printer, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

export default function Reports() {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [eggs, setEggs] = useState([]);
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, e, eg, f] = await Promise.all([
        axios.get(`${API}/api/sales`),
        axios.get(`${API}/api/expenses`),
        axios.get(`${API}/api/eggs`),
        axios.get(`${API}/api/flocks`)
      ]);
      setSales(s.data); setExpenses(e.data); setEggs(eg.data); setFlocks(f.data);
    } catch { toast.error('Yuklanmadi'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const inRange = (d) => {
    const date = new Date(d);
    return date >= new Date(dateFrom) && date <= new Date(dateTo + 'T23:59:59');
  };

  const filteredSales = sales.filter(s => inRange(s.date));
  const filteredExpenses = expenses.filter(e => inRange(e.date));
  const filteredEggs = eggs.filter(e => inRange(e.date));

  const totalRevenue = filteredSales.reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalExpense = filteredExpenses.reduce((s, r) => s + (r.amount || 0), 0);
  const profit = totalRevenue - totalExpense;

  const totalEggs = filteredEggs.reduce((s, e) => s + (e.eggsCollected || 0), 0);
  const totalBroken = filteredEggs.reduce((s, e) => s + (e.brokenEggs || 0), 0);
  const eggEfficiency = totalEggs > 0 ? (((totalEggs - totalBroken) / totalEggs) * 100).toFixed(1) : 0;

  const activeFlocks = flocks.filter(f => f.status === 'active');
  const totalBirds = activeFlocks.reduce((s, f) => s + (f.quantity || 0), 0);

  // Expense breakdown
  const expenseBreakdown = filteredExpenses.reduce((acc, e) => {
    const cat = e.category || 'other';
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  const catLabels = { feed: 'Yem', medicine: 'Dori', equipment: 'Jihozlar', labor: 'Ish haqi', utilities: 'Kommunal', other: 'Boshqa' };

  const handlePrint = () => window.print();

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6 lg:ml-0 ml-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-gray-800">Hisobotlar</h1><p className="text-sm text-gray-500">Moliyaviy va ishlab chiqarish hisobotlari</p></div>
        <button onClick={handlePrint} className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-lg shadow-green-500/20 print:hidden"><Printer size={18}/> Chop etish</button>
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 print:hidden">
        <Calendar size={20} className="text-gray-500"/>
        <span className="text-sm text-gray-600 font-medium">Davr:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
        <span className="text-gray-400">—</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/30"/>
      </div>

      {/* Profit/Loss Statement */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-800">Foyda / Zarar hisoboti</h3></div>
        <div className="p-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100"><td className="py-3 font-medium text-gray-700">Jami daromad (savdolar)</td><td className="py-3 text-right font-semibold text-green-600">{totalRevenue.toLocaleString()} so'm</td></tr>
              <tr className="border-b border-gray-100"><td className="py-3 font-medium text-gray-700">Jami xarajatlar</td><td className="py-3 text-right font-semibold text-red-600">-{totalExpense.toLocaleString()} so'm</td></tr>
              <tr className="bg-gray-50">
                <td className="py-4 font-bold text-gray-800 text-lg">Sof foyda / zarar</td>
                <td className={`py-4 text-right font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toLocaleString()} so'm
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-800">Xarajatlar tafsiloti</h3></div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-600"><th className="text-left py-2 font-semibold">Kategoriya</th><th className="text-right py-2 font-semibold">Summa</th><th className="text-right py-2 font-semibold">Ulushi</th></tr></thead>
            <tbody>
              {Object.entries(expenseBreakdown).map(([cat, amount]) => (
                <tr key={cat} className="border-t border-gray-50">
                  <td className="py-2.5 text-gray-700">{catLabels[cat] || cat}</td>
                  <td className="py-2.5 text-right font-medium">{amount.toLocaleString()} so'm</td>
                  <td className="py-2.5 text-right text-gray-500">{totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Efficiency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Jami tuxum yig'ilgan</p>
          <p className="text-2xl font-bold text-gray-800">{totalEggs.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Tuxum samaradorligi</p>
          <p className="text-2xl font-bold text-green-600">{eggEfficiency}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Faol podalar</p>
          <p className="text-2xl font-bold text-gray-800">{activeFlocks.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Faol qushlar soni</p>
          <p className="text-2xl font-bold text-gray-800">{totalBirds.toLocaleString()}</p>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-lg font-semibold text-gray-800">Savdo xulosasi</h3></div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-2">Jami savdolar soni: <span className="font-semibold text-gray-800">{filteredSales.length}</span></p>
          <p className="text-sm text-gray-500 mb-2">To'langan: <span className="font-semibold text-green-600">{filteredSales.filter(s => s.paymentStatus === 'paid').length}</span></p>
          <p className="text-sm text-gray-500 mb-2">Kutilmoqda: <span className="font-semibold text-yellow-600">{filteredSales.filter(s => s.paymentStatus === 'pending').length}</span></p>
          <p className="text-sm text-gray-500">Qisman: <span className="font-semibold text-orange-600">{filteredSales.filter(s => s.paymentStatus === 'partial').length}</span></p>
        </div>
      </div>
    </div>
  );
}
