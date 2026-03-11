import React from 'react';
import { render } from '@testing-library/react-native';
import GlobalVoiceButton from '../components/ui/GlobalVoiceButton';
import { useNavigationState } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn() }),
    useNavigationState: jest.fn()
}));

jest.mock('../hooks/useVoiceRecognition', () => ({
    useVoiceRecognition: () => ({
        isListening: false,
        startListening: jest.fn(),
        stopListening: jest.fn()
    })
}));

jest.mock('../theme', () => ({
    theme: {
        colors: {
            primary: '#000',
            secondary: '#111',
            white: '#FFF'
        }
    }
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ bottom: 20 }),
    SafeAreaProvider: ({ children }: any) => <>{children}</>
}));

jest.mock('../hooks/useAuth', () => ({
    useAuth: () => ({ session: true, isAdmin: false, hasCompletedSetup: true })
}));

describe('GlobalVoiceButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render on the Cart screen', () => {
        (useNavigationState as jest.Mock).mockReturnValue('Cart');
        const { getByTestId } = render(<GlobalVoiceButton />);
        expect(getByTestId('global-voice-button')).toBeTruthy();
    });

    it('should hide (return null) on the Home screen', () => {
        (useNavigationState as jest.Mock).mockReturnValue('Home');
        const { queryByTestId } = render(<GlobalVoiceButton />);
        expect(queryByTestId('global-voice-button')).toBeNull();
    });

    it('should hide (return null) on the Onboarding screen', () => {
        (useNavigationState as jest.Mock).mockReturnValue('OnboardingBiometric');
        const { queryByTestId } = render(<GlobalVoiceButton />);
        expect(queryByTestId('global-voice-button')).toBeNull();
    });
});
