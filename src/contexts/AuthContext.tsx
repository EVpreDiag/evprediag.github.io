
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { secureLog } from '../utils/securityUtils';

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

type UserRole = 'admin' | 'tech' | 'service_desk';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  userRoles: UserRole[];
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { username?: string; full_name?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  assignRole: (userId: string, role: UserRole) => Promise<{ error: any }>;
  removeRole: (userId: string, role: UserRole) => Promise<{ error: any }>;
  fetchUserRoles: (userId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        secureLog(`Auth state changed: ${event}`, 'info');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential Supabase client deadlocks
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            await fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      secureLog('Initial session check completed', 'info');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      secureLog('Fetching user profile', 'info');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        secureLog('Error fetching profile', 'error', { error: error.message });
        return;
      }

      setProfile(data);
    } catch (error) {
      secureLog('Exception in fetchUserProfile', 'error', error);
    }
  };

  const fetchUserRoles = async (userId?: string) => {
    const fetchId = userId || user?.id;
    
    if (!fetchId) {
      secureLog('No user ID available for fetching roles', 'warn');
      return;
    }

    try {
      secureLog('Fetching user roles', 'info');
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', fetchId);

      if (error) {
        secureLog('Error fetching user roles', 'error', { error: error.message });
        return;
      }

      const roles = data?.map(item => item.role as UserRole) || [];
      setUserRoles(roles);
    } catch (error) {
      secureLog('Exception in fetchUserRoles', 'error', error);
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    
    if (error) {
      secureLog('Sign up error', 'error', { error: error.message });
    } else {
      secureLog('Sign up successful', 'info');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      secureLog('Sign in error', 'error', { error: error.message });
    } else {
      secureLog('Sign in successful', 'info');
    }
    
    return { error };
  };

  const signOut = async () => {
    secureLog('User signing out', 'info');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setUserRoles([]);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
      secureLog('Profile updated successfully', 'info');
    } else if (error) {
      secureLog('Profile update error', 'error', { error: error.message });
    }

    return { error };
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const assignRole = async (userId: string, role: UserRole) => {
    if (!isAdmin()) {
      const error = new Error('Only admins can assign roles');
      secureLog('Unauthorized role assignment attempt', 'warn');
      return { error };
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_by: user?.id
      });

    if (error) {
      secureLog('Role assignment error', 'error', { error: error.message });
    } else {
      secureLog(`Role ${role} assigned to user ${userId}`, 'info');
    }

    return { error };
  };

  const removeRole = async (userId: string, role: UserRole) => {
    if (!isAdmin()) {
      const error = new Error('Only admins can remove roles');
      secureLog('Unauthorized role removal attempt', 'warn');
      return { error };
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) {
      secureLog('Role removal error', 'error', { error: error.message });
    } else {
      secureLog(`Role ${role} removed from user ${userId}`, 'info');
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      userRoles,
      isAuthenticated: !!user,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      hasRole,
      isAdmin,
      assignRole,
      removeRole,
      fetchUserRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
