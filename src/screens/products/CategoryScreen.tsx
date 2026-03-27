import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import SearchBar from '../../components/common/SearchBar';
import { useToast } from '../../contexts/ToastProvider';
import { useCart } from '../../contexts/CartContext';
import { getProductCatalog, Product } from '../../services/productService';


export default function CategoryScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { category } = route.params as { category: string } || { category: 'All Products' };

    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const { showSuccess } = useToast();
    const { addItem } = useCart();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProductCatalog();
            setAllProducts(data);
        } catch (error) {
            console.error('Error loading category products', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const filteredProducts = allProducts.filter(p => {
        const matchesCategory = category === 'All Products' || p.category.toLowerCase() === category.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const renderProduct = ({ item }: { item: Product }) => (
        <Pressable
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetails' as any, {
                productId: item.id,
                productName: item.name,
                price: `RM ${item.price.toFixed(2)}`,
                image: item.image_url,
                description: item.description,
                brand: 'SilverCare',
                rating: 4.5,
                reviews: Math.floor(Math.random() * 200) + 50,
                inStock: item.stock_status === 'in_stock',
                category: item.category,
            })}
        >
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>RM {item.price.toFixed(2)}</Text>
                <Pressable
                    style={styles.addButton}
                    onPress={async (e) => {
                        e.stopPropagation();
                        try {
                            await addItem(item.id, 1);
                        } catch (_) { }
                        showSuccess(`${item.name} added to cart!`);
                    }}
                >
                    <Text style={styles.addButtonText}>Add</Text>
                </Pressable>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={28} color={theme.colors.textMain} />
                </Pressable>
                <Text style={styles.headerTitle}>{category}</Text>
                <View style={{ width: 48 }} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={`Search in ${category}...`}
                />
            </View>

            {/* Product List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.columnWrapper}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="inventory-2" size={64} color={theme.colors.textMuted} />
                            <Text style={styles.emptyText}>No products found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F4F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.white,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
        textTransform: 'capitalize',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    listContent: {
        padding: 16,
        paddingBottom: 24,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    productCard: {
        width: '48%',
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    productImage: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
        backgroundColor: '#F3F4F6',
    },
    productInfo: {
        padding: 12,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 4,
        height: 40, // Fixed height for 2 lines
        fontFamily: theme.typography.fontFamily.bold,
    },
    productPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.bold,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: theme.colors.white,
        fontWeight: '700',
        fontSize: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        color: theme.colors.textMuted,
        marginTop: 16,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
