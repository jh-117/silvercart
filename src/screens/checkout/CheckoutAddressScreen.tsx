import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function CheckoutAddressScreen() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Checkout</Text>
                </View>
            </SafeAreaView>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressDots}>
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressDot} />
                </View>
                <Text style={styles.progressText}>STEP 1 OF 3</Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headlineSection}>
                    <Text style={styles.headline}>Delivery Address</Text>
                    <Text style={styles.subheadline}>Confirm where we should send your order.</Text>
                </View>

                {/* Address Card */}
                <View style={styles.addressCard}>
                    <View style={styles.mapPreview} />
                    <View style={styles.addressInfo}>
                        <View style={styles.addressRow}>
                            <MaterialIcons name="person" size={28} color={theme.colors.primary} />
                            <Text style={styles.addressName}>Jane Doe</Text>
                        </View>
                        <View style={styles.addressDetails}>
                            <View style={styles.detailRow}>
                                <MaterialIcons name="location-on" size={24} color={theme.colors.textMuted} />
                                <View style={styles.detailText}>
                                    <Text style={styles.addressLine}>123 Maple Avenue</Text>
                                    <Text style={styles.addressCity}>Springfield, IL 62704</Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <MaterialIcons name="phone" size={24} color={theme.colors.textMuted} />
                                <Text style={styles.phoneNumber}>555-0123</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Info Note */}
                <View style={styles.infoNote}>
                    <MaterialIcons name="info" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.infoText}>Standard delivery usually takes 2-3 business days.</Text>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Footer Buttons */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('CheckoutPayment')}
                >
                    <Text style={styles.continueButtonText}>Continue to Payment</Text>
                    <MaterialIcons name="arrow-forward" size={24} color={theme.colors.white} />
                </Pressable>
                <Pressable
                    style={({ pressed }) => [styles.changeButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('EditProfile' as any)}
                >
                    <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
                    <Text style={styles.changeButtonText}>Change Address</Text>
                </Pressable>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5f3',
    },
    header: {
        backgroundColor: '#f7f5f3',
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
        alignItems: 'flex-start',
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
    progressContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    progressDots: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#dce3e5',
    },
    progressDotActive: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 3,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        letterSpacing: 1.5,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headlineSection: {
        paddingVertical: 16,
    },
    headline: {
        fontSize: 36,
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
    addressCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        marginTop: 16,
    },
    mapPreview: {
        height: 128,
        backgroundColor: '#E0E0E0',
        opacity: 0.8,
    },
    addressInfo: {
        padding: 24,
        gap: 24,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addressName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    addressDetails: {
        gap: 12,
        paddingLeft: 44,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    detailText: {
        flex: 1,
    },
    addressLine: {
        fontSize: 20,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    addressCity: {
        fontSize: 20,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    phoneNumber: {
        fontSize: 20,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    infoNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 32,
        paddingVertical: 8,
        marginTop: 8,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    footer: {
        padding: 24,
        gap: 16,
        backgroundColor: '#f7f5f3',
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 22,
        borderRadius: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    changeButton: {
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#dce3e5',
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
    changeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
});

