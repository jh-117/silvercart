/**
 * Unit Tests: auth.service.ts
 * All Supabase calls are intercepted via src/__mocks__/supabase.ts
 */

jest.mock('../services/supabase');

import { authService } from '../services/auth.service';
import {
    mockSignUp,
    mockSignInWithPassword,
    mockSignOut,
    mockGetSession,
    mockResetPasswordForEmail,
    mockSignInWithOtp,
    mockVerifyOtp,
    mockFrom,
    mockUpsert,
} from '../__mocks__/supabase';

const MOCK_USER = { id: 'user-123', email: 'test@test.com', app_metadata: {}, user_metadata: {} };
const MOCK_SESSION = { access_token: 'tok', user: MOCK_USER };

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── signUpWithEmail ───────────────────────────────────────────────────────────

describe('authService.signUpWithEmail', () => {
    it('returns user and session on success', async () => {
        mockSignUp.mockResolvedValueOnce({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null });
        const result = await authService.signUpWithEmail('test@test.com', 'Password1!');
        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'test@test.com',
            password: 'Password1!',
            options: { emailRedirectTo: 'silvercart://auth/callback' },
        });
        expect(result.error).toBeNull();
        expect(result.data?.user?.id).toBe('user-123');
    });

    it('returns error on Supabase failure', async () => {
        mockSignUp.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Email taken', status: 422 } });
        const result = await authService.signUpWithEmail('taken@test.com', 'Password1!');
        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Email taken');
    });
});

// ─── signInWithEmail ───────────────────────────────────────────────────────────

describe('authService.signInWithEmail', () => {
    it('returns user and session on success', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null });
        const result = await authService.signInWithEmail('test@test.com', 'Password1!');
        expect(result.error).toBeNull();
        expect(result.data?.session).toBe(MOCK_SESSION);
    });

    it('returns error on wrong password', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Invalid login credentials', status: 400 } });
        const result = await authService.signInWithEmail('test@test.com', 'wrongpass');
        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Invalid login credentials');
    });
});

// ─── signOut ──────────────────────────────────────────────────────────────────

describe('authService.signOut', () => {
    it('returns null error on success', async () => {
        mockSignOut.mockResolvedValueOnce({ error: null });
        const result = await authService.signOut();
        expect(result.error).toBeNull();
        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('returns error on failure', async () => {
        mockSignOut.mockResolvedValueOnce({ error: { message: 'Sign out failed', status: 500 } });
        const result = await authService.signOut();
        expect(result.error?.message).toBe('Sign out failed');
    });
});

// ─── resetPassword ─────────────────────────────────────────────────────────────

describe('authService.resetPassword', () => {
    it('calls resetPasswordForEmail with correct redirect URL', async () => {
        mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });
        const result = await authService.resetPassword('test@test.com');
        expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@test.com', {
            redirectTo: 'silvercart://reset-password',
        });
        expect(result.error).toBeNull();
    });

    it('returns error string on failure', async () => {
        mockResetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'User not found' } });
        const result = await authService.resetPassword('nobody@test.com');
        expect(result.error).toBe('User not found');
    });
});

// ─── sendPhoneOtp ─────────────────────────────────────────────────────────────

describe('authService.sendPhoneOtp', () => {
    it('sends OTP to phone number', async () => {
        mockSignInWithOtp.mockResolvedValueOnce({ error: null });
        const result = await authService.sendPhoneOtp('+60183714142');
        expect(mockSignInWithOtp).toHaveBeenCalledWith({ phone: '+60183714142' });
        expect(result.error).toBeNull();
    });

    it('returns error on failure', async () => {
        mockSignInWithOtp.mockResolvedValueOnce({ error: { message: 'Invalid phone number' } });
        const result = await authService.sendPhoneOtp('not-a-phone');
        expect(result.error).toBe('Invalid phone number');
    });
});

// ─── verifyPhoneOtp ────────────────────────────────────────────────────────────

describe('authService.verifyPhoneOtp', () => {
    it('returns user and session on valid OTP, upserts profile', async () => {
        mockVerifyOtp.mockResolvedValueOnce({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null });

        // Mock the upsert chain: from('profiles').upsert(...)
        const upsertMock = jest.fn().mockResolvedValueOnce({ error: null });
        mockFrom.mockReturnValueOnce({ upsert: upsertMock });

        const result = await authService.verifyPhoneOtp('+60183714142', '123456');
        expect(result.error).toBeNull();
        expect(result.data?.user?.id).toBe('user-123');
    });

    it('returns error on bad OTP token', async () => {
        mockVerifyOtp.mockResolvedValueOnce({ data: { user: null, session: null }, error: { message: 'Token has expired or is invalid', status: 400 } });
        const result = await authService.verifyPhoneOtp('+60183714142', '000000');
        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('Token has expired or is invalid');
    });
});
