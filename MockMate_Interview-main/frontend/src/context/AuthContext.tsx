import { createContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '../lib/api';
import type { AuthFormPayload, AuthPayload } from '../types';

interface AuthContextValue {
  auth: AuthPayload | null;
  login: (payload: AuthFormPayload) => Promise<void>;
  signup: (payload: AuthFormPayload) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'mockmate-auth';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthPayload | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      setAuth(JSON.parse(stored) as AuthPayload);
    }
  }, []);

  const persist = (payload: AuthPayload | null) => {
    if (payload) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setAuth(payload);
  };

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    login: async (payload) => {
      const response = await authApi.login(payload);
      persist(response);
    },
    signup: async (payload) => {
      const response = await authApi.signup(payload);
      persist(response);
    },
    logout: () => persist(null)
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
