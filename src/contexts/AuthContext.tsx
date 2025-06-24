import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// Define the roles that a user can have
export type UserRole = 'admin' | 'technician' | 'front_desk' | 'super_admin' | 'station_admin';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  userRoles: UserRole[];
  loading: boolean;
  isAuthenticated: () => boolean;
  isAuthorized: (roles: UserRole[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isStationAdmin: () => boolean;
  fetchUserRoles: (userId: string) => Promise<UserRole[]>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  userRoles: [],
  loading: true,
  isAuthenticated: () => false,
  isAuthorized: () => false,
  hasRole: () => false,
  isAdmin: () => false,
  isSuperAdmin: () => false,
  isStationAdmin: () => false,
  fetchUserRoles: async () => []
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('Fetching roles for user:', userId);
      
      // Use the database function to get user roles
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.id) {
        // Fetch user roles after setting session
        fetchUserRoles(session.user.id).finally(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        // Defer role fetching slightly to avoid potential conflicts
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setUserRoles([]);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextProps = {
    session,
    user,
    userRoles,
    loading,
    isAuthenticated,
    isAuthorized,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isStationAdmin,
    fetchUserRoles
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
