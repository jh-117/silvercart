/**
 * Unit Tests: profile.service.ts
 */

jest.mock('../services/supabase');
jest.mock('expo-file-system/legacy', () => ({
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
    deleteAsync: jest.fn(),
    getInfoAsync: jest.fn(),
    documentDirectory: '/mock/documents/',
    cacheDirectory: '/mock/cache/',
}));
jest.mock('base64-arraybuffer', () => ({
    decode: jest.fn(() => new ArrayBuffer(8)),
    encode: jest.fn(() => 'base64string'),
}));

import { profileService } from '../services/profile.service';
import { mockFrom, mockStorageFrom } from '../__mocks__/supabase';
import * as FileSystem from 'expo-file-system/legacy';

function mockChain(resolved: any) {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.maybeSingle = jest.fn().mockResolvedValue(resolved);
    chain.then = (resolve: any) => Promise.resolve(resolved).then(resolve);
    return chain;
}

beforeEach(() => jest.clearAllMocks());

const MOCK_PROFILE = {
    id: 'user-1',
    full_name: 'Ahmad Bin Ali',
    avatar_url: 'https://example.com/avatar.jpg',
    phone: '+60183714142',
    address: 'Kuala Lumpur',
    dob: '1955-06-15',
};

// ─── getProfile ───────────────────────────────────────────────────────────────

describe('profileService.getProfile', () => {
    it('returns profile data when user exists', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: MOCK_PROFILE, error: null }));
        const result = await profileService.getProfile('user-1');
        expect(result.error).toBeNull();
        expect(result.data?.full_name).toBe('Ahmad Bin Ali');
    });

    it('returns null data gracefully for new users', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: null }));
        const result = await profileService.getProfile('new-user');
        expect(result.data).toBeNull();
        expect(result.error).toBeNull();
    });

    it('returns error object on DB failure', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'RLS block' } }));
        const result = await profileService.getProfile('blocked-user');
        expect(result.error?.message).toBe('RLS block');
    });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('profileService.updateProfile', () => {
    it('updates profile fields and returns no error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ error: null }));
        const result = await profileService.updateProfile('user-1', { full_name: 'Updated Name' });
        expect(result.error).toBeNull();
    });

    it('returns error on validation failure', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ error: { message: 'Validation error' } }));
        const result = await profileService.updateProfile('user-1', { full_name: '' });
        expect(result.error).not.toBeNull();
    });
});

// ─── uploadAvatar ─────────────────────────────────────────────────────────────

describe('profileService.uploadAvatar', () => {
    // Get the mocked supabase module directly to override storage per test
    const { supabase: mockedSupabase } = require('../__mocks__/supabase');

    it('uploads image and returns public URL', async () => {
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('base64data');

        const uploadMock = jest.fn().mockResolvedValueOnce({ error: null });
        const getPublicUrlMock = jest.fn().mockReturnValueOnce({ data: { publicUrl: 'https://example.com/avatar.jpg' } });
        mockedSupabase.storage.from = jest.fn().mockReturnValue({ upload: uploadMock, getPublicUrl: getPublicUrlMock });

        const result = await profileService.uploadAvatar('user-1', 'file:///photo.jpg');
        expect(result.error).toBeNull();
        expect(result.url).toBe('https://example.com/avatar.jpg');
    });

    it('returns error if image exceeds 2MB', async () => {
        // ~2.7MB of base64 — approx 2.7MB binary — exceeds 2MB limit
        const bigBase64 = 'x'.repeat(3_600_000);
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(bigBase64);

        const result = await profileService.uploadAvatar('user-1', 'file:///bigphoto.jpg');
        expect(result.url).toBeNull();
        expect(result.error?.message).toContain('2MB');
    });

    it('returns error if storage upload fails', async () => {
        (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce('base64data');

        const uploadMock = jest.fn().mockResolvedValueOnce({ error: { message: 'Bucket full' } });
        mockedSupabase.storage.from = jest.fn().mockReturnValue({ upload: uploadMock, getPublicUrl: jest.fn() });

        const result = await profileService.uploadAvatar('user-1', 'file:///photo.jpg');
        expect(result.url).toBeNull();
        expect(result.error?.message).toBe('Bucket full');
    });
});
