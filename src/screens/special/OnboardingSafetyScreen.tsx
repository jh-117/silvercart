import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingSafetyScreen() {
    const navigation = useNavigation<any>();

    const handleAcknowledge = async () => {
        // Set the secure store flag
        await SecureStore.setItemAsync('hasOnboarded', 'true');
        await SecureStore.setItemAsync('hasSeenSafetyScreen', 'true');
        
        // Use reset to avoid back navigation to onboarding
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.brandContainer}>
                    <MaterialIcons name="security" size={36} color={theme.colors.primary} />
                    <Text style={styles.brandText}>Safety First</Text>
                </View>
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Protect Yourself from Scams</Text>
                <Text style={styles.description}>
                    For your security, please read these important rules before shopping on SilverCart.
                </Text>

                {/* Rule 1 */}
                <View style={styles.ruleCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#FEE2E2', shadowColor: '#DC2626' }]}>
                        <MaterialIcons name="vpn-key" size={32} color="#DC2626" />
                    </View>
                    <View style={styles.ruleTextContainer}>
                        <Text style={styles.ruleTitle}>1. We'll never ask for codes</Text>
                        <Text style={styles.ruleDescription}>
                            SilverCart will NEVER ask for your password or SMS OTP code via phone call or WhatsApp. Do not share them.
                        </Text>
                    </View>
                </View>

                {/* Rule 2 */}
                <View style={[styles.ruleCard, { marginTop: 16 }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0E7FF', shadowColor: '#4F46E5' }]}>
                        <MaterialIcons name="account-balance" size={32} color="#4F46E5" />
                    </View>
                    <View style={styles.ruleTextContainer}>
                        <Text style={styles.ruleTitle}>2. No personal bank transfers</Text>
                        <Text style={styles.ruleDescription}>
                            Never send money to personal bank accounts. We only use official payment channels within our app.
                        </Text>
                    </View>
                </View>

                {/* Rule 3 */}
                <View style={[styles.ruleCard, { marginTop: 16 }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#D1FAE5', shadowColor: '#059669' }]}>
                        <MaterialIcons name="local-shipping" size={32} color="#059669" />
                    </View>
                    <View style={styles.ruleTextContainer}>
                        <Text style={styles.ruleTitle}>3. Verify your driver</Text>
                        <Text style={styles.ruleDescription}>
                            Always check that the delivery driver is wearing an official uniform and ID badge before paying Cash on Delivery.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={styles.nextButton}
                    onPress={handleAcknowledge}
                >
                    <Text style={styles.nextButtonText}>I Understand & Agree</Text>
                    <MaterialIcons name="check-circle" size={24} color={theme.colors.white} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FCFCF9', // Minimal distraction background
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        justifyContent: 'center',
    },
    brandText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111718',
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111718',
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
        lineHeight: 40,
    },
    description: {
        fontSize: 20,
        fontWeight: '500',
        color: '#4B5563', // gray-600
        lineHeight: 30,
        marginBottom: 32,
        fontFamily: theme.typography.fontFamily.medium,
    },
    ruleCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        gap: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    ruleTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    ruleTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.bold,
    },
    ruleDescription: {
        fontSize: 18,
        fontWeight: '400',
        color: '#4B5563',
        lineHeight: 28,
        fontFamily: 'Lexend',
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 40,
    },
    nextButton: {
        height: 68,
        borderRadius: 34,
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    nextButtonText: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
