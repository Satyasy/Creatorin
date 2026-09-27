'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '../types';
import { authService } from '@/services/authService';

const AUTH_STORAGE_KEY = 'creatorin_session_user';

interface AuthContextType {
  user: AuthState['user'];
  isAuthenticated: boolean;
  login: (user: NonNullable<AuthState['user']>) => void;
  logout: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  signOut: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
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

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        login,
        logout,
        signOut: logout,
        refreshUser: syncServerSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
