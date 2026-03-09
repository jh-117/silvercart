import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecurityKeypad } from '../../components/auth/SecurityKeypad';
import { PhoneRegisterScreenProps } from '../../navigation/types';
import { supabase } from '../../services/supabase';

export default function PhoneRegisterScreen({ navigation }: PhoneRegisterScreenProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyPress = (key: string) => {
        if (phoneNumber.length < 11) { // Max Malaysian number: 11 digits after +60
            setPhoneNumber(prev => prev + key);
        }
    };

    const handleDelete = () => {
        setPhoneNumber(prev => prev.slice(0, -1));
    };

    const handleSendCode = async () => {
        if (phoneNumber.length < 9) {
            Alert.alert('Invalid Number', 'Please enter a valid Malaysian phone number.');
            return;
        }
        // Build E.164 format: +60XXXXXXXXX
        const e164 = `+60${phoneNumber}`;
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
        setLoading(false);
        if (error) {
            Alert.alert('Failed to Send Code', error.message);
        } else {
            navigation.navigate('OtpVerification', { phone: e164 } as any);
        }
    };

    // Format phone number for display (00 000 0000)
    const formattedPhone = phoneNumber.replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3').trim();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={32} color={theme.colors.textMain} />
                </Pressable>
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.contentInner}>
                    <Text style={styles.title}>Enter Your Phone Number</Text>
                    <Text style={styles.subtitle}>We'll send a 6-digit verification code to keep your account secure.</Text>

                    <View style={styles.phoneInputContainer}>
                        <View style={styles.prefixContainer}>
                            <Text style={styles.prefix}>+60</Text>
                        </View>
                        <TextInput
                            style={styles.phoneInput}
                            value={formattedPhone || phoneNumber}
                            placeholder="00 000 0000"
                            placeholderTextColor="#D1D5DB"
                            editable={false} // Use custom keypad
                        />
                        <MaterialIcons name="phone-iphone" size={32} color={theme.colors.primary} />
                    </View>

                    <View style={styles.spacer} />

                    <PrimaryButton
                        title={loading ? 'Sending...' : 'Send Code'}
                        onPress={handleSendCode}
                        disabled={phoneNumber.length < 9 || loading}
                        loading={loading}
                        style={{ borderRadius: 16, height: 64 }}
                    />
                </View>
            </ScrollView>

            {/* Keypad */}
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
        paddingBottom: 8,
    },
    backButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentInner: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: theme.colors.textMain,
        marginBottom: 12,
        lineHeight: 40,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textMuted,
        marginBottom: 32,
        lineHeight: 26,
        fontFamily: theme.typography.fontFamily.medium,
    },
    phoneInputContainer: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(0, 122, 106, 0.2)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        height: 72,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    prefixContainer: {
        paddingHorizontal: 16,
        borderRightWidth: 1,
        borderRightColor: '#F3F4F6',
        height: '100%',
        justifyContent: 'center',
    },
    prefix: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    phoneInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
        paddingHorizontal: 12,
        fontFamily: theme.typography.fontFamily.bold,
    },
    spacer: {
        height: 80,
    },
    keypadContainer: {
        paddingBottom: 32,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.backgroundLight,
    },
});
