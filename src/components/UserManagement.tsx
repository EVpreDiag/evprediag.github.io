
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { ArrowLeft, Users, Plus, Edit, Trash2, Shield, User } from 'lucide-react';

type UserRole = 'admin' | 'tech' | 'service_desk';

interface SystemUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile?: {
    username: string | null;
    full_name: string | null;
  };
  roles: UserRole[];
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { isAdmin, assignRole, removeRole } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  useEffect(() => {
    if (!isAdmin()) {
      return;
    }
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from auth.users (this requires admin access)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
      }

      // Fetch profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch roles for all users
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
      }

      // Combine the data
      const combinedUsers: SystemUser[] = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        const roles = userRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          profile: profile ? {
            username: profile.username,
            full_name: profile.full_name
          } : undefined,
          roles: roles as UserRole[]
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: UserRole) => {
    const { error } = await assignRole(userId, role);
    if (!error) {
      await fetchUsers(); // Refresh the list
    } else {
      console.error('Error assigning role:', error);
    }
  };

  const handleRemoveRole = async (userId: string, role: UserRole) => {
    const { error } = await removeRole(userId, role);
    if (!error) {
      await fetchUsers(); // Refresh the list
    } else {
      console.error('Error removing role:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-600/20 text-purple-400';
      case 'tech': return 'bg-blue-600/20 text-blue-400';
      case 'service_desk': return 'bg-green-600/20 text-green-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'tech': return 'Technician';
      case 'service_desk': return 'Service Desk';
      default: return role;
    }
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 mb-4">Only administrators can access user management.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">User Management</h1>
              <p className="text-sm text-slate-400">Manage user accounts and assign roles</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Administrators</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.roles.includes('admin')).length}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Technicians</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.roles.includes('tech')).length}</p>
              </div>
              <User className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Service Desk</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.roles.includes('service_desk')).length}</p>
              </div>
              <User className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">System Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Roles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.profile?.full_name || user.profile?.username || 'No Name'}
                        </div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span
                              key={role}
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role)}`}
                            >
                              {getRoleDisplayName(role)}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {formatDate(user.last_sign_in_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowRoleModal(true);
                        }}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Manage Roles</h3>
              <p className="text-sm text-slate-400">
                {selectedUser.profile?.full_name || selectedUser.email}
              </p>
            </div>
            <div className="p-6 space-y-4">
              {(['admin', 'tech', 'service_desk'] as UserRole[]).map((role) => (
                <div key={role} className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{getRoleDisplayName(role)}</span>
                  </div>
                  <div>
                    {selectedUser.roles.includes(role) ? (
                      <button
                        onClick={() => handleRemoveRole(selectedUser.id, role)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignRole(selectedUser.id, role)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
