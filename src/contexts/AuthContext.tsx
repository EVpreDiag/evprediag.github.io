import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Define the roles that a user can have
export type UserRole = 'admin' | 'technician' | 'front_desk' | 'super_admin' | 'station_admin';

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  station_id?: string;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userRoles: UserRole[];
  loading: boolean;
  isAuthenticated: () => boolean;
  isAuthorized: (roles: UserRole[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isStationAdmin: () => boolean;
  isTechnician: () => boolean;
  isFrontDesk: () => boolean;
  canAccessStationData: () => boolean;
  canManageUsers: () => boolean;
  canModifyAllReports: () => boolean;
  canModifyOwnReportsOnly: () => boolean;
  fetchUserRoles: (userId: string) => Promise<UserRole[]>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  assignRole: (userId: string, role: UserRole, stationId?: string) => Promise<{ error: any }>;
  removeRole: (userId: string, role: UserRole) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  profile: null,
  userRoles: [],
  loading: true,
  isAuthenticated: () => false,
  isAuthorized: () => false,
  hasRole: () => false,
  isAdmin: () => false,
  isSuperAdmin: () => false,
  isStationAdmin: () => false,
  isTechnician: () => false,
  isFrontDesk: () => false,
  canAccessStationData: () => false,
  canManageUsers: () => false,
  canModifyAllReports: () => false,
  canModifyOwnReportsOnly: () => false,
  fetchUserRoles: async () => [],
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  assignRole: async () => ({ error: null }),
  removeRole: async () => ({ error: null })
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .rpc('get_user_roles', { _user_id: userId });

      if (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        return [];
      }

      const roles = data?.map((row: any) => row.role) || [];
      console.log('User roles fetched:', roles);
      setUserRoles(roles);
      return roles;
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setUserRoles([]);
      return [];
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setUserRoles([]);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : null);
    }

    return { error };
  };

  const assignRole = async (userId: string, role: UserRole, stationId?: string) => {
    const roleData: any = {
      user_id: userId,
      role: role,
      assigned_by: user?.id,
      assigned_at: new Date().toISOString()
    };

    // Add station_id if provided
    if (stationId) {
      roleData.station_id = stationId;
    }

    const { error } = await supabase
      .from('user_roles')
      .insert(roleData);

    return { error };
  };

  const removeRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    return { error };
  };

  const isAuthenticated = (): boolean => {
    return !!user && !!session;
  };

  const isAuthorized = (roles: UserRole[]): boolean => {
    if (!isAuthenticated()) return false;
    return roles.some(role => userRoles.includes(role));
  };

  const hasRole = (role: UserRole): boolean => {
    return userRoles.includes(role);
  };

  const isAdmin = (): boolean => {
    return userRoles.includes('admin');
  };

  const isSuperAdmin = (): boolean => {
    return userRoles.includes('super_admin');
  };

  const isStationAdmin = (): boolean => {
    return userRoles.includes('station_admin');
  };

  const isTechnician = (): boolean => {
    return userRoles.includes('technician');
  };

  const isFrontDesk = (): boolean => {
    return userRoles.includes('front_desk');
  };

  const canAccessStationData = (): boolean => {
    return isSuperAdmin() || isStationAdmin() || isTechnician() || isFrontDesk();
  };

  const canManageUsers = (): boolean => {
    return isSuperAdmin() || isStationAdmin();
  };

  const canModifyAllReports = (): boolean => {
    return isSuperAdmin() || isStationAdmin() || isTechnician();
  };

  const canModifyOwnReportsOnly = (): boolean => {
    return isFrontDesk();
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (!mounted) return;
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (event === 'SIGNED_IN' && session?.user?.id) {
            // Defer data fetching to prevent potential deadlocks
            setTimeout(() => {
              if (mounted) {
                fetchUserProfile(session.user.id);
                fetchUserRoles(session.user.id);
              }
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            setProfile(null);
            setUserRoles([]);
          }
        });

        // THEN check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        console.log('Initial session:', session?.user?.id);
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user?.id) {
            fetchUserProfile(session.user.id);
            fetchUserRoles(session.user.id).finally(() => {
              if (mounted) {
                setLoading(false);
                setInitialized(true);
              }
            });
          } else {
            setLoading(false);
            setInitialized(true);
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const value: AuthContextProps = {
    session,
    user,
    profile,
    userRoles,
    loading,
    isAuthenticated,
    isAuthorized,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isStationAdmin,
    isTechnician,
    isFrontDesk,
    canAccessStationData,
    canManageUsers,
    canModifyAllReports,
    canModifyOwnReportsOnly,
    fetchUserRoles,
    signIn,
    signUp,
    signOut,
    updateProfile,
    assignRole,
    removeRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
