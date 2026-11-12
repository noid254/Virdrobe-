import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AccountUser, Role } from '../types/account';
import { api } from '../lib/api';

interface AuthValue {
  user: AccountUser | null;
  loading: boolean;
  signUp: (v: { email: string; password: string; name: string; role: 'client' | 'affiliate' }) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  enableAffiliate: (payoutMethod?: string, payoutDetails?: string) => Promise<void>;
  enableSeller: (v: { shopName: string; city?: string; category?: string }) => Promise<void>;
  saveAccount: (patch: any) => Promise<AccountUser>;
  setUser: (u: AccountUser | null) => void;
}

const Ctx = createContext<AuthValue | null>(null);

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AccountUser | null>('/api/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signUp: AuthValue['signUp'] = useCallback(async (v) => {
    setUser(await api<AccountUser>('/api/auth/signup', { body: v }));
  }, []);
  const logIn: AuthValue['logIn'] = useCallback(async (email, password) => {
    setUser(await api<AccountUser>('/api/auth/login', { body: { email, password } }));
  }, []);
  const logOut = useCallback(async () => {
    await api('/api/auth/logout', { body: {} }).catch(() => undefined);
    setUser(null);
    window.location.hash = '#/';
  }, []);
  const switchRole = useCallback(async (role: Role) => {
    setUser(await api<AccountUser>('/api/me/active-role', { body: { role } }));
  }, []);
  const enableAffiliate = useCallback(async (payoutMethod?: string, payoutDetails?: string) => {
    setUser(await api<AccountUser>('/api/me/roles', { body: { role: 'affiliate', payoutMethod, payoutDetails } }));
  }, []);
  const enableSeller: AuthValue['enableSeller'] = useCallback(async (v) => {
    setUser(await api<AccountUser>('/api/me/roles', { body: { role: 'seller', ...v } }));
  }, []);
  const saveAccount = useCallback(async (patch: any) => {
    const u = await api<AccountUser>('/api/me', { method: 'PATCH', body: patch });
    setUser(u);
    return u;
  }, []);

  return (
    <Ctx.Provider
      value={{ user, loading, signUp, logIn, logOut, switchRole, enableAffiliate, enableSeller, saveAccount, setUser }}
    >
      {children}
    </Ctx.Provider>
  );
};
