import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrderById, updateOrderStatus, SupabaseOrder } from '../../services/orders.service';
import { AuthContext } from '../../contexts/AuthContext';
import { notificationsService } from '../../services/notifications.service';

// Policy: customer may cancel within 1 HOUR of placing the order (status = 'pending')
const CANCEL_WINDOW_SECONDS = 3600; // 1 hour

export default function CancelOrderScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params ?? {};
    const { user } = React.useContext(AuthContext);

    const [order, setOrder] = useState<SupabaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(CANCEL_WINDOW_SECONDS);
    const [selectedReason, setSelectedReason] = useState('');

    // Load real order
    useEffect(() => {
        (async () => {
            if (!orderId) { setLoading(false); return; }
            const data = await getOrderById(orderId);
            setOrder(data);
            if (data) {
                // Calculate how many seconds remain in the 5-minute window
                const elapsed = Math.floor((Date.now() - new Date(data.created_at).getTime()) / 1000);
                setTimeRemaining(Math.max(0, CANCEL_WINDOW_SECONDS - elapsed));
            }
            setLoading(false);
        })();
    }, [orderId]);

    // Countdown
    useEffect(() => {
        if (timeRemaining <= 0) return;
        const timer = setInterval(() => {
            setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const percentage = (timeRemaining / CANCEL_WINDOW_SECONDS) * 100;
    const windowExpired = timeRemaining <= 0;

    const handleCancel = () => {
        if (!order) return;
        if (windowExpired) {
            Alert.alert('Window Expired', 'The 5-minute cancellation window has passed. Please contact support for assistance.');
            return;
        }
        if (!selectedReason) {
            Alert.alert('Select Reason', 'Please select a reason for cancellation.');
            return;
        }
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order? This cannot be undone.',
            [
                { text: 'No, Keep It', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        const result = await updateOrderStatus(order.id, 'cancelled');
                        setCancelling(false);
                        if (result.success) {
                            if (user?.id) {
                                await notificationsService.notifyTrustedContacts(
                                    user.id,
                                    order.id,
                                    'order_cancelled',
                                    `Order #${order.id.slice(0, 8).toUpperCase()} has been cancelled by the user.`
                                );
                            }
                            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.', [
                                { text: 'OK', onPress: () => { navigation.popToTop(); } }
                            ]);
                        } else {
                            Alert.alert('Error', result.error ?? 'Failed to cancel order. Please try again.');
                        }
                    }
                }
            ]
        );
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
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Cancel Your Order</Text>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <>
                        {/* Timer Circle */}
                        <View style={styles.timerContainer}>
                            <View style={[styles.timerCircle, windowExpired && { borderColor: '#EF4444' }]}>
                                <Text style={[styles.timerText, windowExpired && { color: '#EF4444' }]}>
                                    {windowExpired ? '00:00' : formatTime(timeRemaining)}
                                </Text>
                                <Text style={styles.timerLabel}>
                                    {windowExpired ? 'WINDOW CLOSED' : 'REMAINING'}
                                </Text>
                            </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Cancellation Window (1 hr)</Text>
                                <Text style={[styles.progressStatus, windowExpired && { color: '#EF4444' }]}>
                                    {windowExpired ? 'Expired' : 'Expires soon'}
                                </Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBar, { width: `${percentage}%` }, windowExpired && { backgroundColor: '#EF4444' }]} />
                            </View>
                        </View>

                        {/* Real Order Card */}
                        {order && (
                            <View style={styles.orderCard}>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.orderTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                                    <Text style={styles.orderSubtitle}>
                                        {order.items?.length ?? 0} Item{(order.items?.length ?? 0) !== 1 ? 's' : ''} • RM {(order.total ?? order.total_amount ?? 0).toFixed(2)}
                                    </Text>
                                </View>
                                <MaterialIcons name="receipt-long" size={40} color={theme.colors.primary} />
                            </View>
                        )}

                        {/* Reason Picker */}
                        {!windowExpired && (
                            <View style={styles.reasonSection}>
                                <Text style={styles.reasonTitle}>Reason for Cancellation</Text>
                                {[
                                    'Changed my mind',
                                    'Ordered by mistake',
                                    'Found a better price',
                                    'Delivery time too long',
                                    'Other',
                                ].map(reason => (
                                    <Pressable
                                        key={reason}
                                        style={[styles.reasonOption, selectedReason === reason && styles.reasonSelected]}
                                        onPress={() => setSelectedReason(reason)}
                                    >
                                        <View style={[styles.reasonDot, selectedReason === reason && styles.reasonDotSelected]} />
                                        <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                                            {reason}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {/* Warning Card */}
                        <View style={styles.warningCard}>
                            <View style={styles.warningHeader}>
                                <MaterialIcons name="warning" size={32} color="#d32f2f" />
                                <Text style={styles.warningTitle}>
                                    {windowExpired ? 'Window Expired' : 'Critical Warning'}
                                </Text>
                            </View>
                            <Text style={styles.warningText}>
                                {windowExpired
                                    ? 'The 5-minute cancellation window has passed. Please contact our support team for further assistance.'
                                    : 'Once cancelled, this order cannot be restored. Cancellations are processed immediately.'}
                            </Text>
                            <Pressable
                                style={styles.policyLink}
                                onPress={() => navigation.navigate('CancellationPolicy' as never)}
                            >
                                <Text style={styles.policyLinkText}>View Cancellation Policy</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#d32f2f" />
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Footer Actions */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.keepButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.keepButtonText}>Keep My Order</Text>
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.cancelButton,
                        pressed && styles.buttonPressed,
                        (windowExpired || !order || cancelling) && { opacity: 0.5 },
                    ]}
                    onPress={handleCancel}
                    disabled={cancelling}
                >
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </Pressable>

                {/* Assistant Indicator */}
                <Pressable
                    style={styles.assistantIndicator}
                    onPress={() => (navigation as any).navigate('Support')}
                >
                    <View style={styles.assistantIcon}>
                        <MaterialIcons name="support-agent" size={16} color={theme.colors.textPrimary} />
                    </View>
                    <Text style={styles.assistantText}>SilverCart Assistant: Help is 1 tap away</Text>
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
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundLight,
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
        gap: 24,
        alignItems: 'center',
    },
    timerContainer: {
        marginVertical: 24,
    },
    timerCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 12,
        borderColor: '#d32f2f',
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#d32f2f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    timerLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.semibold,
        letterSpacing: 2,
        marginTop: 4,
    },
    progressSection: {
        width: '100%',
        gap: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    progressStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#d32f2f',
        fontFamily: theme.typography.fontFamily.bold,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#d32f2f',
        borderRadius: 6,
    },
    orderCard: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    orderInfo: {
        flex: 1,
        gap: 6,
    },
    orderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    orderSubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    orderImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#E0E0E0',
    },
    warningCard: {
        width: '100%',
        backgroundColor: '#ffebee',
        borderRadius: 16,
        padding: 24,
        borderWidth: 4,
        borderColor: '#d32f2f',
        gap: 16,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    warningTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#d32f2f',
        fontFamily: theme.typography.fontFamily.bold,
    },
    warningText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
        lineHeight: 24,
    },
    warningBold: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    policyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    policyLinkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#d32f2f',
        fontFamily: theme.typography.fontFamily.bold,
    },
    footer: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        padding: 24,
        gap: 16,
    },
    keepButton: {
        backgroundColor: theme.colors.textPrimary,
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    keepButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    cancelButton: {
        backgroundColor: '#d32f2f',
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#d32f2f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    cancelButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    assistantIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
        paddingVertical: 8,
    },
    assistantIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    assistantText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.bold,
    },
    loadingBox: {
        height: 200, justifyContent: 'center', alignItems: 'center',
    },
    reasonSection: {
        backgroundColor: theme.colors.white, borderRadius: 16, padding: 16, gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    reasonTitle: {
        fontSize: 17, fontWeight: '700', color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold, marginBottom: 4,
    },
    reasonOption: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10,
        borderWidth: 1.5, borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.backgroundLight,
    },
    reasonSelected: {
        borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10`,
    },
    reasonDot: {
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: theme.colors.borderLight, backgroundColor: 'transparent',
    },
    reasonDotSelected: {
        borderColor: theme.colors.primary, backgroundColor: theme.colors.primary,
    },
    reasonText: {
        fontSize: 15, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular,
    },
    reasonTextSelected: {
        color: theme.colors.primary, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold,
    },
});
