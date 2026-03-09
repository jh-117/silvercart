/**
 * Mock for @supabase/supabase-js client.
 * Provides a jest.fn()-based API that mirrors the real Supabase query builder chain.
 */

const mockSingle = jest.fn();
const mockMaybeSingle = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockLimit = jest.fn();
const mockOr = jest.fn();
const mockUpsert = jest.fn();

// Chain builder — each method returns an object that has all the query methods
const chainBuilder = () => ({
    select: mockSelect.mockReturnValue(chainBuilder()),
    insert: mockInsert.mockReturnValue(chainBuilder()),
    update: mockUpdate.mockReturnValue(chainBuilder()),
    delete: mockDelete.mockReturnValue(chainBuilder()),
    upsert: mockUpsert.mockReturnValue(chainBuilder()),
    eq: mockEq.mockReturnValue(chainBuilder()),
    order: mockOrder.mockReturnValue(chainBuilder()),
    limit: mockLimit.mockReturnValue(chainBuilder()),
    or: mockOr.mockReturnValue(chainBuilder()),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
});

const mockFrom = jest.fn(() => chainBuilder());

const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockGetUser = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockVerifyOtp = jest.fn();
const mockOnAuthStateChange = jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } }));

const mockStorageUpload = jest.fn();
const mockStorageGetPublicUrl = jest.fn();
const mockStorageFrom = jest.fn(() => ({
    upload: mockStorageUpload,
    getPublicUrl: mockStorageGetPublicUrl,
}));

export const supabase = {
    from: mockFrom,
    auth: {
        signUp: mockSignUp,
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
        getSession: mockGetSession,
        getUser: mockGetUser,
        resetPasswordForEmail: mockResetPasswordForEmail,
        signInWithOtp: mockSignInWithOtp,
        verifyOtp: mockVerifyOtp,
        onAuthStateChange: mockOnAuthStateChange,
    },
    storage: {
        from: mockStorageFrom,
    },
};

// Export the individual mocks so tests can override them
export {
    mockFrom,
    mockSingle,
    mockMaybeSingle,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockOrder,
    mockLimit,
    mockOr,
    mockUpsert,
    mockSignUp,
    mockSignInWithPassword,
    mockSignOut,
    mockGetSession,
    mockGetUser,
    mockResetPasswordForEmail,
    mockSignInWithOtp,
    mockVerifyOtp,
    mockStorageUpload,
    mockStorageGetPublicUrl,
    mockStorageFrom,
};
