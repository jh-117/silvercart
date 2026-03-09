import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BiometricUnlockScreenProps {
    onUnlock: () => void;
}

export default function BiometricUnlockScreen({ onUnlock }: BiometricUnlockScreenProps) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const authenticate = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access SilverCart',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                onUnlock();
            } else {
                setErrorMsg('Authentication failed or was cancelled.');
            }
        } catch (error) {
            setErrorMsg('An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Automatically prompt once when the screen loads
        authenticate();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <MaterialIcons name="fingerprint" size={80} color={theme.colors.primary} />
                </View>

                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Unlock your app to continue shopping securely.</Text>

                {errorMsg ? (
                    <View style={styles.errorBox}>
                        <MaterialIcons name="error-outline" size={20} color="#D90429" />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                ) : null}

                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
                ) : (
                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                        onPress={authenticate}
                    >
                        <MaterialIcons name="lock-open" size={24} color={theme.colors.white} />
                        <Text style={styles.buttonText}>Unlock App</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F7',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(21, 105, 121, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 12,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: theme.typography.fontFamily.medium,
        lineHeight: 26,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 8,
    },
    errorText: {
        color: '#D90429',
        fontSize: 16,
        fontFamily: theme.typography.fontFamily.medium,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
