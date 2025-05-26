
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Use the enum from the database types
export type UserRole = Database['public']['Enums']['user_role'];

// Define our user type based on the profiles table
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  tenant_id?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: { first_name?: string; last_name?: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create profile if it doesn't exist
  const createProfileIfMissing = async (supabaseUser: SupabaseUser, userData?: { first_name?: string; last_name?: string; role?: UserRole }) => {
    try {
      console.log('Creating profile for user:', supabaseUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
          role: userData?.role || 'employee'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      console.log('Profile created successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createProfileIfMissing:', error);
      return null;
    }
  };

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string, userData?: { first_name?: string; last_name?: string; role?: UserRole }) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile');
          const supabaseUser = (await supabase.auth.getUser()).data.user;
          if (supabaseUser) {
            return await createProfileIfMissing(supabaseUser, userData);
          }
        }
        return null;
      }

      console.log('Profile fetched successfully:', profile);
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Fetch the user profile when logged in
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: profile.role,
              tenant_id: profile.tenant_id,
              avatar_url: profile.avatar_url
            });
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              role: profile.role,
              tenant_id: profile.tenant_id,
              avatar_url: profile.avatar_url
            });
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email: string, password: string, userData?: { first_name?: string; last_name?: string; role?: UserRole }) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            role: userData?.role || 'employee'
          }
        }
      });

      if (error) throw error;

      console.log('Signup successful:', data);

      // If user is immediately confirmed, fetch/create profile
      if (data.user && data.session) {
        console.log('User confirmed immediately, fetching profile');
        const profile = await fetchUserProfile(data.user.id, userData);
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            role: profile.role,
            tenant_id: profile.tenant_id,
            avatar_url: profile.avatar_url
          });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Starting login process for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('Login successful:', data);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      isLoading, 
      login,
      signup, 
      logout,
      isAuthenticated: !!session 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
