import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden relative w-full">
        {/* Dark Mode Background Effects */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/10 blur-[120px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
