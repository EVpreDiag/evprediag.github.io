
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
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'EV Diagnostic Form',
      description: 'Complete pre-check diagnostic assessment',
      icon: FileText,
      path: '/diagnostic-form',
      color: 'from-blue-600 to-blue-700',
      available: true
    },
    {
      title: 'Search Records',
      description: 'Find saved diagnostics by VIN, RO, or customer',
      icon: Search,
      path: '/search-records',
      color: 'from-green-600 to-green-700',
      available: true
    },
    {
      title: 'User Management',
      description: 'Manage technician accounts and permissions',
      icon: Users,
      path: '/user-management',
      color: 'from-purple-600 to-purple-700',
      available: user?.role === 'admin'
    }
  ];

  const stats = [
    { label: 'Forms Completed', value: '24', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Active Cases', value: '8', icon: Car, color: 'text-green-400' },
    { label: 'Critical Issues', value: '3', icon: Zap, color: 'text-red-400' }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Battery className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold text-white">EV Diagnostic Portal</h1>
              <p className="text-sm text-slate-400">Welcome back, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm capitalize">
              {user?.role}
            </span>
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
        <div className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-white">Start New Diagnostic</span>
            </button>
            <button className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left">
              <Search className="w-5 h-5 text-green-400" />
              <span className="text-white">Quick Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
