import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecurityKeypad } from '../../components/auth/SecurityKeypad';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

export default function OtpVerificationScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email, phone } = route.params as { email?: string; phone?: string };
    const displayTarget = email ?? phone ?? 'your contact';
    const isEmail = !!email;

    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleKeyPress = (key: string) => {
        setErrorMsg('');
        if (code.length < 6) setCode(prev => prev + key);
    };
    const handleDelete = () => {
        setErrorMsg('');
        setCode(prev => prev.slice(0, -1));
    };

    const handleVerify = async () => {
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp(
                isEmail
                    ? { email: email!, token: code, type: 'email' }
                    : { phone: phone!, token: code, type: 'sms' }
            );

            if (error) {
                setErrorMsg(error.message);
                return;
            }

            if (!data.user) {
                setErrorMsg('Could not retrieve user. Please try again.');
                return;
            }

            const userId = data.user.id;

            // Upsert into profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    phone: phone ?? null,
                }, { onConflict: 'id' });

            if (profileError) {
                console.warn('[OTP] Profile upsert warning:', profileError.message);
            }

            // Upsert into users table (REMOVED: application uses public.profiles as the source of truth)
            // The auth.users table automatically creates a public.profiles entry via PostgreSQL triggers.

            // Navigate to profile setup to fill in full_name and other details
            navigation.replace('ProfileSetup');

        } catch (err) {
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(60);
        setCode('');
        try {
            if (!isEmail && phone) {
                await supabase.auth.signInWithOtp({ phone });
            } else if (isEmail && email) {
                await supabase.auth.resend({ type: 'signup', email });
            }
            Alert.alert('Code Sent ✓', `A new verification code has been sent to ${displayTarget}.`);
        } catch (err) {
            setErrorMsg('Could not resend code. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={32} color={theme.colors.textMain} />
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Verification Code</Text>
                <Text style={styles.subtitle}>
                    A 6-digit code has been sent to{' '}
                    <Text style={styles.phoneText}>{displayTarget}</Text>
                    .{'\n'}Check your {isEmail ? 'email inbox' : 'phone messages'}.
                </Text>

                {errorMsg ? (
                    <View style={styles.errorContainer}>
                        <MaterialIcons name="error-outline" size={20} color="#D90429" />
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                ) : null}

                <View style={styles.codeContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <View key={index} style={[styles.codeBox, code.length === index && styles.activeCodeBox]}>
                            <Text style={styles.codeText}>{code[index] || ''}</Text>
                        </View>
                    ))}
                </View>

                {timer > 0 ? (
                    <Text style={styles.timerText}>Resend code in {timer}s</Text>
                ) : (
                    <Pressable onPress={handleResend}>
                        <Text style={styles.resendText}>Resend Code</Text>
                    </Pressable>
                )}

                <View style={styles.spacer} />

                <PrimaryButton
                    title="Verify"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={code.length !== 6}
                    style={{ width: '100%', height: 64, borderRadius: 16, marginBottom: 16 }}
                />
            </View>

            <View style={styles.keypadContainer}>
                <SecurityKeypad onPress={handleKeyPress} onDelete={handleDelete} />
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
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: theme.colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 26,
        fontFamily: theme.typography.fontFamily.medium,
    },
    phoneText: {
        color: theme.colors.textMain,
        fontWeight: '700',
    },
    codeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    codeBox: {
        width: 48,
        height: 56,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCodeBox: {
        borderColor: theme.colors.primary,
        backgroundColor: '#F0FDF4',
    },
    codeText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
    },
    timerText: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    resendText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    spacer: {
        flex: 1,
    },
    keypadContainer: {
        backgroundColor: theme.colors.backgroundLight,
        paddingBottom: 24,
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