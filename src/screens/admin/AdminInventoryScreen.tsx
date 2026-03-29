import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { getAllProducts, deleteProduct, Product } from '../../services/productService';
import { supabase } from '../../services/supabase';

export default function AdminInventoryScreen() {
    const navigation = useNavigation<any>();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'pharmacy' | 'grocery'>('all');

    const loadProducts = async () => {
        try {
            const data = await getAllProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadProducts();
        });
        loadProducts();
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        loadProducts();
    };

    const handleLogout = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Product', `Are you sure you want to delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await deleteProduct(id);
                        await loadProducts();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete product.');
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'all' || p.category.toLowerCase() === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [products, searchQuery, activeFilter]);

    const totalValue = useMemo(() => products.reduce((sum, p) => sum + (p.price || 0), 0), [products]);
    const lowStockCount = useMemo(() => products.filter(p => p.stock_status === 'out_of_stock').length, [products]);

    const renderHeader = () => (
        <View>
            <View style={styles.topAppBar}>
                <View style={styles.topAppLeft}>
                    <View style={styles.iconCircle}>
                        <MaterialIcons name="inventory-2" size={20} color={theme.colors.primary} />
                    </View>
                    <View>
                        <Text style={styles.topAppTitle}>Inventory</Text>
                        <Text style={styles.topAppSubtitle}>SILVERCART ADMIN</Text>
                    </View>
                </View>
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color="#DC2626" />
                </Pressable>
            </View>

            <View style={styles.headerSection}>
                <Text style={styles.sectionTitle}>Product Management</Text>
                <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AdminProductEditor')}>
                    <MaterialIcons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.addBtnText}>Add New</Text>
                </Pressable>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <MaterialIcons name="search" size={24} color="#648487" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#648487"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                <Pressable
                    style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setActiveFilter('all')}
                >
                    <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>All Products</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, activeFilter === 'pharmacy' && styles.filterChipActive]}
                    onPress={() => setActiveFilter('pharmacy')}
                >
                    <MaterialIcons name="medical-services" size={18} color={activeFilter === 'pharmacy' ? '#FFFFFF' : '#111717'} style={styles.filterIcon} />
                    <Text style={[styles.filterText, activeFilter === 'pharmacy' && styles.filterTextActive]}>Pharmacy</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, activeFilter === 'grocery' && styles.filterChipActive]}
                    onPress={() => setActiveFilter('grocery')}
                >
                    <MaterialIcons name="local-grocery-store" size={18} color={activeFilter === 'grocery' ? '#FFFFFF' : '#111717'} style={styles.filterIcon} />
                    <Text style={[styles.filterText, activeFilter === 'grocery' && styles.filterTextActive]}>Grocery</Text>
                </Pressable>
            </ScrollView>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>TOTAL VALUE</Text>
                    <Text style={styles.statValuePrimary}>RM {totalValue.toFixed(2)}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>OUT OF STOCK</Text>
                    <Text style={styles.statValueAlert}>{lowStockCount} Items</Text>
                </View>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: Product }) => {
        const isOutOfStock = item.stock_status === 'out_of_stock';

        return (
            <View style={styles.card}>
                <View style={styles.cardImageContainer}>
                    <Image source={{ uri: item.image_url || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                    </View>

                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, isOutOfStock ? styles.statusDotOut : styles.statusDotIn]} />
                        <Text style={[styles.statusText, isOutOfStock ? styles.statusTextOut : styles.statusTextIn]}>
                            {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
                        </Text>
                        <Text style={styles.statusDotSeparator}>•</Text>
                        <Text style={styles.categoryText}>{item.category || 'Uncategorized'}</Text>
                    </View>

                    <View style={styles.cardBottomRow}>
                        <Text style={styles.priceText}>RM {item.price.toFixed(2)}</Text>
                        <View style={styles.cardActionGroup}>
                            <Pressable
                                style={styles.editBtn}
                                onPress={() => navigation.navigate('AdminProductEditor', { product: item })}
                            >
                                <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                            </Pressable>
                            <Pressable
                                style={styles.deleteBtn}
                                onPress={() => handleDelete(item.id, item.name)}
                            >
                                <MaterialIcons name="delete" size={16} color="#DC2626" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>

                {loading && !refreshing ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyBox}>
                                <Text style={styles.emptyText}>No products found.</Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Top App Bar
    topAppBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    topAppLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topAppTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111717',
        letterSpacing: -0.5,
    },
    topAppSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    logoutBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Header Section
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111717' },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // Search
    searchContainer: { paddingHorizontal: 16, paddingVertical: 12 },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        height: 48,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111717',
    },

    // Filters
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterIcon: { marginRight: 8 },
    filterText: { fontSize: 14, fontWeight: '600', color: '#111717' },
    filterTextActive: { color: '#FFFFFF', fontWeight: '700' },

    // Stats
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statLabel: { fontSize: 12, fontWeight: '700', color: '#648487', letterSpacing: 0.5 },
    statValuePrimary: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, marginTop: 4 },
    statValueAlert: { fontSize: 20, fontWeight: '800', color: '#F97316', marginTop: 4 },

    // List
    listContent: { paddingBottom: 40 },
    emptyBox: { padding: 40, alignItems: 'center' },
    emptyText: { fontSize: 16, color: '#648487' },

    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        gap: 16,
    },
    cardImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
    },
    cardImage: { width: '100%', height: '100%' },
    cardContent: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
    cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: '#111717', flex: 1, marginRight: 8 },

    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: -4 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusDotIn: { backgroundColor: '#10B981' },
    statusDotOut: { backgroundColor: '#F97316' },
    statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    statusTextIn: { color: '#059669' },
    statusTextOut: { color: '#C2410C' },
    statusDotSeparator: { color: '#D1D5DB', marginHorizontal: 6, fontSize: 12 },
    categoryText: { fontSize: 12, fontWeight: '500', color: '#6B7280', textTransform: 'capitalize' },

    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 },
    priceText: { fontSize: 18, fontWeight: '800', color: '#111717' },
    cardActionGroup: { flexDirection: 'row', gap: 8 },
    editBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: `${theme.colors.primary}1A`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
