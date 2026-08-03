import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'admin_token';
const PROFILE_KEY = 'admin_profile';


function saveSession(token, adminData, remember) {
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;

  store.setItem(TOKEN_KEY, token);
  store.setItem(PROFILE_KEY, JSON.stringify(adminData));

  other.removeItem(TOKEN_KEY);
  other.removeItem(PROFILE_KEY);
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function getStoredProfile() {
  const raw = localStorage.getItem(PROFILE_KEY) || sessionStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
}

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getStoredProfile());
  const [loading, setLoading] = useState(true);
  const checkedRef = useRef(false);

  
  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/admin/me')
      .then((res) => {
        setAdmin(res.data.data);
        const store = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
        store.setItem(PROFILE_KEY, JSON.stringify(res.data.data));
      })
      .catch((err) => {
        const status = err.response?.status;
        
        if (status === 401 || status === 403) {
          clearSession();
          setAdmin(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, remember = false) => {
    const res = await api.post('/admin/login', { email, password });
    const { token, admin: adminData } = res.data.data;
    saveSession(token, adminData, remember);
    setAdmin(adminData);
    return adminData;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: Boolean(admin) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}