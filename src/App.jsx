import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Flocks from './pages/Flocks';
import Eggs from './pages/Eggs';
import Feed from './pages/Feed';
import Health from './pages/Health';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="flocks" element={<Flocks />} />
        <Route path="eggs" element={<Eggs />} />
        <Route path="feed" element={<Feed />} />
        <Route path="health" element={<Health />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
      </AuthProvider>
    </BrowserRouter>
  );
}
