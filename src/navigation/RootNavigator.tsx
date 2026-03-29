import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { theme } from '../theme';

import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import SetupNavigator from './SetupNavigator';
import MainNavigator from './MainNavigator';
import AdminNavigator from './AdminNavigator';
import CartScreen from '../screens/main/CartScreen';
import SearchResultsScreen from '../screens/products/SearchResultsScreen';
import ProductDetailsScreen from '../screens/products/ProductDetailsScreen';

// Checkout
import CheckoutAddressScreen from '../screens/checkout/CheckoutAddressScreen';
import CheckoutPaymentScreen from '../screens/checkout/CheckoutPaymentScreen';
import CheckoutReviewScreen from '../screens/checkout/CheckoutReviewScreen';
import OrderSuccessScreen from '../screens/checkout/OrderSuccessScreen';

// Orders
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import CancelOrderScreen from '../screens/orders/CancelOrderScreen';
import OrderHistoryScreen from '../screens/orders/OrderHistoryScreen';
import CancellationPolicyScreen from '../screens/orders/CancellationPolicyScreen';

// Profile
import TrustedContactScreen from '../screens/profile/TrustedContactScreen';
import AddTrustedContactScreen from '../screens/profile/AddTrustedContactScreen';
import EditTrustedContactScreen from '../screens/profile/EditTrustedContactScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SecuritySettingsScreen from '../screens/profile/SecuritySettingsScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SafetyGuideScreen from '../screens/profile/SafetyGuideScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import SupportFormScreen from '../screens/profile/SupportFormScreen';
import SupportTicketsScreen from '../screens/profile/SupportTicketsScreen';
import TicketChatScreen from '../screens/profile/TicketChatScreen';
import FavoritesScreen from '../screens/profile/FavoritesScreen';
import RemindersScreen from '../screens/profile/RemindersScreen';

// Auth
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import BiometricUnlockScreen from '../screens/auth/BiometricUnlockScreen';

// Special
import ErrorScreen from '../screens/special/ErrorScreen';
import VoiceSearchScreen from '../screens/voice/VoiceSearchScreen';
import VoiceCommandsHelpScreen from '../screens/voice/VoiceCommandsHelpScreen';
import CategoryScreen from '../screens/products/CategoryScreen';
import OnboardingSafetyScreen from '../screens/special/OnboardingSafetyScreen';

import GlobalVoiceButton from '../components/ui/GlobalVoiceButton';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.backgroundLight }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
}

export default function RootNavigator() {
    const { session, loading, isAdmin, hasCompletedSetup } = useAuth();

    const [hasOnboarded, setHasOnboarded] = React.useState<boolean | null>(null);
    const [hasSeenSafetyScreen, setHasSeenSafetyScreen] = React.useState<boolean | null>(null);
    const [isBiometricLocked, setIsBiometricLocked] = React.useState<boolean>(false);
    const [checkingApp, setCheckingApp] = React.useState<boolean>(true);

    React.useEffect(() => {
        const initializeApp = async () => {
            try {
                const onboardValue = await SecureStore.getItemAsync('hasOnboarded');
                setHasOnboarded(onboardValue === 'true');

                const safetyValue = await SecureStore.getItemAsync('hasSeenSafetyScreen');
                setHasSeenSafetyScreen(safetyValue === 'true');

                const bioValue = await SecureStore.getItemAsync('biometrics_enabled');
                if (bioValue === 'true') {
                    setIsBiometricLocked(true);
                }
            } catch (error) {
                console.error('Error initializing app state:', error);
                setHasOnboarded(false);
            } finally {
                setCheckingApp(false);
            }
        };
        initializeApp();
    }, []);

    if (loading || hasOnboarded === null || hasSeenSafetyScreen === null || checkingApp) {
        return <LoadingScreen />;
    }

    if (session && isBiometricLocked) {
        return <BiometricUnlockScreen onUnlock={() => setIsBiometricLocked(false)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                {session ? (
                    isAdmin ? (
                        // ── ADMIN VIEW ─────────────────────────────────────
                        // Admins see only the admin navigator — no user screens
                        <Stack.Screen name="AdminRoot" component={AdminNavigator} />
                    ) : (
                        // ── USER VIEW ──────────────────────────────────────
                        <Stack.Group>
                            {/* 
                           Logic: If hasOnboarded is false, show Onboarding, else Main.
                        */}
                            {!hasOnboarded ? (
                                <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                            ) : null}

                            {!hasSeenSafetyScreen ? (
                                <Stack.Screen name="OnboardingSafety" component={OnboardingSafetyScreen} />
                            ) : null}

                            {hasOnboarded && hasSeenSafetyScreen && !hasCompletedSetup ? (
                                <Stack.Screen name="Setup" component={SetupNavigator} />
                            ) : null}

                            <Stack.Screen name="Main" component={MainNavigator} />
                            <Stack.Screen name="Cart" component={CartScreen} />
                            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
                            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />

                            {/* Checkout Flow */}
                            <Stack.Screen name="CheckoutAddress" component={CheckoutAddressScreen} />
                            <Stack.Screen name="CheckoutPayment" component={CheckoutPaymentScreen} />
                            <Stack.Screen name="CheckoutReview" component={CheckoutReviewScreen} />
                            <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />

                            {/* Orders */}
                            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
                            <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
                            <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                            <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />

                            {/* Profile Screens */}
                            <Stack.Screen name="Favorites" component={FavoritesScreen} />
                            <Stack.Screen name="Reminders" component={RemindersScreen} />
                            <Stack.Screen name="TrustedContact" component={TrustedContactScreen} />
                            <Stack.Screen name="AddTrustedContact" component={AddTrustedContactScreen} />
                            <Stack.Screen name="EditTrustedContact" component={EditTrustedContactScreen} />
                            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                            <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
                            <Stack.Screen name="Support" component={SupportScreen} />
                            <Stack.Screen name="SafetyGuide" component={SafetyGuideScreen} />
                            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                            <Stack.Screen name="SupportForm" component={SupportFormScreen} />
                            <Stack.Screen name="SupportTickets" component={SupportTicketsScreen} />
                            <Stack.Screen name="TicketChat" component={TicketChatScreen} />

                            {/* Auth Screens */}
                            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
                        </Stack.Group>
                    )
                ) : (
                    // User is not signed in
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
                {/* Global Screens - accessible regardless of auth state */}
                <Stack.Screen name="Error" component={ErrorScreen} />
                <Stack.Screen name="VoiceSearch" component={VoiceSearchScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="VoiceCommandsHelp" component={VoiceCommandsHelpScreen} options={{ presentation: 'modal' }} />
                <Stack.Screen name="Category" component={CategoryScreen} />
            </Stack.Navigator>

            {/* Inject Global Voice Floating Action Button */}
            <GlobalVoiceButton />

        </NavigationContainer>
    );
}
