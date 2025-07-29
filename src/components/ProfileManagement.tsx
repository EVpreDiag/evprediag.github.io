
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Save, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';

const ProfileManagement = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync form data with profile when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Only update full_name and avatar_url
    const updateData = {
      full_name: formData.full_name,
      avatar_url: formData.avatar_url
    };

    const { error } = await updateProfile(updateData);

    if (error) {
      setError('Failed to update profile. Please try again.');
    } else {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <h1 className="text-xl font-bold text-white">Profile Management</h1>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-6 h-6 text-white ${profile?.avatar_url ? 'hidden' : ''}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {profile?.full_name || 'User Profile'}
              </h2>
              <p className="text-slate-400">Manage your account information</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-slate-700/30 border-slate-600 text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={formData.username}
                disabled
                className="bg-slate-700/30 border-slate-600 text-slate-400 cursor-not-allowed"
                placeholder="Username cannot be changed"
              />
              <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Avatar URL
              </label>
              <Input
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Enter avatar image URL"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
