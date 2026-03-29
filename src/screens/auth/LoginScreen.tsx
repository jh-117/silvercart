import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable,
    ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { LoginScreenProps } from '../../navigation/types';
import { authService } from '../../services/auth.service';

const COOLDOWN_SECONDS = 60;

export default function LoginScreen({ navigation }: LoginScreenProps) {
    // Email tab state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Phone tab state
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [phoneError, setPhoneError] = useState('');
    const [otpError, setOtpError] = useState('');

    // Shared
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');

    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Countdown timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(cooldownRef.current!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
    }, [cooldown]);

    // Reset phone state when switching tabs
    const handleTabSwitch = (tab: 'email' | 'phone') => {
        setActiveTab(tab);
        setOtp('');
        setOtpSent(false);
        setCooldown(0);
        setPhoneError('');
        setOtpError('');
    };

    // ── Email login ──────────────────────────────────────────────
    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Looks like you missed a spot. Please fill in all the details.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await authService.signInWithEmail(email, password);
            if (error) Alert.alert('Oops!', 'We couldn\'t sign you in. Please check your details and try again.');
        } catch {
            Alert.alert('Oops!', 'An unexpected issue occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Phone: Send OTP ──────────────────────────────────────────
    const handleSendOtp = async () => {
        setPhoneError('');
        const digits = phone.replace(/\s/g, '');
        if (digits.length < 9 || digits.length > 11) {
            setPhoneError('Make sure your number is typed correctly.');
            return;
        }

        // Format to E.164 (+60)
        const formatted = '+60' + (digits.startsWith('0') ? digits.slice(1) : digits);

        setLoading(true);
        try {
            const { error } = await authService.sendPhoneOtp(formatted);
            if (error) {
                setPhoneError(error);
                return;
            }
            setOtpSent(true);
            setCooldown(COOLDOWN_SECONDS);
            setOtp('');
        } catch {
            setPhoneError('We couldn\'t send the code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Phone: Resend OTP ────────────────────────────────────────
    const handleResend = async () => {
        if (cooldown > 0) return;
        setOtpError('');
        setOtp('');
        const digits = phone.replace(/\s/g, '');
        const formatted = '+60' + (digits.startsWith('0') ? digits.slice(1) : digits);
        setLoading(true);
        try {
            const { error } = await authService.sendPhoneOtp(formatted);
            if (error) { setPhoneError(error); return; }
            setCooldown(COOLDOWN_SECONDS);
            Alert.alert('Code Sent ✓', `A new code has been sent to +60${digits.startsWith('0') ? digits.slice(1) : digits}`);
        } catch {
            setPhoneError('We couldn\'t resend the code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Phone: Verify OTP & Login ────────────────────────────────
    const handlePhoneLogin = async () => {
        setOtpError('');
        if (otp.length !== 6) {
            setOtpError('Please enter the full 6-digit code.');
            return;
        }
        const digits = phone.replace(/\s/g, '');
        const formatted = '+60' + (digits.startsWith('0') ? digits.slice(1) : digits);

        setLoading(true);
        try {
            const { error } = await authService.verifyPhoneOtp(formatted, otp);
            if (error) {
                setOtpError(error.message);
            }
            // On success, AuthContext onAuthStateChange will auto-navigate
        } catch {
            setOtpError('That code didn\'t work. Please try again.');
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
                        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                            <MaterialIcons name="arrow-back" size={28} color={theme.colors.textMain} />
                        </Pressable>
                        <Text style={styles.headerTitle}>Login</Text>
                        <View style={{ width: 48 }} />
                    </View>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <MaterialIcons name="shopping-basket" size={48} color={theme.colors.primary} />
                        </View>
                    </View>

                    {/* Welcome Text */}
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeTitle}>Welcome Back</Text>
                        <Text style={styles.welcomeSubtitle}>The Trusted Assistant is here to help you shop safely.</Text>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <Pressable
                            style={[styles.tab, activeTab === 'email' ? styles.activeTab : null]}
                            onPress={() => handleTabSwitch('email')}
                        >
                            <MaterialIcons name="mail" size={20} color={activeTab === 'email' ? theme.colors.primary : theme.colors.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'email' ? styles.activeTabText : null]}>EMAIL</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'phone' ? styles.activeTab : null]}
                            onPress={() => handleTabSwitch('phone')}
                        >
                            <MaterialIcons name="smartphone" size={20} color={activeTab === 'phone' ? theme.colors.primary : theme.colors.textMuted} />
                            <Text style={[styles.tabText, activeTab === 'phone' ? styles.activeTabText : null]}>PHONE</Text>
                        </Pressable>
                    </View>

                    {/* ── EMAIL FORM ── */}
                    {activeTab === 'email' ? (
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <CustomInput
                                    placeholder="name@example.com"
                                    placeholderTextColor={theme.colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.passwordContainer}>
                                    <CustomInput
                                        placeholder="Enter your password"
                                        placeholderTextColor={theme.colors.textMuted}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                        style={{ paddingRight: 50 }}
                                    />
                                    <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                                        <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color={theme.colors.textMuted} />
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable onPress={() => navigation.navigate('ForgotPassword' as any)} style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </Pressable>

                            <View style={styles.spacer} />

                            <PrimaryButton
                                title="Login"
                                icon={<MaterialIcons name="login" size={24} color={theme.colors.white} />}
                                onPress={handleEmailLogin}
                                loading={loading}
                            />

                            <View style={styles.footer}>
                                <View style={styles.signupRow}>
                                    <Text style={styles.footerText}>Don't have an account?</Text>
                                    <Pressable onPress={() => navigation.navigate('Welcome' as any)}>
                                        <Text style={styles.signupText}>Sign Up</Text>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.helpButton} onPress={() => navigation.navigate('Support' as any)}>
                                    <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
                                    <Text style={styles.helpText}>Get Help Signing In</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        /* ── PHONE FORM ── */
                        <View style={styles.form}>

                            {/* Phone number input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={styles.phoneInputRow}>
                                    <View style={styles.prefixBox}>
                                        <Text style={styles.prefixText}>+60</Text>
                                    </View>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
                                            otpSent && styles.inputLocked,
                                        ]}
                                        placeholder="11 2345 6789"
                                        placeholderTextColor={theme.colors.textMuted}
                                        value={phone}
                                        onChangeText={t => { setPhone(t); setPhoneError(''); }}
                                        keyboardType="phone-pad"
                                        editable={!otpSent}
                                    />
                                </View>
                                {phoneError ? (
                                    <View style={styles.errorBox}>
                                        <MaterialIcons name="error-outline" size={18} color="#D90429" />
                                        <Text style={styles.errorText}>{phoneError}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Send Code button (Step 1) */}
                            {!otpSent ? (
                                <PrimaryButton
                                    title="Send Code"
                                    icon={loading
                                        ? <ActivityIndicator color={theme.colors.white} />
                                        : <MaterialIcons name="send" size={22} color={theme.colors.white} />}
                                    onPress={handleSendOtp}
                                    loading={loading}
                                />
                            ) : (
                                /* OTP entry (Step 2) */
                                <>
                                    {/* Sent confirmation banner */}
                                    <View style={styles.sentBanner}>
                                        <MaterialIcons name="check-circle" size={20} color="#007A6A" />
                                        <Text style={styles.sentBannerText}>Code sent! Check your SMS.</Text>
                                    </View>

                                    {/* OTP boxes */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Verification Code</Text>
                                        <View style={{ position: 'relative' }}>
                                            <View style={styles.otpRow}>
                                                {[0, 1, 2, 3, 4, 5].map(i => (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.otpBox,
                                                            otp.length === i && styles.otpBoxActive,
                                                            otp.length > i && styles.otpBoxFilled,
                                                        ]}
                                                    >
                                                        <Text style={styles.otpText}>{otp[i] || ''}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                            <TextInput
                                                value={otp}
                                                onChangeText={t => { setOtp(t.replace(/[^0-9]/g, '')); setOtpError(''); }}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                textContentType="oneTimeCode"
                                                autoFocus
                                                style={{
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    opacity: 0,
                                                }}
                                            />
                                        </View>
                                        {otpError ? (
                                            <View style={styles.errorBox}>
                                                <MaterialIcons name="error-outline" size={18} color="#D90429" />
                                                <Text style={styles.errorText}>{otpError}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    {/* Cooldown / Resend */}
                                    <View style={styles.resendRow}>
                                        {cooldown > 0 ? (
                                            <Text style={styles.cooldownText}>Resend code in <Text style={styles.cooldownNum}>{cooldown}s</Text></Text>
                                        ) : (
                                            <Pressable onPress={handleResend} disabled={loading}>
                                                <Text style={styles.resendText}>Resend Code</Text>
                                            </Pressable>
                                        )}
                                        {/* Allow editing phone */}
                                        <Pressable onPress={() => { setOtpSent(false); setCooldown(0); setOtp(''); }} style={styles.changePhone}>
                                            <Text style={styles.changePhoneText}>Change number</Text>
                                        </Pressable>
                                    </View>

                                    {/* Login button */}
                                    <PrimaryButton
                                        title="Login with Phone"
                                        icon={<MaterialIcons name="smartphone" size={24} color={theme.colors.white} />}
                                        onPress={handlePhoneLogin}
                                        loading={loading}
                                        disabled={otp.length !== 6}
                                    />


                                </>
                            )}

                            <View style={styles.footer}>
                                <View style={styles.signupRow}>
                                    <Text style={styles.footerText}>Don't have an account?</Text>
                                    <Pressable onPress={() => navigation.navigate('Welcome' as any)}>
                                        <Text style={styles.signupText}>Sign Up</Text>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.helpButton} onPress={() => navigation.navigate('Support' as any)}>
                                    <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
                                    <Text style={styles.helpText}>Get Help Signing In</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingBottom: Platform.OS === 'android' ? 120 : 24,
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
    iconContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: 'rgba(209, 221, 232, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeContainer: {
        paddingHorizontal: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.bold,
    },
    welcomeSubtitle: {
        fontSize: 18,
        color: '#5C7089',
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.medium,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 24,
        backgroundColor: 'rgba(209, 221, 232, 0.4)',
        padding: 6,
        borderRadius: 12,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: theme.colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#5C7089',
        fontFamily: theme.typography.fontFamily.bold,
    },
    activeTabText: {
        color: theme.colors.primary,
    },
    form: {
        paddingHorizontal: 24,
        gap: 20,
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
        height: 56,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    inputLocked: {
        backgroundColor: '#F3F4F6',
        color: theme.colors.textMuted,
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
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    phoneInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    prefixBox: {
        height: 56,
        backgroundColor: '#E5E7EB',
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRightWidth: 0,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    prefixText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textMain,
    },
    // Sent confirmation
    sentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#D1FAE5',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    sentBannerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#065F46',
        fontFamily: theme.typography.fontFamily.medium,
    },
    // OTP boxes
    otpRow: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
    },
    otpBox: {
        flex: 1,
        height: 56,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpBoxActive: {
        borderColor: theme.colors.primary,
        backgroundColor: '#F0FDF4',
    },
    otpBoxFilled: {
        borderColor: theme.colors.primary,
    },
    otpText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
    },
    // Resend / Change number row
    resendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cooldownText: {
        fontSize: 15,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    cooldownNum: {
        color: theme.colors.primary,
        fontWeight: '700',
    },
    resendText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    changePhone: {},
    changePhoneText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textDecorationLine: 'underline',
    },
    // Error
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#D90429',
        flex: 1,
    },
    // Keypad
    keypadWrapper: {
        marginHorizontal: -24,
    },
    spacer: {
        height: 8,
    },
    footer: {
        alignItems: 'center',
        gap: 24,
        marginTop: 8,
    },
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 18,
        color: '#5C7089',
        fontFamily: theme.typography.fontFamily.medium,
    },
    signupText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        textDecorationLine: 'underline',
        fontFamily: theme.typography.fontFamily.bold,
    },
    helpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#D1DDE8',
    },
    helpText: {
        fontSize: 16,
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
