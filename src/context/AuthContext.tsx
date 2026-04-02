import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, Permissions } from '../types/permissions';
import { getPermissions } from '../utils/permissions';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  userProfile: UserProfile | null;
  permissions: Permissions | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const profile = response.data;
      setUserProfile({
        username: profile.username,
        name: profile.name,
        role: profile.role
      });
      setPermissions(getPermissions(profile.role));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setUserProfile(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username,
      password
    });
    
    const { token, user } = response.data;
    
    // Save token
    localStorage.setItem('auth_token', token);
    
    // Set user profile
    setUserProfile({
      username: user.username,
      name: user.name,
      role: user.role
    });
    setPermissions(getPermissions(user.role));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUserProfile(null);
      setPermissions(null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const value: AuthContextType = {
    userProfile,
    permissions,
    loading,
    login,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
