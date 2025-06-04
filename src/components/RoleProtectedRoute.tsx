
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield } from 'lucide-react';

type UserRole = 'admin' | 'tech' | 'service_desk';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAnyRole?: boolean; // If true, user needs at least one of the required roles
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  requireAnyRole = true 
}) => {
  const { isAuthenticated, loading, userRoles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // If no specific roles are required, just check authentication
  if (requiredRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required roles
  const hasRequiredRole = requireAnyRole
    ? requiredRoles.some(role => userRoles.includes(role))
    : requiredRoles.every(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
