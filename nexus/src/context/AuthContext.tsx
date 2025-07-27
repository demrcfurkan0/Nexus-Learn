import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

// Kullanıcı verisi için interface
interface AuthUser {
  username: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Uygulama ilk yüklendiğinde token var mı diye kontrol et
    const checkUser = async () => {
      const token = localStorage.getItem('nexus_token');
      if (token) {
        try {
          const response = await apiClient.get<AuthUser>('/api/auth/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Token validation failed', error);
          localStorage.removeItem('nexus_token'); // Geçersiz token'ı sil
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email); 
    params.append('password', password);

    const response = await apiClient.post<{ access_token: string }>('/api/auth/token', params);
    const { access_token } = response.data;
    
    localStorage.setItem('nexus_token', access_token);
    
    const userResponse = await apiClient.get<AuthUser>('/api/auth/users/me');
    setUser(userResponse.data);
    navigate('/'); // Başarılı girişte anasayfaya yönlendir
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus_token');
    navigate('/login'); // Çıkış yapınca login sayfasına yönlendir
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Contexti kolayca kullanmak için custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};