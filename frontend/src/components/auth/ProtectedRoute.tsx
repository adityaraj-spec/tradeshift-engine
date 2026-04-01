import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E11]">
        <div className="w-12 h-12 border-4 border-tv-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login and save the location they were trying to access
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
