import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mm_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mm_token');
    if (token) {
      authAPI.getMe()
        .then(({ data }) => { setUser(data.user); localStorage.setItem('mm_user', JSON.stringify(data.user)); })
        .catch(() => { localStorage.removeItem('mm_token'); localStorage.removeItem('mm_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (creds) => {
    const { data } = await authAPI.login(creds);
    localStorage.setItem('mm_token', data.token);
    localStorage.setItem('mm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => { localStorage.removeItem('mm_token'); localStorage.removeItem('mm_user'); setUser(null); };
  const updateUser = (u) => { setUser(u); localStorage.setItem('mm_user', JSON.stringify(u)); };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
