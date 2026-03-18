import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getCurrentUser } from './api';
import type { User } from './mock-data';

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  setToken: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('majools_token'));
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    if (token) {
      setUser(getCurrentUser());
    } else {
      setUser(null);
    }
  }, [token]);

  const setToken = (t: string) => {
    localStorage.setItem('majools_token', t);
    setTokenState(t);
  };

  const logout = () => {
    localStorage.removeItem('majools_token');
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
