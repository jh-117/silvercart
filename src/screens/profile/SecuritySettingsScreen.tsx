import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomSwitch from '../../components/ui/CustomSwitch';
import { useNavigation } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function SecuritySettingsScreen() {
    const navigation = useNavigation<any>();
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [hasBiometricHardware, setHasBiometricHardware] = useState(false);

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            if (compatible && enrolled) {
                setHasBiometricHardware(true);
            }
            const stored = await SecureStore.getItemAsync('biometrics_enabled');
            setBiometricEnabled(stored === 'true');
        })();
    }, []);

    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            // Attempt to turn on biometrics
            if (!hasBiometricHardware) {
                Alert.alert('Not Available', 'Your device does not support or have biometrics configured.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable biometric login',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                setBiometricEnabled(true);
                await SecureStore.setItemAsync('biometrics_enabled', 'true');
                Alert.alert('Success', 'Biometric login has been enabled.');
            } else {
                setBiometricEnabled(false);
            }
        } else {
            // Turning it off requires no auth
            setBiometricEnabled(false);
            await SecureStore.deleteItemAsync('biometrics_enabled');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Security & Privacy</Text>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Authentication</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <MaterialIcons name="fingerprint" size={28} color={theme.colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>Biometric Login</Text>
                                    <Text style={styles.settingDesc}>Use fingerprint or face recognition</Text>
                                </View>
                            </View>
                            <CustomSwitch
                                value={biometricEnabled}
                                onValueChange={toggleBiometrics}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <MaterialIcons name="notifications" size={28} color={theme.colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={styles.settingTitle}>Order Updates</Text>
                                    <Text style={styles.settingDesc}>Get notified about order status</Text>
                                </View>
                            </View>
                            <CustomSwitch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Security</Text>
                    <View style={styles.card}>
                        <Pressable
                            style={styles.actionRow}
                            onPress={() => navigation.navigate('ChangePassword')}
                        >
                            <MaterialIcons name="lock-reset" size={28} color={theme.colors.textPrimary} />
                            <Text style={styles.actionText}>Change Password</Text>
                            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={({ pressed }) => [styles.safetyButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('SafetyGuide')}
                >
                    <MaterialIcons name="shield" size={32} color={theme.colors.primary} />
                    <View style={styles.safetyContent}>
                        <Text style={styles.safetyTitle}>Learn About Online Safety</Text>
                        <Text style={styles.safetyDesc}>Read our guide on avoiding scams</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={24} color={theme.colors.primary} />
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        paddingRight: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        gap: 32,
        paddingBottom: 120,
    },
    section: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    settingText: {
        flex: 1,
        gap: 4,
    },
    settingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    settingDesc: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionText: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    safetyButton: {
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    safetyContent: {
        flex: 1,
        gap: 4,
    },
    safetyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    safetyDesc: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
});

