import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import EmailRegisterScreen from '../screens/auth/EmailRegisterScreen';
import PhoneRegisterScreen from '../screens/auth/PhoneRegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import VerifyResetOtpScreen from '../screens/auth/VerifyResetOtpScreen';
import SetPasswordScreen from '../screens/auth/SetPasswordScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SupportFormScreen from '../screens/profile/SupportFormScreen';
import SafetyGuideScreen from '../screens/profile/SafetyGuideScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
    return (
        <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="EmailRegister" component={EmailRegisterScreen} />
            <Stack.Screen name="PhoneRegister" component={PhoneRegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="VerifyResetOtp" component={VerifyResetOtpScreen} />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="SupportForm" component={SupportFormScreen} />
            <Stack.Screen name="SafetyGuide" component={SafetyGuideScreen} />
        </Stack.Navigator>
    );
}
