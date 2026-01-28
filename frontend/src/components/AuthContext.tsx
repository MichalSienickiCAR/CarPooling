import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  setTokens: (access: string | null, refresh: string | null) => void;
  clearTokens: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      refreshToken,
      setTokens: (access, refresh) => {
        if (access) localStorage.setItem('token', access);
        else localStorage.removeItem('token');

        if (refresh) localStorage.setItem('refreshToken', refresh);
        else localStorage.removeItem('refreshToken');

        setToken(access);
        setRefreshToken(refresh);
      },
      clearTokens: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        setToken(null);
        setRefreshToken(null);
      },
    };
  }, [token, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

