import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Skeleton';

export const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#000000] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (role === 'trading_center') {
    return <Navigate to="/trading-center" replace />;
  }
  if (role === 'ranking') {
    return <Navigate to="/rankings" replace />;
  }
  return <Navigate to="/country" replace />;
};
