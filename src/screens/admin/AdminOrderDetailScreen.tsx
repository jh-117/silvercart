import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getOrderById, updateOrderStatus, SupabaseOrder, OrderStatus } from '../../services/orders.service';

const ALL_STATUSES: { key: OrderStatus; label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string }[] = [
    { key: 'pending', label: 'Pending', icon: 'pending-actions', color: '#F59E0B' },
    { key: 'confirmed', label: 'Confirmed', icon: 'task-alt', color: '#3B82F6' },
    { key: 'preparing', label: 'Preparing', icon: 'inventory', color: '#8B5CF6' },
    { key: 'out_for_delivery', label: 'Out for Del.', icon: 'local-shipping', color: '#F97316' },
    { key: 'delivered', label: 'Delivered', icon: 'check-circle', color: '#10B981' },
    { key: 'cancelled', label: 'Cancelled', icon: 'cancel', color: '#EF4444' },
];

const TIMELINE_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

function TimelineStep({
    status, label, active, completed, date
}: { status: string; label: string; active: boolean; completed: boolean; date?: string }) {
    const color = active ? theme.colors.primary : completed ? '#10B981' : '#CBD5E1';
    return (
        <View style={tlStyles.step}>
            <View style={[tlStyles.dot, { backgroundColor: color, borderColor: color }]}>
                {completed && <MaterialIcons name="check" size={12} color="#FFF" />}
                {active && <View style={tlStyles.pulse} />}
            </View>
            <View style={tlStyles.stepText}>
                <Text style={[tlStyles.stepLabel, active && { color: theme.colors.primary }, completed && { color: '#10B981' }]}>
                    {label}
                </Text>
                {date && <Text style={tlStyles.stepDate}>{date}</Text>}
                {active && <Text style={tlStyles.activeHint}>Current status</Text>}
            </View>
        </View>
    );
}

const tlStyles = StyleSheet.create({
    step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    pulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
    stepText: { flex: 1, paddingBottom: 20 },
    stepLabel: { fontSize: 14, fontWeight: '700', color: '#94A3B8', fontFamily: theme.typography.fontFamily.bold },
    stepDate: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    activeHint: { fontSize: 11, color: theme.colors.primary, fontStyle: 'italic', marginTop: 2 },
});

