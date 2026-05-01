import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-x-hidden relative">
        {/* Ambient Dark Mode Background Glows */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
