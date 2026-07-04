import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const USER_KEY = 'perfume_user';
const TOKEN_KEY = 'perfume_token';

function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCachedUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function AuthProvider({ children }) {
  // Hydrate from cache immediately — no spinner on initial load
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? getCachedUser() : null;
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setCachedUser(null);
      setLoading(false);
      return;
    }
    // Token exists — we already hydrated from cache, so loading can be false.
    // Validate token in background (silent refresh).
    try {
      const res = await authAPI.me();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
        setCachedUser(res.data.data);
      } else {
        setUser(null);
        setCachedUser(null);
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Keep cached user optimistically; only clear if 401
      const cached = getCachedUser();
      if (!cached) {
        localStorage.removeItem(TOKEN_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If we have a cached user, we can mark loading done immediately
    // and then validate in background
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    const cached = getCachedUser();
    if (cached) {
      // Already shown user from cache — validate quietly
      setLoading(false);
      checkAuth();
    } else {
      checkAuth();
    }
  }, [checkAuth]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      setCachedUser(userData);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message);
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    if (res.data.success) {
      const { token, user: userData } = res.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      setCachedUser(userData);
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
    localStorage.removeItem(TOKEN_KEY);
    setCachedUser(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedUser };
      setCachedUser(merged);
      return merged;
    });
  };

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
