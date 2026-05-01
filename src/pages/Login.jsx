import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Tizimga muvaffaqiyatli kirdingiz!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email yoki parol noto\'g\'ri');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4 text-sans">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-5xl shadow-2xl shadow-green-500/40 mb-6">
              🐔
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 rounded-full border-4 border-[#1a1a2e] flex items-center justify-center text-white">
              <ShieldCheck size={16} />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Ferma <span className="text-emerald-400">Pro</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Professional parrandachilik boshqaruv tizimi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Tizimga kirish</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Email manzilingiz</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="admin@farm.uz"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Parolingiz</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 transition-all duration-300"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/25 hover:from-emerald-600 hover:to-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Tekshirilmoqda...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Kirish
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Xavfsiz tizim</p>
            <p className="text-gray-400 text-xs mt-3 leading-relaxed italic">Ushbu tizim faqat ferma ma'murlari uchun mo'ljallangan. Kirish uchun maxsus ruxsatnoma talab etiladi.</p>
          </div>
        </div>

        <p className="text-center text-gray-500/50 text-[10px] uppercase font-bold mt-8 tracking-tighter">Demo: admin@farm.uz / admin123</p>
      </div>
    </div>
  );
}
