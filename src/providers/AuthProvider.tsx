'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, UserRole } from '../types';
import { authService } from '@/services/authService';
import { apiUrl } from '@/lib/api-config';

// Install fetch interceptor once on client to route all /api/* requests to backend
if (typeof window !== 'undefined' && !(window as any).__creatorin_fetch_intercepted__) {
  (window as any).__creatorin_fetch_intercepted__ = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string') {
      let targetUrl = input;
      if (input.startsWith('/api/')) {
        targetUrl = apiUrl(input);
      } else if (input.includes('/api/api/')) {
        targetUrl = input.replace('/api/api/', '/api/');
      }
      const updatedInit: RequestInit = {
        credentials: 'include',
        ...init,
      };
      return originalFetch(targetUrl, updatedInit);
    }
    return originalFetch(input, init);
  };
}

const AUTH_STORAGE_KEY = 'creatorin_session_user';

interface AuthContextType {
  user: AuthState['user'];
  isAuthenticated: boolean;
  login: (user: NonNullable<AuthState['user']>) => void;
  updateUser: (fields: Partial<NonNullable<AuthState['user']>>) => void;
  logout: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  updateUser: () => {},
  logout: () => {},
  signOut: () => {},
  refreshUser: async () => {},
  switchRole: () => {},
});

// Automatically proxy relative /api/* requests to NEXT_PUBLIC_API_URL (e.g. https://api.creatorin.my.id) when deployed on CDN
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  if (!(window as any).__creatorinFetchPatched && apiBase) {
    (window as any).__creatorinFetchPatched = true;
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = input;
      const targetInit: RequestInit = init ? { ...init } : {};

      if (typeof input === 'string' && input.startsWith('/api/')) {
        url = `${apiBase}${input}`;
        targetInit.credentials = targetInit.credentials || 'include';
      } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
        url = `${apiBase}${input.pathname}${input.search}`;
        targetInit.credentials = targetInit.credentials || 'include';
      }

      return originalFetch(url, targetInit);
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) {
          return {
            isAuthenticated: true,
            user: JSON.parse(saved),
          };
        }
      } catch {}
    }
    return {
      isAuthenticated: false,
      user: null,
    };
  });

  const syncServerSession = useCallback(async () => {
    try {
      const serverUser = await authService.getCurrentUser();
      if (serverUser) {
        const mappedUser: NonNullable<AuthState['user']> = {
          name: serverUser.name,
          email: serverUser.email,
          role: serverUser.role,
          avatar: serverUser.avatar,
          location: serverUser.location,
          phone: serverUser.phone,
          bio: serverUser.bio,
          roleTitle: serverUser.roleTitle,
          handle: serverUser.handle,
        };
        setAuthState({
          isAuthenticated: true,
          user: mappedUser,
        });
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mappedUser));
        return;
      }
    } catch {
      // Fallback to local storage if offline or server unreachable
    }

    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAuthState({
          isAuthenticated: true,
          user: parsed,
        });
      }
    } catch (e) {
      console.error('Failed to parse auth state from localStorage', e);
    }
  }, []);

  useEffect(() => {
    syncServerSession();
  }, [syncServerSession]);

  const login = useCallback((user: NonNullable<AuthState['user']>) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
  }, []);

  const updateUser = useCallback((fields: Partial<NonNullable<AuthState['user']>>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...fields };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update auth state in localStorage', e);
      }
      return {
        ...prev,
        user: updated,
      };
    });
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.error('Failed to remove auth state', e);
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const defaultSchool = {
      name: 'SMK Telkom Sidoarjo',
      email: 'smktelkom@creatorin.id',
      avatar: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    };
    const defaultUmkm = {
      name: 'Batik Sekar Wangi',
      email: 'umkm@sekarwangi.id',
      avatar: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=120&auto=format&fit=crop&q=80',
    };
    const defaultCreator = {
      name: 'Revano Pandega',
      email: 'revano@creatorin.id',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    };

    const roleProfile = role === 'school' ? defaultSchool : role === 'umkm' ? defaultUmkm : defaultCreator;

    setAuthState((prev) => {
      const nextUser: NonNullable<AuthState['user']> = {
        ...(prev.user || {}),
        name: roleProfile.name,
        email: roleProfile.email,
        avatar: roleProfile.avatar,
        role,
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      } catch (e) {
        console.error('Failed to switch role in localStorage', e);
      }

      return {
        isAuthenticated: true,
        user: nextUser,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        login,
        updateUser,
        logout,
        signOut: logout,
        refreshUser: syncServerSession,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
