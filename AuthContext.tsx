import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';

let SecureStore: any = null;
if (Platform.OS !== 'web') {
  SecureStore = require('expo-secure-store');
}

const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    } else {
      return SecureStore.getItemAsync(key);
    }
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  },
};

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await storage.getItem('token');
      if (stored) {
        setToken(stored);
        try {
          // Fetch user profile with stored token
          const res = await axios.get('http://192.168.50.210:8081/auth/me');
          setUser(res.data);
        } catch (err) {
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      storage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      storage.removeItem('token');
    }
  }, [token]);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
