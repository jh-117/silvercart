import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    role: string | null;
    profile: any | null;
    hasCompletedSetup: boolean;
    setHasCompletedSetup: (val: boolean) => void;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    isAdmin: false,
    role: null,
    profile: null,
    hasCompletedSetup: false,
    setHasCompletedSetup: (val: boolean) => { },
    signOut: async () => { },
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

    /**
     * Determine the user's role using two strategies:
     * 1. app_metadata.role — stored in the JWT, no DB query or RLS needed
     * 2. profiles table   — fallback if app_metadata not set
     *
     * To set app_metadata, run in Supabase SQL Editor:
     *   UPDATE auth.users
     *   SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
     *   WHERE email = 'admin@silvercart.com';
     */
    const fetchRole = async (currentUser: User) => {
        try {
            console.log('[Auth] fetchRole for userId:', currentUser.id);

            // Strategy 1: app_metadata (JWT-based, bypasses RLS entirely)
            // We can read this directly from the currentUser object we already have from the session
            const metaRole = currentUser?.app_metadata?.role;
            console.log('[Auth] app_metadata.role:', metaRole);

            if (metaRole) {
                console.log('[Auth] ✅ Role from app_metadata:', metaRole);
                setRole(metaRole);
                return;
            }

            // Strategy 2: profiles table
            console.log('[Auth] Fetching role from profiles table...');

            // Add a timeout to prevent infinite hanging
            const fetchPromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();

            const timeoutPromise = new Promise<{ data: any, error: any }>((_, reject) => {
                setTimeout(() => reject(new Error('Supabase request timed out after 10s')), 10000);
            });

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            console.log('[Auth] profiles table result:', { role: data?.role, error: error?.message });

            if (data) {
                setProfile(data);
            }

            // If profile is fully configured, they don't need setup flow
            if (data && data.full_name) {
                setHasCompletedSetup(true);
            }

            if (!error && data?.role) {
                console.log('[Auth] ✅ Role from profiles table:', data.role);
                setRole(data.role);
                return;
            }

            console.warn('[Auth] ⚠️ No role found. Defaulting to "user".');
            setRole('user');

        } catch (e: any) {
            console.error('[Auth] fetchRole exception:', e?.message || e);
            setRole('user');
        }
    };

    useEffect(() => {
        const loadSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchRole(session.user);
                }
            } catch (error) {
                console.error('Error loading session:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchRole(session.user);
                } else {
                    setRole(null);
                }
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        await SecureStore.deleteItemAsync('biometrics_enabled');
    };

    const value = {
        session,
        user,
        loading,
        isAdmin: role === 'admin',
        role,
        profile,
        hasCompletedSetup,
        setHasCompletedSetup,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
