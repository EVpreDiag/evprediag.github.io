
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../components/LoginPage';
import Dashboard from '../components/Dashboard';
import DiagnosticForm from '../components/DiagnosticForm';
import PHEVDiagnosticForm from '../components/PHEVDiagnosticForm';
import SearchRecords from '../components/SearchRecords';
import UserManagement from '../components/UserManagement';
import PrintSummary from '../components/PrintSummary';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Index = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/diagnostic-form" element={
            <ProtectedRoute>
              <DiagnosticForm />
            </ProtectedRoute>
          } />
          <Route path="/phev-diagnostic-form" element={
            <ProtectedRoute>
              <PHEVDiagnosticForm />
            </ProtectedRoute>
          } />
          <Route path="/search-records" element={
            <ProtectedRoute>
              <SearchRecords />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/print-summary/:id" element={
            <ProtectedRoute>
              <PrintSummary />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default Index;
