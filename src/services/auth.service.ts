import { supabase } from './supabase';
import { AuthResult, AuthError, User } from '../types/auth.types';


export const authService = {
    async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: 'silvercart://auth/callback',
            }
        });

        if (error) {
            return { data: null, error: { message: error.message, status: error.status } };
        }

        return { data: { user: data.user as User, session: data.session }, error: null };
    },

    async signInWithEmail(email: string, password: string): Promise<AuthResult> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { data: null, error: { message: error.message, status: error.status } };
        }

        return { data: { user: data.user as User, session: data.session }, error: null };
    },

    async signOut(): Promise<{ error: AuthError | null }> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { error: { message: error.message, status: error.status } };
        }
        return { error: null };
    },

    /** Send a password-reset email — redirects to silvercart:// deep link */
    async resetPassword(email: string): Promise<{ error: string | null }> {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'silvercart://reset-password',
        });
        if (error) return { error: error.message };
        return { error: null };
    },

    async getSession() {
        return await supabase.auth.getSession();
    },

    async getUser() {
        return await supabase.auth.getUser();
    },

    /**
     * Send a phone OTP for login.
     * Phone must be in E.164 format, e.g. "+60183714142"
     */
    async sendPhoneOtp(phone: string): Promise<{ error: string | null }> {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) return { error: error.message };
        return { error: null };
    },

    /**
     * Verify the phone OTP received via SMS.
     * On success the session is set and AuthContext picks it up automatically.
     * Also upserts a profiles row so the user always has a role.
     */
    async verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });

        if (error) {
            return { data: null, error: { message: error.message, status: error.status } };
        }

        if (data.user) {
            // Ensure a profiles row exists so role is always resolvable
            await supabase.from('profiles').upsert(
                { id: data.user.id, phone, role: 'user' },
                { onConflict: 'id' }
            );
        }

        return { data: { user: data.user as User, session: data.session }, error: null };
    },
};
