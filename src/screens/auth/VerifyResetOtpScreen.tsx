import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecurityKeypad } from '../../components/auth/SecurityKeypad';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

export default function VerifyResetOtpScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email } = route.params as { email: string };

    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleKeyPress = (key: string) => {
        if (code.length < 6) setCode(prev => prev + key);
    };
    const handleDelete = () => setCode(prev => prev.slice(0, -1));

    const handleVerify = async () => {
        if (code.length !== 6) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: code,
                type: 'recovery',
            });

            if (error) {
                Alert.alert('Invalid Code', error.message);
                return;
            }

            // OTP verified successfully, the user is now authenticated
            // Navigate to SetPasswordScreen to set the new password
            navigation.replace('SetPassword');

        } catch (err) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(60);
        setCode('');
        try {
            await supabase.auth.resetPasswordForEmail(email);
            Alert.alert('Code Sent ✓', `A new verification code has been sent to ${email}.`);
        } catch (err) {
            Alert.alert('Error', 'Could not resend code. Please try again.');
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
                    <Text style={styles.emailText}>{email}</Text>
                    .{'\n'}Check your email inbox to reset your password.
                </Text>

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
                    title="Verify Code"
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
    emailText: {
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
});
