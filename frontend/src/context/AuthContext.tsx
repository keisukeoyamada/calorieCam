import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth, users } from '../services/api';

interface AuthContextType {
  token: string | null;
  user: any | null; // 適切なUserインターフェースに置き換える
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, daily_calorie_limit: number) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    if (token) {
      try {
        const response = await users.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        logout(); // ユーザー情報の取得に失敗したらトークンをクリア
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]); // トークンが変更されたらユーザー情報を再取得

  const login = async (username: string, password: string) => {
    const response = await auth.login(username, password);
    const newToken = response.data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchUser(); // ログイン後すぐにユーザー詳細情報を取得
  };

  const signup = async (username: string, password: string, daily_calorie_limit: number) => {
    await auth.signup(username, password, daily_calorie_limit);
    // サインアップ後、自動的にログイン
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, isAuthenticated, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
