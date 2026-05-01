import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Bird, Egg, Wheat, HeartPulse, ShoppingCart,
  Receipt, BarChart3, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Bosh sahifa', icon: LayoutDashboard },
  { to: '/flocks', label: 'Podalar', icon: Bird },
  { to: '/eggs', label: 'Tuxum ishlab chiqarish', icon: Egg },
  { to: '/feed', label: 'Yem hisobi', icon: Wheat },
  { to: '/health', label: "Sog'liq nazorati", icon: HeartPulse },
  { to: '/sales', label: 'Savdo hisobi', icon: ShoppingCart },
  { to: '/expenses', label: 'Xarajatlar', icon: Receipt },
  { to: '/reports', label: 'Hisobotlar', icon: BarChart3 },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-[260px]'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xl font-bold shrink-0">
          🐔
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight">Ferma Pro</h1>
            <p className="text-xs text-gray-400">Boshqaruv tizimi</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/10 transition">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/20 text-emerald-300 shadow-lg shadow-green-900/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'}`
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Branding (No Logout) */}
      <div className="p-5 border-t border-white/5 text-center">
         {!collapsed && (
           <div className="opacity-50">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Professional Edition</p>
             <p className="text-[9px] mt-1 font-bold italic">Barcha huquqlar himoyalangan</p>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#1a1a2e] text-white p-2 rounded-xl shadow-lg"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="h-full" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>
    </>
  );
}
