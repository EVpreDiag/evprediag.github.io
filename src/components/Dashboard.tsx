import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Users, Edit, User, LogOut, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

interface DashboardStats {
  totalRecords: number;
  activeCases: number;
  criticalIssues: number;
  completedToday: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRecords: 0,
    activeCases: 0,
    criticalIssues: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          return;
        }
        
        setUserRole(data?.role || null);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Fetch EV records
        const { data: evRecords, error: evError } = await supabase
          .from('ev_diagnostic_records')
          .select('id, created_at, battery_warnings, power_loss, failed_charges, range_drop');

        if (evError) throw evError;

        // Fetch PHEV records
        const { data: phevRecords, error: phevError } = await supabase
          .from('phev_diagnostic_records')
          .select('id, created_at, excessive_ice_operation, charge_rate_drop, misfires, burning_smell');

        if (phevError) throw phevError;

        // Calculate statistics
        const totalEVRecords = evRecords?.length || 0;
        const totalPHEVRecords = phevRecords?.length || 0;
        const totalRecords = totalEVRecords + totalPHEVRecords;

        // Count records created today
        const completedToday = [
          ...(evRecords || []),
          ...(phevRecords || [])
        ].filter(record => {
          const recordDate = new Date(record.created_at);
          return recordDate >= startOfDay && recordDate < endOfDay;
        }).length;

        // Count critical issues (records with 'yes' responses to critical fields)
        const criticalEVIssues = (evRecords || []).filter(record => 
          record.battery_warnings === 'yes' || 
          record.power_loss === 'yes' || 
          record.failed_charges === 'yes' ||
          record.range_drop === 'yes'
        ).length;

        const criticalPHEVIssues = (phevRecords || []).filter(record => 
          record.excessive_ice_operation === 'yes' || 
          record.charge_rate_drop === 'yes' || 
          record.misfires === 'yes' ||
          record.burning_smell === 'yes'
        ).length;

        const criticalIssues = criticalEVIssues + criticalPHEVIssues;

        // For active cases, let's consider records from the last 7 days as "active"
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeCases = [
          ...(evRecords || []),
          ...(phevRecords || [])
        ].filter(record => {
          const recordDate = new Date(record.created_at);
          return recordDate >= sevenDaysAgo;
        }).length;

        setStats({
          totalRecords,
          activeCases,
          criticalIssues,
          completedToday
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const canAccessDiagnosticForms = ['admin', 'tech', 'service_desk'].includes(userRole || '');
  const canModifyReports = ['admin', 'tech'].includes(userRole || '');
  const canAccessUserManagement = userRole === 'admin';

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">EV Diagnostic Dashboard</h1>
            <p className="text-sm text-slate-400">Comprehensive electric vehicle diagnostic system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-5 h-5" />
              <span>{user?.email}</span>
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-sm">
                {userRole}
              </span>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Forms Completed</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : stats.totalRecords}
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Active Cases</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : stats.activeCases}
                </p>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Critical Issues</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : stats.criticalIssues}
                </p>
                <p className="text-xs text-slate-500">Requires attention</p>
              </div>
              <div className="p-3 bg-red-600/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">Completed Today</p>
                <p className="text-2xl font-bold text-white">
                  {loading ? '...' : stats.completedToday}
                </p>
                <p className="text-xs text-slate-500">Today's progress</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Diagnostic Forms */}
          {canAccessDiagnosticForms && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Diagnostic Forms</h3>
                  <p className="text-sm text-slate-400">Create new diagnostic reports</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/diagnostic-form')}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left"
                >
                  EV Diagnostic Form
                </button>
                <button
                  onClick={() => navigate('/phev-diagnostic-form')}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-left"
                >
                  PHEV Diagnostic Form
                </button>
              </div>
            </div>
          )}

          {/* Search Records */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-green-500 transition-colors">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <Search className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Search Records</h3>
                <p className="text-sm text-slate-400">Find and view diagnostic reports</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/search-records')}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Search Database
            </button>
          </div>

          {/* Modify Reports */}
          {canModifyReports && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-yellow-500 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <Edit className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Modify Reports</h3>
                  <p className="text-sm text-slate-400">Edit existing diagnostic reports</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/modify-reports')}
                className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Edit Reports
              </button>
            </div>
          )}

          {/* User Management */}
          {canAccessUserManagement && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-purple-500 transition-colors">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <p className="text-sm text-slate-400">Manage users and permissions</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/user-management')}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Manage Users
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-400">{loading ? '...' : stats.totalRecords}</p>
              <p className="text-sm text-slate-400">Total Reports</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{loading ? '...' : stats.activeCases}</p>
              <p className="text-sm text-slate-400">Recent Cases</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{loading ? '...' : stats.criticalIssues}</p>
              <p className="text-sm text-slate-400">Critical Issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
