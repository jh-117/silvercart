import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Linking } from 'react-native';
import SupportScreen from '../screens/profile/SupportScreen';

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ bottom: 0, top: 0 }),
}));

jest.mock('../theme', () => require('./__mocks__/themeMock'));

jest.mock('../contexts/ToastProvider', () => ({
    useToast: () => ({
        showInfo: jest.fn(),
        showSuccess: jest.fn(),
        showError: jest.fn(),
    }),
}));

describe('SupportScreen', () => {
    let openURLSpy: jest.SpyInstance;

    beforeEach(() => {
        // Spy on Linking.openURL so .catch() still works on the real object
        openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    });

    afterEach(() => {
        openURLSpy.mockRestore();
    });

    it('should call Linking.openURL with tel: when "Call Us" is pressed', async () => {
        const { getByText } = render(<SupportScreen />);
        await act(async () => {
            fireEvent.press(getByText('Call Us'));
        });
        expect(openURLSpy).toHaveBeenCalledWith('tel:1800887458');
    });

    it('should call Linking.openURL with mailto: when "Email Us" is pressed', async () => {
        const { getByText } = render(<SupportScreen />);
        await act(async () => {
            fireEvent.press(getByText('Email Us'));
        });
        expect(openURLSpy).toHaveBeenCalledWith('mailto:support@silvercart.my');
    });
});
