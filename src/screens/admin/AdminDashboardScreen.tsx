import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { getAllOrders, getOrderStats, SupabaseOrder, OrderStatus } from '../../services/orders.service';
import { useAuth } from '../../hooks/useAuth';

const STATUS_COLOR: Record<OrderStatus | string, string> = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
};

function StatCard({ label, value, icon, color }: {
    label: string; value: string; icon: string; color: string;
}) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color }]}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}15` }]}>
                <MaterialIcons name={icon as any} size={26} color={color} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

export default function AdminDashboardScreen() {
    const navigation = useNavigation<any>();
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentOrders, setRecentOrders] = useState<SupabaseOrder[]>([]);
    const [stats, setStats] = useState({ total: 0, revenue: 0, pending: 0, delivered: 0 });

    const loadData = async () => {
        const [allOrders, statsData] = await Promise.all([
            getAllOrders(),
            getOrderStats(),
        ]);
        setRecentOrders(allOrders.slice(0, 5));
        setStats(statsData);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { loadData(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerGreeting}>Admin Panel</Text>
                        <Text style={styles.headerSub}>{user?.email}</Text>
                    </View>
                    <Pressable style={styles.signOutBtn} onPress={signOut}>
                        <MaterialIcons name="logout" size={22} color="#d32f2f" />
                    </Pressable>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats */}
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard label="Total Orders" value={String(stats.total)} icon="receipt-long" color="#3B82F6" />
                    <StatCard label="Revenue" value={`RM ${stats.revenue.toFixed(2)}`} icon="payments" color="#10B981" />
                    <StatCard label="Pending" value={String(stats.pending)} icon="pending-actions" color="#F59E0B" />
                    <StatCard label="Delivered" value={String(stats.delivered)} icon="check-circle" color="#6366F1" />
                </View>

                {/* Status breakdown */}
                <Text style={styles.sectionTitle}>Status Breakdown</Text>
                <View style={styles.breakdownCard}>
                    {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(s => {
                        const count = recentOrders.filter(o => o.status === s).length;
                        return (
                            <View key={s} style={styles.breakdownRow}>
                                <View style={[styles.breakdownDot, { backgroundColor: STATUS_COLOR[s] }]} />
                                <Text style={styles.breakdownLabel}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                                <View style={styles.breakdownBarBg}>
                                    <View style={[styles.breakdownBar, {
                                        width: `${recentOrders.length > 0 ? (count / recentOrders.length) * 100 : 0}%`,
                                        backgroundColor: STATUS_COLOR[s]
                                    }]} />
                                </View>
                                <Text style={styles.breakdownCount}>{count}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Recent Orders */}
                <View style={styles.recentHeader}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <Pressable onPress={() => navigation.navigate('AdminOrders')}>
                        <Text style={styles.seeAll}>Manage All →</Text>
                    </Pressable>
                </View>

                {recentOrders.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <MaterialIcons name="inbox" size={48} color={theme.colors.textMuted} />
                        <Text style={styles.emptyText}>No orders yet.</Text>
                        <Text style={styles.emptySubText}>Orders will appear here once customers place them.</Text>
                    </View>
                ) : (
                    recentOrders.map(order => (
                        <Pressable
                            key={order.id}
                            style={({ pressed }) => [styles.orderCard, pressed && styles.cardPressed]}
                            onPress={() => navigation.navigate('AdminOrderDetail', { orderId: order.id })}
                        >
                            <View style={styles.orderTop}>
                                <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
                                <View style={[styles.badge, { backgroundColor: STATUS_COLOR[order.status] }]}>
                                    <Text style={styles.badgeText}>
                                        {order.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.orderName}>{order.customer_name ?? 'Customer'}</Text>
                            <View style={styles.orderBottom}>
                                <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString('en-MY')}</Text>
                                <Text style={styles.orderTotal}>RM {(order.total ?? 0).toFixed(2)}</Text>
                            </View>
                        </Pressable>
                    ))
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#1E293B' },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerGreeting: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        fontFamily: theme.typography.fontFamily.bold,
    },
    headerSub: {
        fontSize: 13,
        color: '#94A3B8',
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    signOutBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 12 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: theme.typography.fontFamily.bold,
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: '47%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIconBox: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        fontFamily: theme.typography.fontFamily.bold,
    },
    statLabel: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: theme.typography.fontFamily.regular,
    },
    breakdownCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    breakdownDot: { width: 10, height: 10, borderRadius: 5 },
    breakdownLabel: {
        width: 90,
        fontSize: 14,
        color: '#334155',
        fontFamily: theme.typography.fontFamily.medium,
    },
    breakdownBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        overflow: 'hidden',
    },
    breakdownBar: {
        height: '100%',
        borderRadius: 4,
        minWidth: 4,
    },
    breakdownCount: {
        width: 28,
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'right',
        fontFamily: theme.typography.fontFamily.bold,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    emptyBox: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.bold,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderId: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        fontFamily: theme.typography.fontFamily.bold,
    },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold, letterSpacing: 0.5, color: '#FFFFFF' },
    orderName: {
        fontSize: 14,
        color: '#64748B',
        fontFamily: theme.typography.fontFamily.regular,
    },
    orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    orderDate: { fontSize: 13, color: '#94A3B8', fontFamily: theme.typography.fontFamily.regular },
    orderTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
