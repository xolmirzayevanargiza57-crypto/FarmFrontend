import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Hardcoded user to bypass login entirely
  const [user, setUser] = useState({ name: 'Admin', email: 'admin@farm.uz', role: 'admin' });
  const [loading, setLoading] = useState(false);

  // Authentication logic is now disabled, but the structure is kept to prevent errors in other components
  const login = async () => {};
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
