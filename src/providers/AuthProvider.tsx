'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState } from '../types';
import { authService } from '@/services/authService';

interface AuthContextType {
  user: AuthState['user'];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: NonNullable<AuthState['user']>) => void;
  logout: () => void;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  signOut: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [isLoading, setIsLoading] = useState(true);

  const syncServerSession = useCallback(async () => {
    try {
      const serverUser = await authService.getCurrentUser();
      if (serverUser) {
        const mappedUser: NonNullable<AuthState['user']> = {
          name: serverUser.name,
          id: serverUser.id,
          email: serverUser.email,
          role: serverUser.role,
          avatar: serverUser.avatar,
          location: serverUser.location,
          phone: serverUser.phone,
          bio: serverUser.bio,
        };
        setAuthState({
          isAuthenticated: true,
          user: mappedUser,
        });
        setIsLoading(false);
        return;
      }
    } catch { /* Session check failed. */ }
    setAuthState({ isAuthenticated: false, user: null });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const sync = async () => { await syncServerSession(); };
    void sync();
  }, [syncServerSession]);

  const login = (user: NonNullable<AuthState['user']>) => {
    setIsLoading(false);
    setAuthState({
      isAuthenticated: true,
      user,
    });
  };

  const logout = () => {
    setIsLoading(false);
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: authState.isAuthenticated,
        isLoading,
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
