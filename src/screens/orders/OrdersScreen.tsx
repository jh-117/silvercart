import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastProvider';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { getMyOrders, SupabaseOrder } from '../../services/orders.service';

const STATUS_COLOR: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#1565C0',
    shipped: '#8B5CF6',
    delivered: '#2e7d32',
    cancelled: '#d32f2f',
};

function statusLabel(s: string) {
    const map: Record<string, string> = {
        pending: 'Pending', processing: 'In Transit',
        shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
    };
    return map[s] ?? s;
}

export default function OrdersScreen() {
    const navigation = useNavigation<any>();
    const { showSuccess } = useToast();
    const { user } = useAuth();
    const { addItem } = useCart();
    const [orders, setOrders] = useState<SupabaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        if (!user) return;
        const data = await getMyOrders(user.id);
        // Show only recent orders (last 3) for quick reorder
        setOrders(data.slice(0, 5));
        setLoading(false);
        setRefreshing(false);
    }, [user]);

    useEffect(() => { load(); }, [load]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerIconBox}>
                        <MaterialIcons name="refresh" size={26} color={theme.colors.white} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.headerTitle}>Quick Reorder</Text>
                        <Text style={styles.headerSubtitle}>Repeat a previous order in one tap</Text>
                    </View>
                </View>
            </SafeAreaView>

            {/* Info Banner */}
            <View style={styles.infoBanner}>
                <MaterialIcons name="info-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.infoBannerText}>
                    Full order history is in <Text style={styles.infoBannerLink}>Profile → Order History</Text>
                </Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
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
                    {orders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="shopping-bag" size={64} color={theme.colors.borderLight} />
                            <Text style={styles.emptyTitle}>No Past Orders</Text>
                            <Text style={styles.emptySubtitle}>
                                Place your first order and it will appear here for quick reordering.
                            </Text>
                        </View>
                    ) : (
                        orders.map(order => {
                            const color = STATUS_COLOR[order.status] ?? '#888';
                            const itemCount = order.items?.length ?? 0;
                            const firstItem = order.items?.[0]?.productName ?? 'Order';
                            return (
                                <View key={order.id} style={styles.orderCard}>
                                    {/* Card Header */}
                                    <View style={styles.orderHeader}>
                                        <View style={styles.orderInfo}>
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

                                    {/* Order Summary */}
                                    <View style={styles.orderBody}>
                                        <View style={styles.orderIconBox}>
                                            <MaterialIcons name="shopping-basket" size={32} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.orderDetails}>
                                            <Text style={styles.orderTitle} numberOfLines={1}>{firstItem}</Text>
                                            <Text style={styles.orderItems}>
                                                {itemCount} item{itemCount !== 1 ? 's' : ''} included
                                            </Text>
                                            <Text style={styles.orderTotal}>RM {(order.total ?? 0).toFixed(2)}</Text>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View style={styles.actionRow}>
                                        <Pressable
                                            style={({ pressed }) => [styles.detailsButton, pressed && styles.buttonPressed]}
                                            onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                                        >
                                            <MaterialIcons name="receipt-long" size={20} color={theme.colors.primary} />
                                            <Text style={styles.detailsButtonText}>View Details</Text>
                                        </Pressable>

                                        <Pressable
                                            style={({ pressed }) => [styles.reorderButton, pressed && styles.buttonPressed]}
                                            onPress={async () => {
                                                if (!order.items || order.items.length === 0) return;
                                                let addedCount = 0;
                                                for (const item of order.items) {
                                                    try {
                                                        if (item.product_id) {
                                                            await addItem(item.product_id, item.quantity);
                                                            addedCount++;
                                                        }
                                                    } catch (e) {
                                                        // Skip items that no longer exist in the catalog
                                                        console.warn('Could not reorder item:', item.product_name, e);
                                                    }
                                                }
                                                if (addedCount > 0) {
                                                    showSuccess(`${addedCount} item(s) added to cart!`);
                                                    navigation.navigate('Cart');
                                                } else {
                                                    showSuccess('Sorry, these items are no longer available.');
                                                }
                                            }}
                                        >
                                            <MaterialIcons name="refresh" size={22} color={theme.colors.white} />
                                            <Text style={styles.reorderText}>Reorder</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: theme.colors.primary, paddingBottom: 4 },
    headerContent: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
    },
    headerIconBox: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24, fontWeight: 'bold', color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    headerSubtitle: {
        fontSize: 13, color: 'rgba(255,255,255,0.8)',
        fontFamily: theme.typography.fontFamily.regular, marginTop: 2,
    },
    infoBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: `${theme.colors.primary}10`,
        paddingHorizontal: 20, paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: `${theme.colors.primary}20`,
    },
    infoBannerText: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    infoBannerLink: { color: theme.colors.primary, fontWeight: '600' },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, gap: 20, paddingBottom: 120 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.bold },
    emptySubtitle: {
        fontSize: 16, color: theme.colors.textMuted, textAlign: 'center',
        paddingHorizontal: 32, lineHeight: 24, fontFamily: theme.typography.fontFamily.regular,
    },
    orderCard: {
        backgroundColor: theme.colors.white, borderRadius: 16, padding: 20, gap: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
        borderWidth: 1, borderColor: theme.colors.borderLight,
    },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderInfo: { gap: 3 },
    orderId: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    orderDate: { fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusText: { fontSize: 12, fontWeight: 'bold', fontFamily: theme.typography.fontFamily.bold, letterSpacing: 1 },
    orderBody: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: theme.colors.backgroundLight, padding: 14, borderRadius: 12,
    },
    orderIconBox: {
        width: 60, height: 60, borderRadius: 12,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center', alignItems: 'center',
    },
    orderDetails: { flex: 1, gap: 3 },
    orderTitle: { fontSize: 17, fontWeight: '600', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semibold },
    orderItems: { fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    orderTotal: { fontSize: 16, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold, marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 12 },
    detailsButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 14, borderRadius: 12,
        borderWidth: 2, borderColor: theme.colors.primary,
    },
    reorderButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 14, borderRadius: 12,
        backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    buttonPressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
    detailsButtonText: { fontSize: 15, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    reorderText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.white, fontFamily: theme.typography.fontFamily.bold },
});
