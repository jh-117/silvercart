import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

// Screens
import OnboardingBiometricScreen from '../screens/special/OnboardingBiometricScreen';
import OnboardingTutorialScreen from '../screens/special/OnboardingTutorialScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="OnboardingBiometric"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="OnboardingBiometric" component={OnboardingBiometricScreen} />
            <Stack.Screen name="OnboardingTutorial" component={OnboardingTutorialScreen} />
        </Stack.Navigator>
    );
}
