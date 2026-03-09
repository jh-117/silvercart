import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { getMyOrders, SupabaseOrder, OrderStatus } from '../../services/orders.service';

const STATUS_COLOR: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#1565C0',
    shipped: '#8B5CF6',
    delivered: '#2e7d32',
    cancelled: '#d32f2f',
};

const STATUS_FILTERS = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function statusLabel(s: string) {
    const map: Record<string, string> = {
        pending: 'Pending',
        processing: 'In Transit',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    return map[s] ?? s;
}

export default function OrderHistoryScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [orders, setOrders] = useState<SupabaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const load = useCallback(async () => {
        if (!user) return;
        const data = await getMyOrders(user.id);
        setOrders(data);
        setLoading(false);
        setRefreshing(false);
    }, [user]);

    useEffect(() => { load(); }, [load]);

    const filtered = activeFilter === 'All' ? orders : orders.filter(o => o.status === activeFilter);

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
            >
                {STATUS_FILTERS.map(f => (
                    <Pressable
                        key={f}
                        style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                            {f === 'All' ? 'All' : statusLabel(f)}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading your orders…</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); load(); }}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="receipt-long" size={64} color={theme.colors.borderLight} />
                            <Text style={styles.emptyTitle}>No orders yet</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeFilter === 'All'
                                    ? 'Place your first order to see it here.'
                                    : `No ${statusLabel(activeFilter).toLowerCase()} orders.`}
                            </Text>
                        </View>
                    ) : (
                        filtered.map(order => {
                            const color = STATUS_COLOR[order.status] ?? '#888';
                            const itemCount = order.items?.length ?? 0;
                            const firstItem = order.items?.[0]?.productName ?? 'Order';
                            return (
                                <Pressable
                                    key={order.id}
                                    style={({ pressed }) => [styles.orderCard, pressed && styles.cardPressed]}
                                    onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                                >
                                    {/* Row 1: ID + status */}
                                    <View style={styles.orderHeader}>
                                        <View>
                                            <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                                            <Text style={styles.orderDate}>
                                                {new Date(order.created_at).toLocaleDateString('en-MY', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: `${color}15`, borderColor: `${color}33` }]}>
                                            <Text style={[styles.statusText, { color }]}>
                                                {statusLabel(order.status).toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Row 2: Summary */}
                                    <View style={styles.orderBody}>
                                        <View style={styles.orderIconBox}>
                                            <MaterialIcons name="shopping-basket" size={28} color={theme.colors.primary} />
                                        </View>
                                        <View style={{ flex: 1, gap: 3 }}>
                                            <Text style={styles.orderTitle} numberOfLines={1}>{firstItem}</Text>
                                            <Text style={styles.orderItems}>
                                                {itemCount} item{itemCount !== 1 ? 's' : ''} included
                                            </Text>
                                        </View>
                                        <Text style={styles.orderTotal}>RM {(order.total ?? 0).toFixed(2)}</Text>
                                    </View>

                                    {/* Row 3: CTA */}
                                    <View style={styles.orderFooter}>
                                        <Text style={styles.viewDetails}>View Full Details</Text>
                                        <MaterialIcons name="chevron-right" size={20} color={theme.colors.primary} />
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                    <View style={{ height: 48 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loadingText: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    filterRow: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        maxHeight: 60,
    },
    filterContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.backgroundLight,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    filterText: {
        fontSize: 14, fontWeight: '600',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    filterTextActive: { color: theme.colors.white },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, gap: 14, paddingBottom: 48 },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 14 },
    emptyTitle: {
        fontSize: 20, fontWeight: 'bold',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.bold,
    },
    emptySubtitle: {
        fontSize: 15, color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 18,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    cardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: {
        fontSize: 17, fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    orderDate: {
        fontSize: 13, color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular, marginTop: 2,
    },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: 'bold', fontFamily: theme.typography.fontFamily.bold, letterSpacing: 0.8 },
    orderBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.backgroundLight,
        padding: 12,
        borderRadius: 10,
    },
    orderIconBox: {
        width: 52, height: 52,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderTitle: {
        fontSize: 16, fontWeight: '600',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    orderItems: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    orderTotal: { fontSize: 16, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    viewDetails: { fontSize: 14, fontWeight: '600', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold },
});
