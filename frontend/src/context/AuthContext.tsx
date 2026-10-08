import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/api';
import type { User } from '../types/meeting';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('meetscribe_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      localStorage.removeItem('meetscribe_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    } else if (!token) {
      setIsLoading(false);
    }
  }, [token, user, fetchProfile]);

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('meetscribe_token', newToken);
    setToken(newToken);
    setIsLoading(true);
    try {
      const profile = await authService.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Error fetching profile on login:', err);
      localStorage.removeItem('meetscribe_token');
      setToken(null);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('meetscribe_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
