import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/ui/CustomInput';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';

export default function SetPasswordScreen() {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSetPassword = async () => {
        setErrorMsg('');
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMsg('Password must be at least 6 characters with uppercase, lowercase, numbers, and symbols.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setErrorMsg(error.message);
                return;
            }

            Alert.alert('Success', 'Your password has been reset successfully!');
            // Since they are now fully authenticated, navigate to the main app or profile
            (navigation as any).navigate('Main');
        } catch (err) {
            setErrorMsg('An unexpected error occurred. Please try again.');
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
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Set Password</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Secure Your Account</Text>
                        <Text style={styles.subtitle}>
                            Create a strong password to protect your account.
                        </Text>

                        {errorMsg ? (
                            <View style={styles.errorContainer}>
                                <MaterialIcons name="error-outline" size={20} color="#D90429" />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>New Password</Text>
                                <View style={styles.passwordContainer}>
                                    <CustomInput
                                        style={[styles.input, { paddingRight: 50 }]}
                                        placeholder="Min 6 characters"
                                        placeholderTextColor={theme.colors.textMuted}
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <Pressable
                                        style={styles.eyeButton}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={24} color={theme.colors.textMuted} />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <CustomInput
                                    style={styles.input}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={theme.colors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>

                            <View style={styles.spacer} />

                            <PrimaryButton
                                title="Set Password"
                                onPress={handleSetPassword}
                                loading={loading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textMain,
    },
    content: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: 32,
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
    },
    input: {
        height: 64,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        color: theme.colors.textMain,
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
