
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionStatus from './SubscriptionStatus';
import { 
  LogOut, 
  FileText, 
  Search, 
  Printer, 
  Settings, 
  Users, 
  Shield,
  Building,
  UserCheck,
  ClipboardList,
  Zap,
  Battery,
  Car
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    signOut, 
    user, 
    profile, 
    isSuperAdmin, 
    isStationAdmin, 
    isTechnician, 
    isFrontDesk,
    canManageUsers,
    canModifyAllReports,
    canAccessStationData
  } = useAuth();

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const menuItems = [
    {
      title: 'EV Diagnostic Form',
      description: 'Create new EV diagnostic reports',
      icon: Zap,
      path: '/diagnostic-form',
      color: 'bg-blue-600 hover:bg-blue-700',
      show: canAccessStationData() // All roles except pending users
    },
    {
      title: 'PHEV Diagnostic Form',
      description: 'Create new PHEV diagnostic reports',
      icon: Battery,
      path: '/phev-diagnostic-form',
      color: 'bg-green-600 hover:bg-green-700',
      show: canAccessStationData() // All roles except pending users
    },
    {
      title: 'ICE Diagnostic Form',
      description: 'Create new ICE diagnostic reports',
      icon: Car,
      path: '/ice-diagnostic-form',
      color: 'bg-red-600 hover:bg-red-700',
      show: canAccessStationData() // All roles except pending users
    },
    {
      title: 'Search Records',
      description: isFrontDesk() ? 'Search your diagnostic records' : 'Search station diagnostic records',
      icon: Search,
      path: '/search',
      color: 'bg-purple-600 hover:bg-purple-700',
      show: canAccessStationData() // All roles except pending users
    },
    {
      title: 'Modify Reports',
      description: isFrontDesk() ? 'Edit your diagnostic reports' : 'Edit station diagnostic reports',
      icon: FileText,
      path: '/modify-reports',
      color: 'bg-orange-600 hover:bg-orange-700',
      show: canModifyAllReports() || isFrontDesk() // All roles can modify (with different permissions)
    },
    {
      title: 'Print Summary',
      description: 'Print diagnostic summaries',
      icon: Printer,
      path: '/Search',
      color: 'bg-gray-600 hover:bg-gray-700',
      show: canAccessStationData() // All roles except pending users
    },
    {
      title: 'User Management',
      description: isStationAdmin() ? 'Manage station users' : 'Manage all users',
      icon: Users,
      path: '/user-management',
      color: 'bg-red-600 hover:bg-red-700',
      show: canManageUsers() // Super admin and station admin only
    },
    {
      title: 'Station Management',
      description: 'Manage service stations',
      icon: Building,
      path: '/station-management',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      show: isSuperAdmin() // Super admin only
    },
    {
      title: 'Registration Management',
      description: 'Review station registration requests',
      icon: ClipboardList,
      path: '/registration-management',
      color: 'bg-teal-600 hover:bg-teal-700',
      show: isSuperAdmin() // Super admin only
    },
    {
      title: 'Station Admin Approval',
      description: 'Approve station administrator requests',
      icon: UserCheck,
      path: '/station-admin-approval',
      color: 'bg-pink-600 hover:bg-pink-700',
      show: isSuperAdmin() // Super admin only
    },
    {
      title: 'Profile Settings',
      description: 'Manage your profile and settings',
      icon: Settings,
      path: '/profile',
      color: 'bg-slate-600 hover:bg-slate-700',
      show: true // Everyone can access
    }
  ];

  const visibleItems = menuItems.filter(item => item.show);

  const getRoleDisplayName = () => {
    if (isSuperAdmin()) return 'Super Administrator';
    if (isStationAdmin()) return 'Station Administrator';
    if (isTechnician()) return 'Technician';
    if (isFrontDesk()) return 'Front Desk';
    return 'User';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-white">EV Diagnostic System</h1>
              <p className="text-sm text-slate-400">Professional diagnostic tools</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <SubscriptionStatus />
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {profile?.full_name || user?.email}
              </p>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {isSuperAdmin() && <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">Super Admin</span>}
                {isStationAdmin() && <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">Station Admin</span>}
                {isTechnician() && <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">Technician</span>}
                {isFrontDesk() && <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">Front Desk</span>}
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
            <p className="text-slate-400">
              Welcome back! Choose an option below to get started.
            </p>
          </div>


          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`${item.color} text-white p-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg text-left group`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm opacity-90">{item.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Your Role</p>
                  <p className="text-lg font-semibold text-white">
                    {getRoleDisplayName()}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Station</p>
                  <p className="text-lg font-semibold text-white">
                    {profile?.station_id ? 'Assigned' : 'Not Assigned'}
                  </p>
                  {profile?.station_id && (
                    <p className="text-xs text-slate-400 mt-1">
                      ID: {profile.station_id}
                    </p>
                  )}
                </div>
                <Building className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Access Level</p>
                  <p className="text-lg font-semibold text-white">
                    {isSuperAdmin() ? 'Global' : 
                     isStationAdmin() || isTechnician() ? 'Station' :
                     isFrontDesk() ? 'Personal' : 'Limited'}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
