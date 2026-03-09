/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    testEnvironment: 'node',
    testPathPattern: '.*\\.test\\.[jt]sx?$',
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
    moduleNameMapper: {
        // Map supabase to our mock
        '^../services/supabase$': '<rootDir>/src/__mocks__/supabase.ts',
        '^./supabase$': '<rootDir>/src/__mocks__/supabase.ts',
        '^../services/supabase.ts$': '<rootDir>/src/__mocks__/supabase.ts',
        // Stub expo-file-system which is native-only
        '^expo-file-system/legacy$': '<rootDir>/src/__mocks__/expo-file-system.ts',
        '^expo-file-system$': '<rootDir>/src/__mocks__/expo-file-system.ts',
        // Stub base64-arraybuffer
        '^base64-arraybuffer$': '<rootDir>/src/__mocks__/base64-arraybuffer.ts',
    },
    setupFilesAfterFramework: [],
    globals: {
        'ts-jest': {
            tsconfig: {
                jsx: 'react',
            },
        },
    },
};
