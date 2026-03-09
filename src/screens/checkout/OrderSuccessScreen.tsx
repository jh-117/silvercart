import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';

type OrderSuccessRouteProp = RouteProp<RootStackParamList, 'OrderSuccess'>;

export default function OrderSuccessScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<OrderSuccessRouteProp>();
    const { orderId } = route.params;

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="shopping-bag" size={28} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.headerTitle}>Order Confirmed</Text>
                </View>
            </SafeAreaView>

            {/* Main Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon with Ripple Effect */}
                <View style={styles.iconWrapper}>
                    <View style={styles.successIconContainer}>
                        <MaterialIcons name="check-circle" size={100} color="#1fad66" />
                    </View>
                </View>

                {/* Success Message */}
                <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                <Text style={styles.orderId}>{orderId || '#ORD-12345'}</Text>

                {/* Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusItem}>
                        <View style={styles.statusIconBg}>
                            <MaterialIcons name="mail" size={24} color="#1e88e5" />
                        </View>
                        <View style={styles.statusText}>
                            <Text style={styles.statusTitle}>Confirmation sent</Text>
                            <Text style={styles.statusDescription}>
                                A receipt has been sent to your email address.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statusItem}>
                        <View style={[styles.statusIconBg, { backgroundColor: `${theme.colors.primary}10` }]}>
                            <MaterialIcons name="family-restroom" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.statusText}>
                            <Text style={styles.statusTitle}>Assistant Notified</Text>
                            <Text style={styles.statusDescription}>
                                We've notified your trusted contact,{' '}
                                <Text style={styles.highlightedText}>Sarah</Text>, that your order is on its way.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Secondary Action */}
                <Pressable
                    style={({ pressed }) => [styles.detailsButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: orderId || 'ORD-12345' })}
                >
                    <Text style={styles.detailsButtonText}>View Order Details</Text>
                    <MaterialIcons name="arrow-forward" size={24} color={theme.colors.primary} />
                </Pressable>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [styles.continueButton, pressed && styles.buttonPressed]}
                    onPress={() => navigation.navigate('Main', { screen: 'Home' })}
                >
                    <Text style={styles.continueButtonText}>Continue Shopping</Text>
                </Pressable>
                <Text style={styles.footerText}>SilverCart — Your Trusted Assistant</Text>
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
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${theme.colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
        paddingBottom: 24,
    },
    iconWrapper: {
        marginBottom: 32,
        alignItems: 'center',
    },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `#1fad6610`,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1fad66',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1fad66',
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 8,
    },
    orderId: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 32,
    },
    statusCard: {
        width: '100%',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        gap: 24,
    },
    statusItem: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
    },
    statusIconBg: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        flex: 1,
        gap: 4,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    statusDescription: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    highlightedText: {
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
    },
    detailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    buttonPressed: {
        opacity: 0.6,
    },
    detailsButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        textDecorationLine: 'underline',
    },
    footer: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingHorizontal: 24,
        paddingTop: 24,
        alignItems: 'center',
    },
    continueButton: {
        backgroundColor: '#1fad66',
        width: '100%',
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1fad66',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
    },
    continueButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    footerText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 16,
    },
});

