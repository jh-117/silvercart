import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { EmailRegisterScreenProps } from '../../navigation/types';
import { authService } from '../../services/auth.service';

export default function EmailRegisterScreen({ navigation }: EmailRegisterScreenProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSignUp = async () => {
        setErrorMsg('');
        if (!email || !password) {
            setErrorMsg('Please fill in all fields');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMsg('Password must be at least 6 characters with uppercase, lowercase, numbers, and symbols.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authService.signUpWithEmail(email, password);
            if (error) {
                setErrorMsg(error.message);
            } else {
                // Navigate to OTP verification screen
                (navigation as any).navigate('OtpVerification', { email });
            }
        } catch (err) {
            setErrorMsg('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                            hitSlop={8}
                        >
                            <MaterialIcons name="arrow-back" size={32} color={theme.colors.primary} />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Create Your Account</Text>
                        <Text style={styles.subtitle}>Enter your details to start shopping with SilverCart.</Text>

                        {errorMsg ? (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={20} color="#D90429" />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        <View style={styles.form}>
                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <CustomInput
                                    placeholder="example@email.com"
                                    placeholderTextColor={theme.colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <CustomInput
                                        placeholder="At least 6 characters"
                                        placeholderTextColor={theme.colors.textMuted}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        style={{ paddingRight: 50 }}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                        hitSlop={12}
                                    >
                                        <MaterialIcons
                                            name={showPassword ? "visibility" : "visibility-off"}
                                            size={28}
                                            color={theme.colors.primary}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.spacer} />

                            <PrimaryButton
                                title="Create Account"
                                onPress={handleSignUp}
                                loading={loading}
                                icon={<MaterialIcons name="chevron-right" size={28} color={theme.colors.white} />}
                            />
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={12}>
                            <Text style={styles.footerLink}>Sign In</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Visual Accent */}
            <View style={styles.bottomAccent} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'android' ? 120 : 24,
    },
    header: {
        paddingVertical: 24,
        alignItems: 'flex-start',
    },
    backButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    backButtonPressed: {
        backgroundColor: 'rgba(0, 122, 106, 0.1)',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 16,
        lineHeight: 48,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '400',
        color: theme.colors.textMuted,
        marginBottom: 32,
        lineHeight: 28,
        fontFamily: theme.typography.fontFamily.regular,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 12,
    },
    label: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    input: {
        height: 64,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#CDE8EA',
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 18,
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeButton: {
        position: 'absolute',
        right: 16,
        height: '100%',
        justifyContent: 'center',
    },
    spacer: {
        height: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 32,
    },
    footerText: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    footerLink: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    bottomAccent: {
        height: 4,
        width: '100%',
        backgroundColor: 'rgba(0, 122, 106, 0.3)', // primary/30
        position: 'absolute',
        bottom: 0,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        width: '100%',
    },
    errorText: {
        fontSize: 14,
        color: '#D90429',
        marginLeft: 8,
        flex: 1,
    },
});
