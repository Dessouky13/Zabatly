import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  language?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  plan: string;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [plan, setPlan] = useState<string>('free');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('zabatly_token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, verify stored token and fetch user
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { user: AuthUser; plan: string }) => {
        setUser(data.user);
        setPlan(data.plan);
      })
      .catch(() => {
        localStorage.removeItem('zabatly_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Login failed');
    }

    const data: { token: string; user: AuthUser } = await res.json();
    localStorage.setItem('zabatly_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('zabatly_token');
    setToken(null);
    setUser(null);
    setPlan('free');
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, plan, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
