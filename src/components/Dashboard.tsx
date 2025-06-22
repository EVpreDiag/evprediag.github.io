import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Search, 
  Users, 
  LogOut, 
  Battery, 
  Zap,
  Car,
  BarChart3,
  Settings,
  Plug,
  User,
  Shield,
  Edit,
  Building
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile, userRoles, hasRole, isAdmin, isSuperAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const dashboardCards = [
    {
      title: 'EV Diagnostic Form',
      description: 'Complete diagnostic assessment for electric vehicles',
      icon: Battery,
      path: '/diagnostic-form',
      color: 'from-blue-600 to-blue-700',
      available: hasRole('admin') || hasRole('technician') || hasRole('front_desk') || isSuperAdmin()
    },
    {
      title: 'PHEV Diagnostic Form',
      description: 'Complete diagnostic assessment for plug-in hybrid vehicles',
      icon: Plug,
      path: '/phev-diagnostic-form',
      color: 'from-emerald-600 to-emerald-700',
      available: hasRole('admin') || hasRole('technician') || hasRole('front_desk') || isSuperAdmin()
    },
    {
      title: 'Search Records',
      description: 'Find saved diagnostics by VIN, RO, or customer',
      icon: Search,
      path: '/search-records',
      color: 'from-green-600 to-green-700',
      available: true // Available to all authenticated users
    },
    {
      title: 'Modify Reports',
      description: 'Edit and update saved diagnostic reports',
      icon: Edit,
      path: '/modify-reports',
      color: 'from-orange-600 to-orange-700',
      available: hasRole('admin') || hasRole('technician') || isSuperAdmin()
    },
    {
      title: 'User Management',
      description: 'Manage technician accounts and permissions',
      icon: Users,
      path: '/user-management',
      color: 'from-purple-600 to-purple-700',
      available: isAdmin() || isSuperAdmin()
    },
    {
      title: 'Station Management',
      description: 'Manage service stations and locations',
      icon: Building,
      path: '/station-management',
      color: 'from-indigo-600 to-indigo-700',
      available: isSuperAdmin()
    },
    {
      title: 'Profile Management',
      description: 'Manage your account and profile settings',
      icon: User,
      path: '/profile',
      color: 'from-indigo-600 to-indigo-700',
      available: true
    }
  ];

  const stats = [
    { label: 'Forms Completed', value: '24', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Active Cases', value: '8', icon: Car, color: 'text-green-400' },
    { label: 'Critical Issues', value: '3', icon: Zap, color: 'text-red-400' }
  ];

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'super_admin': return 'Super Admin';
      case 'technician': return 'Technician';
      case 'front_desk': return 'Front Desk';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-600/20 text-purple-400';
      case 'super_admin': return 'bg-red-600/20 text-red-400';
      case 'technician': return 'bg-blue-600/20 text-blue-400';
      case 'front_desk': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Battery className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">EV Diagnostic Portal</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-400">
                  Welcome back, {profile?.full_name || profile?.username || user?.email}
                </p>
                {userRoles.length > 0 && (
                  <div className="flex space-x-1">
                    {userRoles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role)}`}
                      >
                        {getRoleDisplayName(role)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-2 px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-slate-600 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* No Role Warning */}
        {userRoles.length === 0 && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h3 className="text-yellow-400 font-medium">Access Pending</h3>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Your account has been created but no roles have been assigned yet. Please contact an administrator to assign your role and activate your access to the system.
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => (
            card.available && (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className="group bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 text-left"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-slate-400">{card.description}</p>
              </button>
            )
          ))}
        </div>

        {/* Quick Actions */}
        {(hasRole('admin') || hasRole('technician') || hasRole('front_desk') || isSuperAdmin()) && (
          <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/diagnostic-form')}
                className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
              >
                <Battery className="w-5 h-5 text-blue-400" />
                <span className="text-white">Start EV Diagnostic</span>
              </button>
              <button 
                onClick={() => navigate('/phev-diagnostic-form')}
                className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
              >
                <Plug className="w-5 h-5 text-emerald-400" />
                <span className="text-white">Start PHEV Diagnostic</span>
              </button>
              {(hasRole('admin') || hasRole('technician') || isSuperAdmin()) && (
                <button 
                  onClick={() => navigate('/modify-reports')}
                  className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <Edit className="w-5 h-5 text-orange-400" />
                  <span className="text-white">Modify Reports</span>
                </button>
              )}
              {isSuperAdmin() && (
                <button 
                  onClick={() => navigate('/station-management')}
                  className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
                >
                  <Building className="w-5 h-5 text-indigo-400" />
                  <span className="text-white">Manage Stations</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
