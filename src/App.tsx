
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import LandingPage from './pages/LandingPage';
import SupportPage from './pages/SupportPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import DiagnosticForm from './components/DiagnosticForm';
import PHEVDiagnosticForm from './components/PHEVDiagnosticForm';
import ICEDiagnosticForm from './components/ICEDiagnosticForm';
import SearchRecords from './components/SearchRecords';
import ModifyReports from './components/ModifyReports';
import PrintSummary from './components/PrintSummary';
import UserManagement from './components/UserManagement';
import StationManagement from './components/StationManagement';
import RegistrationManagement from './components/RegistrationManagement';
import StationAdminApproval from './components/StationAdminApproval';
import StationRegistration from './components/StationRegistration';
import ProfileManagement from './components/ProfileManagement';
import EmailVerification from './components/EmailVerification';
import RoleProtectedRoute from './components/RoleProtectedRoute';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated() ? <>{children}</> : <Navigate to="/auth" replace />;
};

const RootRedirect: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register-station" element={<StationRegistration />} />
            <Route path="/verify-email" element={<EmailVerification />} />
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
            <Route path="/ice-diagnostic-form" element={
              <ProtectedRoute>
                <ICEDiagnosticForm />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchRecords />
              </ProtectedRoute>
            } />
            <Route path="/modify-reports" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRoles={['super_admin', 'admin', 'station_admin']}>
                  <ModifyReports />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/print-summary/:type/:id" element={
              <ProtectedRoute>
                <PrintSummary />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRoles={['super_admin', 'station_admin']}>
                  <UserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/station-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRoles={['super_admin']}>
                  <StationManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/registration-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRoles={['super_admin']}>
                  <RegistrationManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/station-admin-approval" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRoles={['super_admin']}>
                  <StationAdminApproval />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileManagement />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
