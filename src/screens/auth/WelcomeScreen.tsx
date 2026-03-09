import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { WelcomeScreenProps } from '../../navigation/types';

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.appName}>SilverCart</Text>
                <MaterialIcons name="accessibility-new" size={32} color={theme.colors.primary} />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <MaterialIcons name="shopping-basket" size={80} color={theme.colors.primary} />
                </View>

                {/* Tagline */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Shopping made simple for seniors</Text>
                    <Text style={styles.subtitle}>Your trusted assistant for every purchase.</Text>
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.footer}>
                <PrimaryButton
                    title="Sign Up with Email"
                    icon={<MaterialIcons name="mail" size={24} color={theme.colors.white} />}
                    onPress={() => navigation.navigate('EmailRegister')}
                    style={styles.emailButton}
                />

                <Pressable
                    style={({ pressed }) => [styles.phoneButton, pressed && styles.phoneButtonPressed]}
                    onPress={() => navigation.navigate('PhoneRegister')}
                >
                    <MaterialIcons name="smartphone" size={24} color={theme.colors.primary} />
                    <Text style={styles.phoneButtonText}>Sign Up with Phone</Text>
                </Pressable>

                <Pressable
                    style={styles.loginLink}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginLinkText}>Already have an account? Sign In</Text>
                </Pressable>
            </View>

            {/* Accessibility Bar (Visual only as per design) */}
            <View style={styles.accessibilityBar} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    appName: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
    },
    logoContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(0, 122, 106, 0.1)', // primary/10
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textMain,
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.primary, // Using primary as per design visual (teal text) or textMuted? Design usually has teal for this subtitle.
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.medium,
    },
    footer: {
        gap: 20,
        paddingBottom: 40,
    },
    emailButton: {
        width: '100%',
    },
    phoneButton: {
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'transparent',
    },
    phoneButtonPressed: {
        backgroundColor: 'rgba(0, 122, 106, 0.05)',
        transform: [{ scale: 0.98 }],
    },
    phoneButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    loginLink: {
        alignItems: 'center',
        marginTop: 8,
        padding: 8, // touch target padding
    },
    loginLinkText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    accessibilityBar: {
        width: 128,
        height: 6,
        backgroundColor: '#E5E5E5',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 8,
    },
});
