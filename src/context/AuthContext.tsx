import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, getUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (id: string, password: string, role: 'student' | 'admin') => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  const login = (id: string, password: string, role: 'student' | 'admin'): boolean => {
    const users = getUsers();
    let found: User | undefined;

    if (role === 'student') {
      found = users.find(u => u.nim === id && u.role === 'student');
    } else {
      found = users.find(u => u.admin_id === id && u.role === 'admin');
    }

    if (found && found.password && found.password !== password) {
      return false;
    }

    if (found) {
      setCurrentUser(found);
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
