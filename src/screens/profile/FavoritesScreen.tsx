import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { useFavorites } from '../../hooks/useFavorites';
import { getProductCatalog, Product } from '../../services/productService';

export default function FavoritesScreen() {
    const navigation = useNavigation<any>();
    const { favorites, loading: favoritesLoading, toggleFavorite } = useFavorites();
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loadingCatalog, setLoadingCatalog] = React.useState(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const catalog = await getProductCatalog();
                setProducts(catalog);
            } catch (error) {
                console.error('Failed to fetch catalog for favorites', error);
            } finally {
                setLoadingCatalog(false);
            }
        };
        fetchProducts();
    }, []);

    const favoriteProducts = products.filter(product => 
        favorites.includes(product.id)
    );

    const isLoading = favoritesLoading || loadingCatalog;

    const renderItem = ({ item }: { item: Product }) => (
        <Pressable 
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetails', { 
                productId: item.id,
                productName: item.name,
                price: item.price,
                image: item.image_url,
                brand: 'SilverCare Original',
                rating: 4.8,
                reviews: 124,
                inStock: item.stock_status === 'in_stock',
                description: item.description,
                category: item.category,
            })}
        >
            <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardInfo}>
                <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.price}>RM {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</Text>
            </View>
            <Pressable 
                style={styles.removeBtn}
                onPress={() => toggleFavorite(item.id)}
            >
                <MaterialIcons name="favorite" size={26} color="#e53e3e" />
            </Pressable>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>My Favorites</Text>
                    <View style={styles.iconButton} /> 
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : favorites.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="favorite-border" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
                        <Text style={styles.emptySubtitle}>Items you heart will appear here so you can easily reorder them.</Text>
                        <Pressable 
                            style={styles.shopBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.shopBtnText}>Start Shopping</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={favoriteProducts}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    iconButton: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    headerTitle: {
        fontSize: 20, fontWeight: '700', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    image: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
    cardInfo: { flex: 1 },
    brand: { fontSize: 13, color: theme.colors.primary, fontWeight: '600', marginBottom: 4, fontFamily: theme.typography.fontFamily.semibold },
    title: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 8, fontFamily: theme.typography.fontFamily.bold },
    price: { fontSize: 18, fontWeight: '700', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    removeBtn: { padding: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8, fontFamily: theme.typography.fontFamily.bold },
    emptySubtitle: { fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 32, fontFamily: theme.typography.fontFamily.regular },
    shopBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30,
    },
    shopBtnText: { color: theme.colors.white, fontSize: 18, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold }
});
