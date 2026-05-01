import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bird, Egg, Wheat, HeartPulse, ShoppingCart,
  Receipt, BarChart3, ChevronLeft, ChevronRight, Menu, X, Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/', label: 'Bosh sahifa', icon: LayoutDashboard },
  { to: '/flocks', label: 'Podalar', icon: Bird },
  { to: '/eggs', label: 'Tuxum hajmi', icon: Egg },
  { to: '/feed', label: 'Yem sarfi', icon: Wheat },
  { to: '/health', label: "Sog'liq muhofazasi", icon: HeartPulse },
  { to: '/sales', label: 'Savdo tarixi', icon: ShoppingCart },
  { to: '/expenses', label: 'Xarajatlar', icon: Receipt },
  { to: '/reports', label: 'Hisobotlar', icon: BarChart3 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'}`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
          <Activity size={24} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Ferma Pro</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Boshqaruv Tizimi</p>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="ml-auto hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group
              ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`
            }
          >
            <item.icon size={20} className={`shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
            {!collapsed && <span className="tracking-wide">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding */}
      <div className={`p-6 border-t border-slate-800 transition-all ${collapsed ? 'text-center' : ''}`}>
         {!collapsed ? (
           <div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Professional License</p>
             <p className="text-xs text-slate-600 font-medium tracking-wide">© 2026 Barcha huquqlar himoyalangan.</p>
           </div>
         ) : (
           <Activity size={20} className="text-slate-600 mx-auto" />
         )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Header (Visible only on small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Activity size={18} />
          </div>
          <h1 className="text-lg font-black text-white tracking-tight uppercase">Ferma Pro</h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Spacer for mobile header so content doesn't get hidden underneath */}
      <div className="lg:hidden h-[60px] w-full shrink-0"></div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" 
          onClick={() => setMobileOpen(false)}
        >
          <div 
            className="absolute top-0 right-0 max-w-[280px] w-full h-full shadow-2xl animate-in slide-in-from-right-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile Sidebar Close Button inside drawer */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 shadow-2xl z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
