import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const paymentMethods = [
    {
        id: 'cod',
        icon: 'payments',
        title: 'Cash on Delivery',
        description: 'Pay when you get your items',
        recommended: true,
    },
    {
        id: 'online',
        icon: 'account-balance',
        title: 'Online Banking',
        description: 'Securely connect to your bank',
        recommended: false,
    },
    {
        id: 'ewallet',
        icon: 'account-balance-wallet',
        title: 'E-Wallet',
        description: 'Pay using your digital wallet',
        recommended: false,
    },
];

export default function CheckoutPaymentScreen() {
    const navigation = useNavigation<any>();
    const [selectedMethod, setSelectedMethod] = useState('cod');

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Step 2: Payment</Text>
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressDots}>
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={styles.headline}>Choose how to pay</Text>
                    <Text style={styles.subheadline}>Select the easiest option for you.</Text>
                </View>

                {/* Payment Options */}
                <View style={styles.optionsContainer}>
                    {paymentMethods.map((method) => (
                        <Pressable
                            key={method.id}
                            style={[
                                styles.paymentOption,
                                selectedMethod === method.id && styles.paymentOptionSelected,
                            ]}
                            onPress={() => setSelectedMethod(method.id)}
                        >
                            <View style={styles.optionContent}>
                                <View style={[
                                    styles.optionIcon,
                                    selectedMethod === method.id && styles.optionIconSelected,
                                ]}>
                                    <MaterialIcons
                                        name={method.icon as any}
                                        size={36}
                                        color={selectedMethod === method.id ? theme.colors.primary : theme.colors.textMuted}
                                    />
                                </View>
                                <View style={styles.optionText}>
                                    <View style={styles.optionTitleRow}>
                                        <Text style={styles.optionTitle}>{method.title}</Text>
                                        {method.recommended && (
                                            <View style={styles.recommendedBadge}>
                                                <Text style={styles.recommendedText}>RECOMMENDED</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.optionDescription}>{method.description}</Text>
                                </View>
                            </View>
                            <View style={[
                                styles.radioButton,
                                selectedMethod === method.id && styles.radioButtonSelected,
                            ]}>
                                {selectedMethod === method.id && <View style={styles.radioDot} />}
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Security Info */}
                <View style={styles.securityCard}>
                    <View style={styles.securityContent}>
                        <View style={styles.securityHeader}>
                            <MaterialIcons name="shield" size={32} color={theme.colors.primary} />
                            <View style={styles.securityText}>
                                <Text style={styles.securityTitle}>Your safety is our priority</Text>
                                <Text style={styles.securityDescription}>
                                    All payments are simulated for this demonstration. Your real money and data are always secure with our Trusted Assistant.
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            style={styles.securityButton}
                            onPress={() => navigation.navigate('SafetyGuide' as any)}
                        >
                            <Text style={styles.securityButtonText}>Learn about security</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('CheckoutReview')}
                >
                    <Text style={styles.continueButtonText}>Continue to Review</Text>
                    <MaterialIcons name="chevron-right" size={24} color={theme.colors.white} />
                </Pressable>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        backgroundColor: theme.colors.backgroundLight,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 16,
    },
    progressDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
    },
    progressDotActive: {
        backgroundColor: theme.colors.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    headlineSection: {
        paddingTop: 24,
        paddingBottom: 16,
    },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 8,
    },
    subheadline: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    optionsContainer: {
        gap: 20,
        paddingVertical: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0', // Subtle light grey instead of heavy 2px border
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    paymentOptionSelected: {
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}05`,
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionIconSelected: {
        backgroundColor: `${theme.colors.primary}20`,
    },
    optionText: {
        flex: 1,
        gap: 4,
    },
    optionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    optionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    recommendedBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    recommendedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1,
    },
    optionDescription: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    radioButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 3,
    },
    radioDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
    },
    securityCard: {
        marginTop: 32,
        backgroundColor: `${theme.colors.primary}05`,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: `${theme.colors.primary}30`,
        padding: 24,
    },
    securityContent: {
        gap: 16,
    },
    securityHeader: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
    },
    securityText: {
        flex: 1,
        gap: 8,
    },
    securityTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    securityDescription: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    securityButton: {
        backgroundColor: `${theme.colors.primary}20`,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${theme.colors.primary}20`,
    },
    securityButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    footer: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
