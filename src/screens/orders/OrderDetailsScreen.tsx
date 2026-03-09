import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrderById, SupabaseOrder } from '../../services/orders.service';

// User-friendly labels that map to the admin's technical statuses
const USER_STATUS: Record<string, { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string; description: string }> = {
    pending: { label: 'Pending', icon: 'pending-actions', color: '#F59E0B', description: 'Your order has been placed and is awaiting confirmation.' },
    confirmed: { label: 'Confirmed', icon: 'task-alt', color: '#3B82F6', description: 'Great! Your order has been confirmed and is being prepared.' },
    preparing: { label: 'Preparing', icon: 'inventory', color: '#8B5CF6', description: 'Your items are being packed at our warehouse.' },
    out_for_delivery: { label: 'In Transit', icon: 'local-shipping', color: '#F97316', description: 'Your order is on its way! Our rider is heading to you.' },
    delivered: { label: 'Delivered', icon: 'check-circle', color: '#10B981', description: 'Your order has been delivered. Enjoy your items!' },
    cancelled: { label: 'Cancelled', icon: 'cancel', color: '#EF4444', description: 'This order has been cancelled.' },
};

// Timeline steps in order (excluding cancelled)
const TIMELINE_KEYS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export default function OrderDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<SupabaseOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const data = await getOrderById(orderId);
            setOrder(data);
            setLoading(false);
        })();
    }, [orderId]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                <Text style={styles.errorText}>Order not found.</Text>
            </View>
        );
    }

    const statusInfo = USER_STATUS[order.status] ?? USER_STATUS['pending'];
    const currentStepIdx = TIMELINE_KEYS.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';
    const canCancel = order.status === 'pending';
    const placedDate = new Date(order.created_at).toLocaleString('en-MY', { dateStyle: 'long', timeStyle: 'short' });

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.primary} />
                    </Pressable>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.headerSubtitle}>Placed {placedDate}</Text>
                    </View>
                    <View style={{ width: 28 }} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Status Card */}
                <View style={[styles.statusCard, { backgroundColor: `${statusInfo.color}12`, borderColor: `${statusInfo.color}30` }]}>
                    <View style={[styles.statusIconContainer, { backgroundColor: `${statusInfo.color}20` }]}>
                        <MaterialIcons name={statusInfo.icon} size={48} color={statusInfo.color} />
                    </View>
                    <Text style={[styles.statusTitle, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    <Text style={styles.statusDescription}>{statusInfo.description}</Text>
                    {order.estimated_delivery && (
                        <View style={styles.estimatedRow}>
                            <MaterialIcons name="event" size={18} color={statusInfo.color} />
                            <Text style={[styles.estimatedText, { color: statusInfo.color }]}>
                                Estimated: {new Date(order.estimated_delivery).toLocaleDateString('en-MY', { dateStyle: 'medium' })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Timeline */}
                {!isCancelled && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Order Progress</Text>
                        <View style={styles.timelineWrap}>
                            <View style={styles.timelineLine} />
                            {TIMELINE_KEYS.map((key, idx) => {
                                const info = USER_STATUS[key];
                                const completed = idx < currentStepIdx;
                                const active = idx === currentStepIdx;
                                const dotColor = completed ? '#10B981' : active ? info.color : '#CBD5E1';
                                return (
                                    <View key={key} style={styles.timelineRow}>
                                        <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: dotColor }]}>
                                            {completed && <MaterialIcons name="check" size={12} color="#FFF" />}
                                            {active && <View style={[styles.timelinePulse, { backgroundColor: info.color }]} />}
                                        </View>
                                        <View style={styles.timelineText}>
                                            <Text style={[styles.timelineLabel, active && { color: info.color, fontFamily: theme.typography.fontFamily.bold }]}>
                                                {info.label}
                                            </Text>
                                            {idx === 0 && <Text style={styles.timelineDate}>{placedDate}</Text>}
                                            {active && <Text style={[styles.timelineHint, { color: info.color }]}>Current status</Text>}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Items ({order.items?.length ?? 0})</Text>
                    {(order.items ?? []).length === 0 ? (
                        <Text style={styles.noItems}>No items found for this order.</Text>
                    ) : (
                        (order.items ?? []).map((item: any, i: number) => (
                            <View key={i} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                                <View style={styles.itemImageBox}>
                                    {item.product_image || item.productImage ? (
                                        <Image source={{ uri: item.product_image ?? item.productImage }} style={styles.itemImage} />
                                    ) : (
                                        <MaterialIcons name="inventory-2" size={24} color="#94A3B8" />
                                    )}
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.product_name ?? item.productName ?? 'Product'}
                                    </Text>
                                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    RM {((item.price_at_purchase ?? item.price ?? 0) * item.quantity).toFixed(2)}
                                </Text>
                            </View>
                        ))
                    )}

                    {/* Price Breakdown */}
                    <View style={styles.pricingBox}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>RM {order.subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery Fee</Text>
                            <Text style={styles.priceValue}>RM {order.delivery_fee.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>RM {(order.total ?? order.total_amount ?? 0).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Delivery Details</Text>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="location-on" size={20} color={theme.colors.primary} />
                        <Text style={styles.infoText}>{order.delivery_address ?? 'No address provided'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="payments" size={20} color={theme.colors.primary} />
                        <Text style={styles.infoText}>{order.payment_method?.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Cancel button — only for pending orders */}
                {canCancel && (
                    <Pressable
                        style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
                        onPress={() => navigation.navigate('CancelOrder', { orderId: order.id })}
                    >
                        <MaterialIcons name="cancel" size={22} color="#EF4444" />
                        <Text style={styles.cancelBtnText}>Cancel This Order</Text>
                    </Pressable>
                )}

                {isCancelled && order.cancellation_reason && (
                    <View style={styles.cancellationNote}>
                        <MaterialIcons name="info-outline" size={18} color="#EF4444" />
                        <Text style={styles.cancellationText}>
                            Cancelled reason: {order.cancellation_reason}
                        </Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { fontSize: 18, color: '#EF4444', fontFamily: theme.typography.fontFamily.bold },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerInfo: { alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    headerSubtitle: { fontSize: 15, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, marginTop: 2 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, gap: 14 },
    statusCard: {
        borderRadius: 16, padding: 24, alignItems: 'center', gap: 10,
        borderWidth: 1.5,
    },
    statusIconContainer: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
    },
    statusTitle: { fontSize: 32, fontWeight: '800', fontFamily: theme.typography.fontFamily.bold },
    statusDescription: { fontSize: 18, color: theme.colors.textMuted, textAlign: 'center', fontFamily: theme.typography.fontFamily.regular, lineHeight: 26 },
    estimatedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    estimatedText: { fontSize: 16, fontWeight: '600', fontFamily: theme.typography.fontFamily.semibold },
    card: {
        backgroundColor: theme.colors.white, borderRadius: 16, padding: 16, gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    timelineWrap: { position: 'relative', paddingLeft: 4 },
    timelineLine: { position: 'absolute', left: 15, top: 12, bottom: 12, width: 2, backgroundColor: '#E2E8F0' },
    timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    timelineDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    timelinePulse: { width: 8, height: 8, borderRadius: 4 },
    timelineText: { flex: 1, paddingBottom: 18 },
    timelineLabel: { fontSize: 18, fontWeight: '600', color: '#94A3B8', fontFamily: theme.typography.fontFamily.semibold },
    timelineDate: { fontSize: 14, color: '#94A3B8', marginTop: 2, fontFamily: theme.typography.fontFamily.regular },
    timelineHint: { fontSize: 13, fontStyle: 'italic', marginTop: 2 },
    noItems: { fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 8 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
    itemBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    itemImageBox: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    itemImage: { width: 60, height: 60, resizeMode: 'cover' },
    itemInfo: { flex: 1, gap: 4 },
    itemName: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semibold },
    itemQty: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    itemPrice: { fontSize: 20, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    pricingBox: {
        backgroundColor: `${theme.colors.primary}08`, borderRadius: 12, padding: 14, gap: 6,
        borderWidth: 1, borderColor: `${theme.colors.primary}15`, marginTop: 4,
    },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 17, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    priceValue: { fontSize: 17, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular },
    totalRow: { borderTopWidth: 1, borderTopColor: `${theme.colors.primary}20`, paddingTop: 10, marginTop: 4 },
    totalLabel: { fontSize: 20, fontWeight: '800', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    totalValue: { fontSize: 22, fontWeight: '800', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    infoText: { flex: 1, fontSize: 17, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular, lineHeight: 24 },
    cancelBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderWidth: 1.5, borderColor: '#EF4444', borderRadius: 14, paddingVertical: 16,
        backgroundColor: '#FEF2F2',
    },
    cancelBtnText: { fontSize: 18, fontWeight: '700', color: '#EF4444', fontFamily: theme.typography.fontFamily.bold },
    cancellationNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12 },
    cancellationText: { flex: 1, fontSize: 15, color: '#EF4444', fontFamily: theme.typography.fontFamily.regular },
});
