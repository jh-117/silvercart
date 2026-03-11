import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';

jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    RN.Linking = { openURL: jest.fn().mockResolvedValue(true) };
    return RN;
});

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaView: ({ children }: any) => <>{children}</>,
    useSafeAreaInsets: () => ({ bottom: 0, top: 0 }),
}));

jest.mock('../theme', () => require('./__mocks__/themeMock'));

jest.mock('../contexts/AppSettingsContext', () => ({
    useAppSettings: () => ({
        settings: {
            push_notifications_enabled: false,
            email_notifications_enabled: true,
            sms_notifications_enabled: false,
            text_size: 'medium',
            high_contrast: false,
            language: 'en',
        },
        loading: false,
        updateSettings: jest.fn(),
    }),
}));

jest.mock('../components/ui/CustomSwitch', () => {
    const { TouchableOpacity, Text } = require('react-native');
    return function MockSwitch({ value, onValueChange, testID }: any) {
        return (
            <TouchableOpacity testID={testID} onPress={() => onValueChange(!value)}>
                <Text>{value ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
        );
    };
});

jest.mock('../components/ui/CustomAlert', () => () => null);

jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
}));

describe('AppSettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    });

    it('should call scheduleNotificationAsync when push notification is toggled on', async () => {
        const { getByTestId } = render(<AppSettingsScreen />);

        await act(async () => {
            fireEvent.press(getByTestId('switch-push-notifications'));
        });

        expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
});
