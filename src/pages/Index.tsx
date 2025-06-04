
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';
import DiagnosticForm from '../components/DiagnosticForm';
import PHEVDiagnosticForm from '../components/PHEVDiagnosticForm';
import SearchRecords from '../components/SearchRecords';
import UserManagement from '../components/UserManagement';
import PrintSummary from '../components/PrintSummary';
import ProfileManagement from '../components/ProfileManagement';
import ModifyReports from '../components/ModifyReports';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/diagnostic-form" element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['admin', 'tech', 'service_desk']}>
                <DiagnosticForm />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/phev-diagnostic-form" element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['admin', 'tech', 'service_desk']}>
                <PHEVDiagnosticForm />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/search-records" element={
            <ProtectedRoute>
              <SearchRecords />
            </ProtectedRoute>
          } />
          <Route path="/modify-reports" element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['admin', 'tech']}>
                <ModifyReports />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <RoleProtectedRoute requiredRoles={['admin']}>
                <UserManagement />
              </RoleProtectedRoute>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfileManagement />
            </ProtectedRoute>
          } />
          <Route path="/print-summary/:type/:id" element={
            <ProtectedRoute>
              <PrintSummary />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/login" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default Index;
