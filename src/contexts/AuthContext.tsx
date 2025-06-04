
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

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
  fetchUserRoles: () => Promise<void>;
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
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile and roles
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
            await fetchUserRoles();
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
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
        fetchUserRoles();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      setUserRoles(data?.map(item => item.role) || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
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
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
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
      return { error: new Error('Only admins can assign roles') };
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_by: user?.id
      });

    return { error };
  };

  const removeRole = async (userId: string, role: UserRole) => {
    if (!isAdmin()) {
      return { error: new Error('Only admins can remove roles') };
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

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
