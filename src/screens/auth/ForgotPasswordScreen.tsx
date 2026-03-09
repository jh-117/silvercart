import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordScreen() {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        const { error } = await authService.resetPassword(trimmed);
        setLoading(false);

        if (error) {
            Alert.alert('Failed', error);
        } else {
            // Navigate to the new OTP verification screen for password reset
            (navigation as any).navigate('VerifyResetOtp', { email: trimmed });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textMain} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Forgot Password</Text>
                    <View style={{ width: 48 }} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="lock-reset" size={64} color={theme.colors.primary} />
                        </View>
                    </View>

                    <Text style={styles.title}>Reset Your Password</Text>
                    <Text style={styles.subtitle}>
                        Enter the email associated with your account and we'll send you instructions to reset your password.
                    </Text>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <CustomInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor={theme.colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.spacer} />

                        <PrimaryButton
                            title="Send Instructions"
                            icon={<MaterialIcons name="send" size={24} color={theme.colors.white} />}
                            onPress={handleResetPassword}
                            loading={loading}
                        />

                        <Pressable
                            style={styles.backToLogin}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomAccent} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F7',
    },
    scrollContent: {
        flexGrow: 1,
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textMain,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(209, 221, 232, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textMain,
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        color: '#5C7089',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 26,
        fontFamily: theme.typography.fontFamily.medium,
    },
    form: {
        width: '100%',
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    input: {
        height: 64,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    spacer: {
        height: 8,
    },
    backToLogin: {
        alignItems: 'center',
        marginTop: 16,
    },
    backToLoginText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    bottomAccent: {
        height: 8,
        width: '100%',
        backgroundColor: 'rgba(0, 122, 106, 0.1)',
        position: 'absolute',
        bottom: 0,
    },
});
