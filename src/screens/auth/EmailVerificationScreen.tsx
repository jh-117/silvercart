import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function EmailVerificationScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>SilverCart</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Hero Icon */}
                <View style={styles.heroContainer}>
                    <View style={styles.heroCircle}>
                        <MaterialIcons name="mark-email-read" size={84} color={theme.colors.primary} />
                    </View>
                    <View style={styles.heroRing} />
                </View>

                {/* Headline */}
                <Text style={styles.title}>Confirm Your Email</Text>

                {/* Email Badge */}
                <View style={styles.emailBadge}>
                    <Text style={styles.emailLabel}>Sent to: </Text>
                    <Text style={styles.emailText}>joan.smith@example.com</Text>
                </View>

                {/* Description */}
                <Text style={styles.description}>
                    Tap the link we sent to your email to activate your account. If you can't find it, please check your spam folder.
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <Pressable
                    style={({ pressed }) => [
                        styles.resendButton,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Text style={styles.resendButtonText}>Resend Email</Text>
                </Pressable>

                <Pressable style={styles.helpButton}>
                    <MaterialIcons name="help-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.helpText}>Need help? Contact Support</Text>
                </Pressable>

                <Pressable style={styles.changeEmailButton}>
                    <Text style={styles.changeEmailText}>Change email address</Text>
                </Pressable>
            </View>

            {/* Footer Spacing */}
            <View style={{ height: 32 }} />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        paddingRight: 48,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginTop: -60,
    },
    heroContainer: {
        position: 'relative',
        marginBottom: 40,
    },
    heroCircle: {
        width: 192,
        height: 192,
        borderRadius: 96,
        backgroundColor: `${theme.colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
    },
    heroRing: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
        left: -14,
        top: -14,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'center',
        marginBottom: 24,
    },
    emailBadge: {
        flexDirection: 'row',
        backgroundColor: `${theme.colors.primary}10`,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}20`,
        marginBottom: 24,
    },
    emailLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    emailText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
        textDecorationLine: 'underline',
    },
    description: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 16,
    },
    actions: {
        paddingHorizontal: 24,
        gap: 16,
        alignItems: 'center',
    },
    resendButton: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    resendButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    helpText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        textDecorationLine: 'underline',
    },
    changeEmailButton: {
        paddingVertical: 8,
        marginTop: 16,
    },
    changeEmailText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
});
