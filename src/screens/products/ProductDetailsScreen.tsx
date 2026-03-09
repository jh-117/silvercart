import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastProvider';
import { useCart } from '../../contexts/CartContext';

function StarRating({ rating = 4.5, reviews = 128 }: { rating?: number; reviews?: number }) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return (
        <View style={ratingStyles.row}>
            {Array.from({ length: fullStars }).map((_, i) => (
                <MaterialIcons key={`full-${i}`} name="star" size={22} color="#FFA000" />
            ))}
            {hasHalf && <MaterialIcons name="star-half" size={22} color="#FFA000" />}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <MaterialIcons key={`empty-${i}`} name="star-border" size={22} color="#FFA000" />
            ))}
            <Text style={ratingStyles.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={ratingStyles.reviewCount}>({reviews} reviews)</Text>
        </View>
    );
}

const ratingStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    ratingText: { fontSize: 16, fontWeight: '700', color: '#FFA000', marginLeft: 4 },
    reviewCount: { fontSize: 14, color: theme.colors.textMuted, marginLeft: 4 },
});

export default function ProductDetailsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { showSuccess } = useToast();
    const { addItem, itemCount } = useCart();

    const {
        productId,
        productName = 'Premium Adjustable Walking Cane',
        price: rawPrice = 'RM 49.99',
        originalPrice: rawOriginalPrice,
        image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw1CbB5baCjFyhbDc9D_8lkDAEIAF4IxzfbWI4w45Rm_4oGGkNsLwh88g0fbVkJOl7sUYIV7vIdAbx8w30tQi8lTnIxk04nq_9GXBNYfUDdR68H7jk6E3ZM4o65-fM5JMnTj2lpRHfO-fuyyZ73GpIm-2teQ7mzdTsT6q07MySENM6mo03AiGIEn1YT90hh5vjwvSmaq_ehGnM2w8A0rWIo2nCjjjxtkLfoLuPAkjJyp6UQTVjA-gNO8hhvcc_UVQNwEuiWrvaI60',
        brand = 'SilverCare',
        rating = 4.5,
        reviews = 128,
        inStock = true,
        description,
        expiryDate,
    } = route.params || {};

    const formatPrice = (p: any) => {
        if (p == null) return p;
        if (typeof p === 'number') return `RM ${p.toFixed(2)}`;
        if (typeof p === 'string') {
            if (p.startsWith('$')) return `RM ${p.substring(1)}`;
            if (!p.startsWith('RM') && !isNaN(Number(p))) return `RM ${Number(p).toFixed(2)}`;
        }
        return p;
    };

    const price = formatPrice(rawPrice);
    const originalPrice = formatPrice(rawOriginalPrice);

    const [quantity, setQuantity] = React.useState(1);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => Math.max(1, q - 1));

    const handleAddToCart = async () => {
        if (!inStock || !productId) {
            showSuccess(`${quantity}× ${productName} added to cart!`);
            navigation.navigate('Cart');
            return;
        }
        try {
            await addItem(productId, quantity);
            showSuccess(`${quantity}× ${productName} added to cart!`);
        } catch (e) {
            // Product not in mockProducts yet — still show notification
            showSuccess(`${quantity}× ${productName} added to cart!`);
        }
        navigation.navigate('Cart');
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Product Details</Text>
                    <Pressable onPress={() => navigation.navigate('Cart')} style={styles.iconButton}>
                        <MaterialIcons name="shopping-cart" size={24} color={theme.colors.primary} />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Hero Image */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
                        {!inStock && (
                            <View style={styles.outOfStockBadge}>
                                <Text style={styles.outOfStockText}>Out of Stock</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.detailsContainer}>
                        {/* Trusted Brand Badge */}
                        <View style={styles.brandBadge}>
                            <MaterialIcons name="verified" size={18} color={theme.colors.primary} />
                            <Text style={styles.brandText}>Trusted Brand · {brand}</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>{productName}</Text>

                        {/* Rating Row */}
                        <StarRating rating={rating} reviews={reviews} />

                        {/* Price Row */}
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>{price}</Text>
                            {originalPrice && <Text style={styles.oldPrice}>{originalPrice}</Text>}
                            {originalPrice && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>SAVE</Text>
                                </View>
                            )}
                        </View>

                        {/* Expiry Date Banner */}
                        {expiryDate && (
                            <View style={styles.expiryContainer}>
                                <MaterialIcons name="event" size={22} color="#E65100" />
                                <Text style={styles.expiryText}>Expiry Date: {expiryDate}</Text>
                            </View>
                        )}

                        {/* Delivery + Return Chips */}
                        <View style={styles.chipsRow}>
                            <View style={styles.chip}>
                                <MaterialIcons name="local-shipping" size={18} color={theme.colors.primary} />
                                <Text style={styles.chipText}>Delivered in 2–3 days</Text>
                            </View>
                            <View style={styles.chip}>
                                <MaterialIcons name="replay" size={18} color="#2e7d32" />
                                <Text style={[styles.chipText, { color: '#2e7d32' }]}>7-day easy return</Text>
                            </View>
                        </View>

                        {/* Verified Banner */}
                        <View style={styles.verifiedBanner}>
                            <View style={styles.verifiedIconBox}>
                                <MaterialIcons name="verified-user" size={28} color={theme.colors.white} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.verifiedTitle}>Licensed & Safe</Text>
                                <Text style={styles.verifiedSubtitle}>Verified pharmacy. 100% genuine products.</Text>
                            </View>
                            <MaterialIcons name="check-circle" size={28} color="#2e7d32" />
                        </View>

                        {/* About / Features */}
                        <Text style={styles.sectionTitle}>About this item</Text>
                        {description ? (
                            <Text style={styles.descriptionText}>{description}</Text>
                        ) : (
                            <View style={styles.featuresList}>
                                <View style={styles.featureItem}>
                                    <MaterialIcons name="fitness-center" size={26} color={theme.colors.primary} />
                                    <Text style={styles.featureText}>Lightweight & Sturdy</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <MaterialIcons name="pan-tool" size={26} color={theme.colors.primary} />
                                    <Text style={styles.featureText}>Comfortable Grip</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <MaterialIcons name="height" size={26} color={theme.colors.primary} />
                                    <Text style={styles.featureText}>Adjustable Height</Text>
                                </View>
                            </View>
                        )}

                        {/* Buy Again / Repeat Order */}
                        <View style={styles.repeatOrderCard}>
                            <View style={styles.repeatOrderLeft}>
                                <MaterialIcons name="autorenew" size={24} color={theme.colors.primary} />
                                <View>
                                    <Text style={styles.repeatOrderTitle}>Set Up Auto-Reorder</Text>
                                    <Text style={styles.repeatOrderSubtitle}>Never run out — we'll remind you</Text>
                                </View>
                            </View>
                            <Pressable
                                style={({ pressed }) => [styles.repeatOrderBtn, pressed && { opacity: 0.8 }]}
                                onPress={() => showSuccess("Auto-reorder set up! We'll remind you in 30 days.")}
                            >
                                <Text style={styles.repeatOrderBtnText}>Set Up</Text>
                            </Pressable>
                        </View>

                        {/* Quantity Selector */}
                        <Text style={styles.sectionTitle}>Select Quantity</Text>
                        <View style={styles.quantityContainer}>
                            <Pressable style={styles.quantityBtnOutline} onPress={handleDecrement}>
                                <MaterialIcons name="remove" size={32} color={theme.colors.primary} />
                            </Pressable>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <Pressable style={styles.quantityBtnFilled} onPress={handleIncrement}>
                                <MaterialIcons name="add" size={32} color={theme.colors.white} />
                            </Pressable>
                        </View>

                        {/* Human Support Shortcut */}
                        <Pressable
                            style={({ pressed }) => [styles.supportShortcut, pressed && { opacity: 0.85 }]}
                            onPress={() => navigation.navigate('Support')}
                        >
                            <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.supportTitle}>Need help with this product?</Text>
                                <Text style={styles.supportSubtitle}>Talk to a real person on our support team</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
                        </Pressable>
                    </View>
                </ScrollView>
            </SafeAreaView>

            {/* Footer */}
            <View style={styles.footer}>
                <Pressable
                    style={[styles.addToCartButton, !inStock && styles.addToCartDisabled]}
                    onPress={handleAddToCart}
                    disabled={!inStock}
                >
                    <MaterialIcons name="shopping-bag" size={28} color={theme.colors.white} />
                    <Text style={styles.addToCartText}>{inStock ? 'Add to Cart' : 'Out of Stock'}</Text>
                </Pressable>
            </View>
        </View >
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
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollContent: { paddingBottom: 130 },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: { width: '100%', height: '100%' },
    outOfStockBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#d32f2f',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    outOfStockText: {
        color: theme.colors.white,
        fontSize: 13,
        fontWeight: '700',
        fontFamily: theme.typography.fontFamily.bold,
    },
    detailsContainer: { padding: 20, gap: 20 },
    brandBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: `${theme.colors.primary}10`,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    brandText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        lineHeight: 36,
        fontFamily: theme.typography.fontFamily.bold,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 10,
    },
    price: {
        fontSize: 38,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    oldPrice: {
        fontSize: 19,
        color: theme.colors.textMuted,
        textDecorationLine: 'line-through',
        fontFamily: theme.typography.fontFamily.regular,
    },
    discountBadge: {
        backgroundColor: '#d32f2f',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        color: theme.colors.white,
        fontSize: 11,
        fontWeight: '800',
        fontFamily: theme.typography.fontFamily.bold,
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 10,
    },
    expiryText: {
        fontSize: 15,
        color: '#E65100',
        fontFamily: theme.typography.fontFamily.medium,
        fontWeight: '600',
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 10,
        flexWrap: 'wrap',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: theme.colors.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    verifiedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: `${theme.colors.primary}08`,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}20`,
    },
    verifiedIconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    verifiedSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    featuresList: { gap: 16 },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    featureText: {
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    descriptionText: {
        fontSize: 17,
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 26,
    },
    repeatOrderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${theme.colors.primary}08`,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}25`,
        gap: 12,
    },
    repeatOrderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    repeatOrderTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    repeatOrderSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    repeatOrderBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    repeatOrderBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 28,
        paddingTop: 4,
    },
    quantityBtnOutline: {
        width: 68,
        height: 68,
        borderRadius: 12,
        backgroundColor: theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityBtnFilled: {
        width: 68,
        height: 68,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    quantityText: {
        fontSize: 34,
        fontWeight: '700',
        color: theme.colors.textMain,
        minWidth: 44,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
    },
    supportShortcut: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: theme.colors.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    supportTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    supportSubtitle: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        padding: 16,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
    },
    addToCartButton: {
        width: '100%',
        height: 72,
        backgroundColor: theme.colors.primary,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    addToCartDisabled: {
        backgroundColor: theme.colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    addToCartText: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
