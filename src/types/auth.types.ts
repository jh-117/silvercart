import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user';

export interface User extends SupabaseUser {
    role?: UserRole;
    // We can add custom user properties here if we extend the Supabase user
    // or merge with a 'profiles' table data. 
    // For now, extending SupabaseUser is safe.
}

export interface AuthResult {
    data: {
        user: User | null;
        session: Session | null;
    } | null;
    error: AuthError | null;
}

export interface AuthError {
    message: string;
    status?: number;
}
