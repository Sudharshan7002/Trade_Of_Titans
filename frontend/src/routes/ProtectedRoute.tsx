import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/api';
import { Skeleton } from '../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#000000] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton variant="card" />
          <Skeleton variant="text" count={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to the dashboard appropriate for their role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (role === 'trading_center') {
      return <Navigate to="/trading-center" replace />;
    }
    return <Navigate to="/country" replace />;
  }

  return <>{children}</>;
};
