'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, UserRole } from '../types';
import { authService } from '@/services/authService';

const AUTH_STORAGE_KEY = 'creatorin_session_user';

interface AuthContextType {
  user: AuthState['user'];
  isAuthenticated: boolean;
  login: (user: NonNullable<AuthState['user']>) => void;
  logout: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signOut: () => {},
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

  const syncServerSession = useCallback(async () => {
    try {
      const serverUser = await authService.getCurrentUser();
      if (serverUser) {
        const mappedUser: NonNullable<AuthState['user']> = {
          name: serverUser.name,
          email: serverUser.email,
          role: serverUser.role,
          avatar: serverUser.avatar,
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

  const login = (user: NonNullable<AuthState['user']>) => {
    setAuthState({
      isAuthenticated: true,
      user,
    });
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist auth state', e);
    }
  };

  const logout = () => {
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
  };

  const switchRole = (role: UserRole) => {
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

    const nextUser: NonNullable<AuthState['user']> = {
      ...(authState.user || {}),
      name: roleProfile.name,
      email: roleProfile.email,
      avatar: roleProfile.avatar,
      role,
    };

    setAuthState({
      isAuthenticated: true,
      user: nextUser,
    });

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    } catch (e) {
      console.error('Failed to switch role in localStorage', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        login,
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
