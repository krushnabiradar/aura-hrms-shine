
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
  signup: (email: string, password: string, userData?: { first_name?: string; last_name?: string; role?: UserRole; tenant_id?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create profile from user metadata with improved error handling
  const createProfileFromMetadata = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Creating profile from user metadata for:', supabaseUser.id);
      
      const userData = supabaseUser.user_metadata || {};
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: (userData.role as UserRole) || 'employee' as UserRole,
        tenant_id: userData.tenant_id || null
      };

      console.log('Profile data to insert:', profileData);

      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating profile from metadata:', error);
        
        // Try a simple insert if upsert fails
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
          
        if (insertError) {
          console.error('Error inserting profile:', insertError);
          return null;
        }
        
        console.log('Profile inserted successfully:', insertedProfile);
        return insertedProfile;
      }

      console.log('Profile created/updated successfully from metadata:', profile);
      return profile;
    } catch (error) {
      console.error('Error in createProfileFromMetadata:', error);
      return null;
    }
  };

  // Fetch user profile with enhanced fallback logic
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!profile) {
        console.log('Profile not found, attempting to create from user metadata');
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        if (supabaseUser) {
          return await createProfileFromMetadata(supabaseUser);
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

  // Set user from profile data
  const setUserFromProfile = (profile: any) => {
    if (profile) {
      const userData: User = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        tenant_id: profile.tenant_id,
        avatar_url: profile.avatar_url
      };
      console.log('Setting user from profile:', userData);
      setUser(userData);
    } else {
      console.log('No profile data, setting user to null');
      setUser(null);
    }
  };

  // Enhanced session management with automatic session tracking
  const createUserSession = async (session: Session) => {
    if (!session?.user) return;

    try {
      const userAgent = navigator.userAgent;
      const sessionToken = session.access_token;
      const expiresAt = new Date(session.expires_at! * 1000).toISOString();
      
      // Get IP address (simplified for demo)
      const ipAddress = '127.0.0.1'; // In production, get from server

      // Check if session already exists to prevent duplicates
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .maybeSingle();
        
      if (existingSession) {
        console.log('Session already exists, skipping creation');
        return;
      }

      // Get concurrent session limit
      const { data: limitSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_concurrent_limit')
        .maybeSingle();
        
      const limit = limitSetting ? parseInt(String(limitSetting.setting_value)) : 3;
      
      // Count current active sessions for user
      const { data: currentSessions } = await supabase
        .from('user_sessions')
        .select('id, last_activity')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: true });
        
      // If limit exceeded, deactivate oldest session
      if (currentSessions && currentSessions.length >= limit) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', currentSessions[0].id);
      }

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: session.user.id,
          session_token: sessionToken,
          expires_at: expiresAt,
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error creating user session:', error);
      } else {
        console.log('User session created successfully');
      }
    } catch (error) {
      console.error('Error in createUserSession:', error);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    let isMounted = true;
    let isInitialized = false;
    
    const initializeAuth = async () => {
      try {
        // First, get the current session
        console.log('Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          console.log('Initial session:', initialSession?.user?.id || 'No session');
          
          if (isMounted && !isInitialized) {
            setSession(initialSession);
            
            if (initialSession?.user) {
              console.log('Found initial session, fetching profile...');
              const profile = await fetchUserProfile(initialSession.user.id);
              if (isMounted) {
                setUserFromProfile(profile);
                // Track existing session
                await createUserSession(initialSession);
              }
            } else {
              console.log('No initial session found');
              if (isMounted) {
                setUser(null);
              }
            }
            
            isInitialized = true;
            if (isMounted) {
              setIsLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (isMounted && !isInitialized) {
          setIsLoading(false);
          isInitialized = true;
        }
      }
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id || 'No session');
        
        // Only handle auth changes after initial setup
        if (isInitialized) {
          setSession(session);
          
          if (session?.user) {
            console.log('User logged in via state change, fetching profile...');
            const profile = await fetchUserProfile(session.user.id);
            if (isMounted) {
              setUserFromProfile(profile);
              // Create session tracking for new logins
              if (event === 'SIGNED_IN') {
                await createUserSession(session);
              }
            }
          } else {
            console.log('User logged out via state change');
            if (isMounted) {
              setUser(null);
            }
          }
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Add a safety timeout of 10 seconds
    const timeoutId = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.log('Auth initialization timeout after 10 seconds');
        setIsLoading(false);
        isInitialized = true;
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, userData?: { first_name?: string; last_name?: string; role?: UserRole; tenant_id?: string }) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', email, 'with role:', userData?.role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            role: userData?.role || 'employee',
            tenant_id: userData?.tenant_id || null
          }
        }
      });

      if (error) throw error;

      console.log('Signup successful:', data);

      // If user is immediately confirmed, fetch/create profile
      if (data.user && data.session) {
        console.log('User confirmed immediately, fetching/creating profile');
        const profile = await fetchUserProfile(data.user.id);
        setUserFromProfile(profile);
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
      // Session tracking will be handled by the auth state listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Cleanup current session before logging out
      if (session) {
        const { error: sessionError } = await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('session_token', session.access_token);
          
        if (sessionError) {
          console.error('Error deactivating session:', sessionError);
        }
      }

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
