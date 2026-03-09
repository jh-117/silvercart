import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    ActivityIndicator, RefreshControl, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { getAllOrders, SupabaseOrder, OrderStatus } from '../../services/orders.service';

const STATUS_COLOR: Record<string, string> = {
    pending: '#F59E0B',
    processing: '#3B82F6',
    shipped: '#8B5CF6',
    delivered: '#10B981',
    cancelled: '#EF4444',
};

const FILTERS = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersScreen() {
    const navigation = useNavigation<any>();
    const [allOrders, setAllOrders] = useState<SupabaseOrder[]>([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        const data = await getAllOrders();
        setAllOrders(data);
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => { load(); }, []);

    const filtered = filter === 'All' ? allOrders : allOrders.filter(o => o.status === filter);

    const renderItem = ({ item }: { item: SupabaseOrder }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => navigation.navigate('AdminOrderDetail', { orderId: item.id })}
        >
            <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={styles.cardCustomer}>{item.customer_name ?? 'Customer'}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: `${STATUS_COLOR[item.status]}20` }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View style={styles.cardBottom}>
                <View style={styles.cardInfo}>
                    <MaterialIcons name="calendar-today" size={14} color="#94A3B8" />
                    <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString('en-MY')}</Text>
                </View>
                <View style={styles.cardInfo}>
                    <MaterialIcons name="shopping-bag" size={14} color="#94A3B8" />
                    <Text style={styles.cardDate}>{item.items?.length ?? 0} item(s)</Text>
                </View>
                <Text style={styles.cardTotal}>RM {(item.total ?? 0).toFixed(2)}</Text>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Manage Orders</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            {/* Filter chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={styles.filterContent}
            >
                {FILTERS.map(f => (
                    <Pressable
                        key={f}
                        style={[styles.chip, filter === f && styles.chipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                            {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyBox}>
                            <MaterialIcons name="inbox" size={56} color={theme.colors.textMuted} />
                            <Text style={styles.emptyText}>No orders</Text>
                            <Text style={styles.emptySubText}>No orders match the selected filter.</Text>
                        </View>
                    }
                />
            )}
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
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
        fontFamily: theme.typography.fontFamily.bold,
    },
    filterRow: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        maxHeight: 56,
    },
    filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#64748B', fontFamily: theme.typography.fontFamily.semibold },
    chipTextActive: { color: '#FFFFFF' },
    listContent: { padding: 16, gap: 12, paddingBottom: 48 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 14,
        padding: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardLeft: { gap: 2 },
    cardId: { fontSize: 15, fontWeight: '700', color: '#1E293B', fontFamily: theme.typography.fontFamily.bold },
    cardCustomer: { fontSize: 13, color: '#64748B', fontFamily: theme.typography.fontFamily.regular },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, fontFamily: theme.typography.fontFamily.bold },
    cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardDate: { fontSize: 13, color: '#94A3B8', fontFamily: theme.typography.fontFamily.regular },
    cardTotal: {
        marginLeft: 'auto',
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    emptyBox: { alignItems: 'center', paddingTop: 80, gap: 10 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.bold },
    emptySubText: { fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
});
