import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // AuthContext hala token'ı kontrol ediyorsa bir yükleme ekranı göster.
  // Bu, sayfanın anlık olarak login ekranına atıp geri gelmesini (flicker) engeller.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-nexus-dark">
        <p className="text-white text-xl animate-pulse">Authenticating...</p>
      </div>
    );
  }

  // Yükleme bitti ve kullanıcı yoksa, login sayfasına yönlendir.
  // Nereden geldiğini de state olarak gönderelim ki, login sonrası oraya dönebilsin.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Yükleme bitti ve kullanıcı varsa, istenen sayfayı (children) göster.
  return <>{children}</>;
};

export default ProtectedRoute;