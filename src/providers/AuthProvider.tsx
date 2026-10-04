'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, UserRole } from '../types';
import { authService } from '@/services/authService';
import { DEMO_COOKIE, getDemoUser } from '@/lib/demo-users';
import { apiUrl } from '@/lib/api-config';

// Global Client-Side Fetch Interceptor:
// Routes all relative /api/* calls directly to the VPS backend (https://api.creatorin.my.id/api/*)
// and ensures credentials: 'include' + Authorization Bearer header for resilient authentication
if (typeof window !== 'undefined' && !(window as any).__creatorin_fetch_intercepted__) {
  (window as any).__creatorin_fetch_intercepted__ = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      const targetUrl = apiUrl(input);
      const token = localStorage.getItem('creatorin_token');
      const headers = new Headers(init?.headers || {});
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const updatedInit: RequestInit = {
        credentials: 'include',
        ...init,
        headers,
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
  isLoading: boolean;
  login: (user: NonNullable<AuthState['user']>) => void;
  updateUser: (fields: Partial<NonNullable<AuthState['user']>>) => void;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  updateUser: () => {},
  logout: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
  switchRole: () => {},
});

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
  const [isLoading, setIsLoading] = useState(true);

  const syncServerSession = useCallback(async () => {
    // ── Demo mode (development only) ──────────────────────────────
    if (process.env.NODE_ENV === 'development') {
      const demoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${DEMO_COOKIE}=`))
        ?.split('=')[1];

      if (demoCookie) {
        const demoUser = getDemoUser(demoCookie);
        if (demoUser) {
          setAuthState({
            isAuthenticated: true,
            user: {
              id: demoUser.id,
              name: demoUser.name,
              email: demoUser.email,
              role: demoUser.role,
              avatar: demoUser.avatar,
              location: demoUser.location,
              bio: demoUser.bio,
            },
          });
          setIsLoading(false);
          return;
        }
      }
    }

    if (typeof window !== 'undefined') {
      const hasLocalToken = Boolean(localStorage.getItem('creatorin_token') || localStorage.getItem('creatorin_access_token'));
      const hasLocalUser = Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
      if (!hasLocalToken && !hasLocalUser) {
        setAuthState({ isAuthenticated: false, user: null });
        setIsLoading(false);
        return;
      }
    }
    try {
      const serverUser = await authService.getCurrentUser();
      if (serverUser) {
        const mappedUser: NonNullable<AuthState['user']> = {
          id: serverUser.id,
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
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback to local storage if offline or server temporary unreachable
    }

    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setAuthState({
          isAuthenticated: true,
          user: parsed,
        });
      } else {
        setAuthState({ isAuthenticated: false, user: null });
      }
    } catch {
      setAuthState({ isAuthenticated: false, user: null });
    }
    setIsLoading(false);
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

  const logout = useCallback(async () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    // Clear demo cookie if active
    if (typeof document !== 'undefined') {
      document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`;
    }
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('creatorin_token');
      localStorage.removeItem('creatorin_access_token');
      localStorage.removeItem('creatorin_role');
      localStorage.removeItem('creatorin_auth_user');

      if (typeof document !== 'undefined') {
        const domains = ['.creatorin.my.id', 'creatorin.my.id', 'api.creatorin.my.id', ''];
        for (const dom of domains) {
          const domStr = dom ? `; domain=${dom}` : '';
          document.cookie = `creatorin_token=; Max-Age=0; path=/${domStr}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          document.cookie = `creatorin_access_token=; Max-Age=0; path=/${domStr}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
      await fetch(apiUrl('/api/auth/logout'), { method: 'POST', credentials: 'include' }).catch(() => {});
    } catch (e) {
      console.error('Failed to remove auth state', e);
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;
      const nextUser: NonNullable<AuthState['user']> = {
        ...prev.user,
        role,
      };
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      } catch {}
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
        isLoading,
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
