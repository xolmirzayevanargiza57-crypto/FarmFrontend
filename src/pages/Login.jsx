import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        toast.success("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
      } else {
        await login(email, password);
        toast.success("Tizimga kirdingiz!");
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-4xl shadow-2xl shadow-green-500/30 mb-4">
            🐔
          </div>
          <h1 className="text-3xl font-bold text-white">Ferma Pro</h1>
          <p className="text-gray-400 mt-1">Parrandachilik boshqaruv tizimi</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">
            {isRegister ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ismingiz"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Parol"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Yuklanmoqda...
                </span>
              ) : (isRegister ? "Ro'yxatdan o'tish" : 'Kirish')}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            {isRegister ? 'Akkountingiz bormi?' : "Akkountingiz yo'qmi?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-emerald-400 hover:text-emerald-300 font-semibold">
              {isRegister ? 'Kirish' : "Ro'yxatdan o'tish"}
            </button>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs mt-6">Demo: admin@farm.uz / admin123</p>
      </div>
    </div>
  );
}
