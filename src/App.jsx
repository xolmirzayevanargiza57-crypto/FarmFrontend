import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Flocks from './pages/Flocks';
import Eggs from './pages/Eggs';
import Feed from './pages/Feed';
import Health from './pages/Health';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="flocks" element={<Flocks />} />
        <Route path="eggs" element={<Eggs />} />
        <Route path="feed" element={<Feed />} />
        <Route path="health" element={<Health />} />
        <Route path="sales" element={<Sales />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
      </Route>
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
