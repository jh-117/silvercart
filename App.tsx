import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold
} from '@expo-google-fonts/plus-jakarta-sans';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppSettingsProvider } from './src/contexts/AppSettingsContext';
import { ToastProvider } from './src/contexts/ToastProvider';
import { CartProvider } from './src/contexts/CartContext';
import { OrderProvider } from './src/contexts/OrderContext';
import RootNavigator from './src/navigation/RootNavigator';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// --- Native Notification Handler ---
// This ensures scheduled notifications display properly even in background/killed state
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Create Android notification channel for reminders
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('silvercart-reminders', {
        name: 'SilverCart Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a6b3c',
        sound: 'default',
    });
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  let [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <AppSettingsProvider>
          <CartProvider>
            <OrderProvider>
              <ToastProvider>
                <RootNavigator />
                <StatusBar style="auto" />
              </ToastProvider>
            </OrderProvider>
          </CartProvider>
        </AppSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}