export default function AdminOrderDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<SupabaseOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await getOrderById(orderId);
            setOrder(data);
            setLoading(false);
        })();
    }, [orderId]);

    const handleStatusChange = (newStatus: OrderStatus) => {
        if (!order || newStatus === order.status) return;
        const s = ALL_STATUSES.find(x => x.key === newStatus)!;
        Alert.alert(
            'Update Status',
            `Change order status to "${s.label}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setUpdating(true);
                        const result = await updateOrderStatus(orderId, newStatus);
                        setUpdating(false);
                        if (result.success) {
                            setOrder(prev => prev ? { ...prev, status: newStatus } : null);
                        } else {
                            Alert.alert('Error', result.error ?? 'Failed to update status.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );

    if (!order) return (
        <View style={styles.center}>
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>Order not found.</Text>
        </View>
    );

    const currentStatusInfo = ALL_STATUSES.find(s => s.key === order.status);
    const currentStepIdx = TIMELINE_STEPS.indexOf(order.status as any);
    const placedDate = new Date(order.created_at).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                    </Pressable>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.headerTitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
                        <View style={[styles.statusChip, { backgroundColor: `${currentStatusInfo?.color}30` }]}>
                            <Text style={[styles.statusChipText, { color: currentStatusInfo?.color }]}>
                                {currentStatusInfo?.label?.toUpperCase() ?? order.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Customer & Order Info ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer Information</Text>
                    <View style={styles.customerRow}>
                        <View style={styles.avatarCircle}>
                            <MaterialIcons name="person" size={26} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.customerName}>Customer</Text>
                            <Text style={styles.customerId}>ID: {order.user_id.slice(0, 12)}…</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
                        <Text style={styles.infoText}>{order.delivery_address ?? 'No address set'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="payments" size={18} color={theme.colors.primary} />
                        <Text style={styles.infoText}>{order.payment_method?.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="schedule" size={18} color={theme.colors.primary} />
                        <Text style={styles.infoText}>Placed: {placedDate}</Text>
                    </View>
                </View>

                {/* ── Order Items ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardTitle}>Order Items</Text>
                        <Text style={styles.itemCount}>{order.items?.length ?? 0} Items</Text>
                    </View>
                    {(order.items ?? []).length === 0 ? (
                        <Text style={styles.emptyItems}>No items available</Text>
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
                                        {item.product_name ?? item.productName ?? 'Unknown Product'}
                                    </Text>
                                    <View style={styles.itemQtyBadge}>
                                        <Text style={styles.itemQtyText}>QTY: {item.quantity}</Text>
                                    </View>
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
                        <View style={styles.divider} />
                        <View style={styles.priceRow}>
                            <Text style={styles.totalLabel}>Order Total</Text>
                            <Text style={styles.totalValue}>RM {(order.total ?? order.total_amount ?? 0).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Status Timeline ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Status Timeline</Text>
                    <View style={styles.timelineWrap}>
                        <View style={styles.timelineLine} />
                        {TIMELINE_STEPS.map((step, idx) => (
                            <TimelineStep
                                key={step}
                                status={step}
                                label={ALL_STATUSES.find(s => s.key === step)?.label ?? step}
                                completed={idx < currentStepIdx}
                                active={idx === currentStepIdx}
                                date={idx === 0 ? placedDate : undefined}
                            />
                        ))}
                        {order.status === 'cancelled' && (
                            <View style={[tlStyles.step, { marginTop: 8 }]}>
                                <View style={[tlStyles.dot, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}>
                                    <MaterialIcons name="close" size={12} color="#FFF" />
                                </View>
                                <View style={tlStyles.stepText}>
                                    <Text style={[tlStyles.stepLabel, { color: '#EF4444' }]}>Cancelled</Text>
                                    {order.cancellation_reason && (
                                        <Text style={tlStyles.activeHint}>Reason: {order.cancellation_reason}</Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Admin Actions ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Update Order Status</Text>
                    {updating && <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginBottom: 8 }} />}
                    <View style={styles.statusGrid}>
                        {ALL_STATUSES.map(s => {
                            const isActive = order.status === s.key;
                            return (
                                <Pressable
                                    key={s.key}
                                    style={[
                                        styles.statusBtn,
                                        { borderColor: s.color },
                                        isActive && { backgroundColor: s.color }
                                    ]}
                                    onPress={() => handleStatusChange(s.key)}
                                    disabled={updating}
                                >
                                    <MaterialIcons
                                        name={s.icon}
                                        size={18}
                                        color={isActive ? '#FFF' : s.color}
                                    />
                                    <Text style={[styles.statusBtnText, { color: isActive ? '#FFF' : s.color }]}>
                                        {s.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    errorText: { fontSize: 18, color: '#EF4444', fontFamily: theme.typography.fontFamily.bold },
    header: { backgroundColor: '#1E293B' },
    headerContent: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFF', fontFamily: theme.typography.fontFamily.bold },
    statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
    statusChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, fontFamily: theme.typography.fontFamily.bold },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 14 },
    card: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 16, gap: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', fontFamily: theme.typography.fontFamily.bold },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemCount: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 },
    customerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    avatarCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: `${theme.colors.primary}20`,
        justifyContent: 'center', alignItems: 'center',
    },
    customerName: { fontSize: 16, fontWeight: '700', color: '#1E293B', fontFamily: theme.typography.fontFamily.bold },
    customerId: { fontSize: 13, color: '#94A3B8', fontFamily: theme.typography.fontFamily.regular },
    divider: { height: 1, backgroundColor: '#F1F5F9' },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    infoText: { flex: 1, fontSize: 14, color: '#334155', fontFamily: theme.typography.fontFamily.regular, lineHeight: 20 },
    emptyItems: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    itemBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    itemImageBox: {
        width: 52, height: 52, borderRadius: 10,
        backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    },
    itemImage: { width: 52, height: 52, resizeMode: 'cover' },
    itemInfo: { flex: 1, gap: 4 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1E293B', fontFamily: theme.typography.fontFamily.semibold },
    itemQtyBadge: { backgroundColor: '#F1F5F9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
    itemQtyText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
    itemPrice: { fontSize: 14, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    pricingBox: {
        backgroundColor: `${theme.colors.primary}08`,
        borderRadius: 12, padding: 14, gap: 6,
        borderWidth: 1, borderColor: `${theme.colors.primary}18`,
    },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 14, color: '#64748B', fontFamily: theme.typography.fontFamily.regular },
    priceValue: { fontSize: 14, color: '#334155', fontFamily: theme.typography.fontFamily.regular },
    totalLabel: { fontSize: 16, fontWeight: '800', color: '#1E293B', fontFamily: theme.typography.fontFamily.bold },
    totalValue: { fontSize: 18, fontWeight: '800', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    timelineWrap: { position: 'relative', paddingLeft: 4 },
    timelineLine: {
        position: 'absolute', left: 15, top: 12, bottom: 12,
        width: 2, backgroundColor: '#E2E8F0', zIndex: 0,
    },
    statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    statusBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, backgroundColor: '#F8FAFC',
    },
    statusBtnText: { fontSize: 12, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold },
});
