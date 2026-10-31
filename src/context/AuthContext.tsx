import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api.ts';

export type UserRole = 'FOOD_DONOR' | 'NGO' | 'VOLUNTEER' | 'COMMUNITY_USER' | 'ADMIN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isApproved: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'REJECTED';
  organization?: any;
  volunteerProfile?: any;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  switchDemoRole: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem('zw_token');
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      setCurrentUser(res.data.user);
    } catch (err: any) {
      console.warn('Could not restore session:', err.message);
      localStorage.removeItem('zw_token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('zw_token', res.data.token);
      setCurrentUser(res.data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('zw_token', res.data.token);
      setCurrentUser(res.data.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('zw_token');
    setCurrentUser(null);
  };

  // Demo switch helper to immediately evaluate any of the 5 roles
  const switchDemoRole = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@zerowaste.org', pass: 'demo123' },
      FOOD_DONOR: { email: 'greenkitchen@bistro.com', pass: 'demo123' },
      NGO: { email: 'contact@hopehaven.org', pass: 'demo123' },
      VOLUNTEER: { email: 'alex.volunteer@gmail.com', pass: 'demo123' },
      COMMUNITY_USER: { email: 'maria.resident@gmail.com', pass: 'demo123' },
    };

    const target = demoCredentials[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        switchDemoRole,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
