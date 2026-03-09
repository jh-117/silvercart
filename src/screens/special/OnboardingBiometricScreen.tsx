import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { OnboardingBiometricScreenProps } from '../../navigation/types';

export default function OnboardingBiometricScreen({ navigation }: OnboardingBiometricScreenProps) {
    const handleEnable = () => {
        // Logic to enable biometrics via Expo LocalAuthentication
        console.log('Enabling biometrics...');
        navigation.navigate('OnboardingTutorial');
    };

    const handleSkip = () => {
        navigation.navigate('OnboardingTutorial');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Back button removed as this is the start of the flow */}
                <View style={{ width: 48 }} />
                <Text style={styles.headerTitle}>Security Setup</Text>
                <View style={{ width: 48 }} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.heroContainer}>
                    <View style={styles.heroCircle}>
                        <MaterialIcons name="face" size={84} color={theme.colors.primary} style={{ marginBottom: 8 }} />
                        <MaterialIcons name="fingerprint" size={64} color={theme.colors.primary} style={{ opacity: 0.4, marginTop: -32 }} />
                    </View>
                    <View style={styles.heroGlow} />
                </View>

                <Text style={styles.title}>Make Login Easier</Text>
                <Text style={styles.description}>
                    Use your face or fingerprint to sign in quickly and securely without typing a password every time.
                </Text>

                <View style={styles.actionContainer}>
                    <PrimaryButton
                        title="Enable Biometrics"
                        icon={<MaterialIcons name="verified-user" size={24} color={theme.colors.white} />}
                        onPress={handleEnable}
                    />

                    <Pressable onPress={handleSkip} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip for Now</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 122, 106, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    heroContainer: {
        marginBottom: 48,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroCircle: {
        width: 192,
        height: 192,
        borderRadius: 96,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(0, 122, 106, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 8,
        zIndex: 2,
    },
    heroGlow: {
        position: 'absolute',
        top: -16,
        right: -16,
        width: 48,
        height: 48,
        backgroundColor: 'rgba(0, 122, 106, 0.2)',
        borderRadius: 24,
        zIndex: 1,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.textMain,
        textAlign: 'center',
        marginBottom: 24,
        fontFamily: theme.typography.fontFamily.bold,
    },
    description: {
        fontSize: 18,
        fontWeight: '500',
        color: '#3D444A',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 28,
        fontFamily: theme.typography.fontFamily.medium,
    },
    actionContainer: {
        width: '100%',
        gap: 24,
    },
    skipButton: {
        alignItems: 'center',
        padding: 12,
    },
    skipText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textMuted,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
});
