import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
        <div className="w-12 h-12 border-4 border-tv-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is logged in, redirect to the main app dashboard
  return user ? <Navigate to="/trade" replace /> : <Outlet />;
};

export default AuthRoute;
