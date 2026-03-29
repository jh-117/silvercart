import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';

import { getProductCatalog, searchProducts, Product } from '../../services/productService';
import { supabase } from '../../services/supabase';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Pharmacy', 'Grocery'];

export default function SearchResultsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { category, query } = route.params || { category: 'All' };

    const normalizeCategory = React.useCallback((rawCategory?: string) => {
        if (!rawCategory) return 'All';
        const matched = categories.find(c => c.toLowerCase() === rawCategory.toLowerCase());
        return matched || 'All';
    }, []);

    const [selectedCategory, setSelectedCategory] = React.useState(normalizeCategory(category));
    const [products, setProducts] = React.useState<Product[]>([]);
    const [loading, setLoading] = React.useState(true);

    const loadProducts = async () => {
        setLoading(true);
        try {
            let data: Product[] = [];
            if (query) {
                // Perform a text search if query is provided
                data = await searchProducts(query);
            } else {
                data = await getProductCatalog();
            }
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadProducts();
            setSelectedCategory(normalizeCategory(category));
        }, [query, category, normalizeCategory])
    );

    const filteredProducts = React.useMemo(() => {
        if (selectedCategory === 'All') return products;
        return products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }, [products, selectedCategory]);

    const handleProductPress = (product: Product) => {
        navigation.navigate('ProductDetails', {
            productId: product.id,
            productName: product.name,
            price: `RM ${product.price.toFixed(2)}`,
            image: product.image_url,
            description: product.description,
            brand: 'SilverCare',
            rating: 4.5,
            reviews: Math.floor(Math.random() * 200) + 50,
            inStock: product.stock_status === 'in_stock',
            category: product.category,
        });
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.textMain} />
                    </Pressable>
                    <Text style={styles.headerTitle}>{selectedCategory}</Text>
                    <Pressable
                        style={styles.iconButton}
                        onPress={() => navigation.navigate('VoiceSearch')}
                    >
                        <MaterialIcons name="search" size={24} color={theme.colors.textMain} />
                    </Pressable>
                </View>

                {/* Sub-category Chips */}
                <View style={styles.chipsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
                        {categories.map((cat, index) => (
                            <Pressable
                                key={index}
                                style={[styles.chip, cat === selectedCategory && styles.activeChip]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.chipText, cat === selectedCategory && styles.activeChipText]}>{cat}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Product Grid */}
                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text>Loading products...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.gridContent}>
                        <View style={styles.grid}>
                            {filteredProducts.map((product) => (
                                <Pressable
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => handleProductPress(product)}
                                >
                                    <View style={styles.imageContainer}>
                                        <Image source={{ uri: product.image_url || 'https://via.placeholder.com/150' }} style={styles.productImage} />
                                        {product.stock_status === 'in_stock' && (
                                            <View style={styles.badge}>
                                                <View style={styles.badgeDot} />
                                                <Text style={styles.badgeText}>In Stock</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                        <Text style={styles.productPrice}>RM {product.price?.toFixed(2)}</Text>
                                        <View style={styles.addButton}>
                                            <MaterialIcons name="add-shopping-cart" size={20} color={theme.colors.white} />
                                            <Text style={styles.addButtonText}>Add</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                            {filteredProducts.length === 0 && (
                                <View style={{ width: '100%', alignItems: 'center', paddingVertical: 40 }}>
                                    <Text style={{ color: '#6B7280' }}>No products found.</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight || '#f9f9f9',
    },
    safeArea: {
        flex: 1,
    },
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
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
        flex: 1,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
    },
    chipsContainer: {
        paddingVertical: 16,
        backgroundColor: theme.colors.backgroundLight || '#f9f9f9',
    },
    chipsContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    chip: {
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    activeChip: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        elevation: 4,
    },
    chipText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    activeChipText: {
        color: theme.colors.white,
        fontWeight: '700',
    },
    gridContent: {
        padding: 16,
        paddingBottom: 40,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    productCard: {
        width: '47%', // roughly half minus gap
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        padding: 12,
        marginBottom: 8,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 12,
        marginBottom: 12,
        position: 'relative',
    },
    productImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.success || '#28A745',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.success || '#28A745',
        textTransform: 'uppercase',
        fontFamily: theme.typography.fontFamily.bold,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textMain,
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.medium,
        minHeight: 48, // 2 lines roughly
        lineHeight: 22,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 12,
        fontFamily: theme.typography.fontFamily.bold,
    },
    addButton: {
        width: '100%',
        height: 44,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
