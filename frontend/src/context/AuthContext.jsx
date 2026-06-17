import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('perfume_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.me();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
        localStorage.removeItem('perfume_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('perfume_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem('perfume_token', token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message);
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem('perfume_token', token);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore — token may already be invalid
    }
    localStorage.removeItem('perfume_token');
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(prev => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
