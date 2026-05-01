import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#f5f5f0]">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
