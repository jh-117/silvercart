import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';

export default function CartScreen() {
    const navigation = useNavigation<any>();
    const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();

    const handleUpdateQuantity = (productId: string, delta: number) => {
        const item = items.find(i => i.product.id === productId);
        if (!item) return;
        const newQty = item.quantity + delta;
        if (newQty < 1) {
            Alert.alert(
                'Remove Item',
                'Are you sure you want to remove this item from your cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeItem(productId),
                    },
                ]
            );
        } else {
            updateQuantity(productId, newQty);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable 
                        onPress={() => navigation.goBack()} 
                        style={styles.backButton}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                    </Pressable>
                    <Text style={styles.headerTitle}>My Cart</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {items.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="shopping-cart" size={80} color={theme.colors.borderLight} />
                            <Text style={styles.emptyTitle}>Your cart is empty</Text>
                            <Text style={styles.emptySubtitle}>Browse products and add items to get started.</Text>
                            <Pressable
                                style={styles.shopBtn}
                                onPress={() => navigation.goBack()}
                                accessibilityRole="button"
                                accessibilityLabel="Continue Shopping"
                            >
                                <Text style={styles.shopBtnText}>Continue Shopping</Text>
                            </Pressable>
                        </View>
                    ) : (
                        items.map(ci => (
                            <Pressable
                                key={ci.product.id}
                                style={({ pressed }) => [styles.cartItem, pressed && { opacity: 0.8 }]}
                                onPress={() => navigation.navigate('ProductDetails', {
                                    productId: ci.product.id,
                                    productName: ci.product.name,
                                    price: ci.product.price,
                                    image: ci.product.image_url,
                                    description: ci.product.description,
                                    category: ci.product.category,
                                })}
                                accessibilityRole="button"
                                accessibilityLabel={`View details for ${ci.product.name}`}
                            >
                                <View style={styles.itemHeader}>
                                    {ci.product.image_url ? (
                                        <Image source={{ uri: ci.product.image_url }} style={styles.itemImage} />
                                    ) : (
                                        <View style={[styles.itemImage, { backgroundColor: '#E0E0E0' }]} />
                                    )}
                                    <View style={styles.itemInfo}>
                                        <View>
                                            <Text style={styles.itemName} numberOfLines={2}>{ci.product.name}</Text>
                                            <Text style={styles.itemPrice}>RM {ci.product.price.toFixed(2)}</Text>
                                        </View>
                                        {ci.product.category && (
                                            <Text style={styles.itemVariant}>{ci.product.category}</Text>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.itemActions}>
                                    <Text style={styles.quantityLabel}>Quantity</Text>
                                    <View style={styles.quantityControls}>
                                        <Pressable
                                            style={styles.quantityBtnOutline}
                                            onPress={() => handleUpdateQuantity(ci.product.id, -1)}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Decrease quantity for ${ci.product.name}`}
                                        >
                                            <MaterialIcons name="remove" size={24} color={theme.colors.primary} />
                                        </Pressable>
                                        <Text style={styles.quantityText} accessibilityLabel={`Quantity ${ci.quantity}`}>{ci.quantity}</Text>
                                        <Pressable
                                            style={styles.quantityBtnFilled}
                                            onPress={() => handleUpdateQuantity(ci.product.id, 1)}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Increase quantity for ${ci.product.name}`}
                                        >
                                            <MaterialIcons name="add" size={24} color={theme.colors.white} />
                                        </Pressable>
                                    </View>
                                </View>
                            </Pressable>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Footer */}
            {items.length > 0 && (
                <View style={styles.footer}>
                    <View style={styles.priceBreakdown}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>RM {subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery</Text>
                            <Text style={styles.priceValue}>RM {deliveryFee.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Estimated Total</Text>
                        <Text style={styles.totalAmount}>RM {total.toFixed(2)}</Text>
                    </View>
                    <Pressable
                        style={({ pressed }) => [styles.checkoutButton, pressed && styles.checkoutButtonPressed]}
                        onPress={() => navigation.navigate('CheckoutAddress')}
                        accessibilityRole="button"
                        accessibilityLabel="Proceed to Checkout"
                    >
                        <MaterialIcons name="shopping-cart-checkout" size={28} color={theme.colors.white} />
                        <Text style={styles.checkoutText}>Checkout</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.eggshell ?? '#F9F8F2' },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: `${theme.colors.eggshell ?? '#F9F8F2'}E6`,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: theme.colors.white,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24, fontWeight: '700', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollContent: { padding: 16, paddingBottom: 260, gap: 24 },
    emptyState: { alignItems: 'center', paddingTop: 80, gap: 14 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.bold },
    emptySubtitle: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, textAlign: 'center' },
    shopBtn: {
        marginTop: 8,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 28, paddingVertical: 14,
        borderRadius: 14,
    },
    shopBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF', fontFamily: theme.typography.fontFamily.bold },
    cartItem: {
        backgroundColor: theme.colors.white,
        borderRadius: 16, padding: 20, gap: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
        borderWidth: 1, borderColor: theme.colors.borderLight,
    },
    itemHeader: { flexDirection: 'row', gap: 20 },
    itemImage: {
        width: 100, height: 100, borderRadius: 12,
        borderWidth: 1, borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.backgroundLight,
        resizeMode: 'cover',
    },
    itemInfo: { flex: 1, justifyContent: 'space-between', paddingVertical: 4 },
    itemName: {
        fontSize: 18, fontWeight: '600', color: theme.colors.charcoal ?? '#30363D',
        marginBottom: 4, fontFamily: theme.typography.fontFamily.bold, lineHeight: 24,
    },
    itemPrice: { fontSize: 20, fontWeight: '800', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    itemVariant: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium },
    itemActions: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 16,
    },
    quantityLabel: { fontSize: 18, fontWeight: '500', color: theme.colors.textMain, fontFamily: theme.typography.fontFamily.medium },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 24 },
    quantityBtnOutline: {
        width: 50, height: 50, borderRadius: 25,
        borderWidth: 2, borderColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.white,
    },
    quantityBtnFilled: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
    },
    quantityText: {
        fontSize: 24, fontWeight: '700', color: theme.colors.textMain,
        width: 32, textAlign: 'center', fontFamily: theme.typography.fontFamily.bold,
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: theme.colors.white,
        borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
        padding: 24, paddingBottom: 40,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
        gap: 12,
    },
    priceBreakdown: { gap: 6 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    priceLabel: { fontSize: 16, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    priceValue: { fontSize: 16, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular },
    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: theme.colors.borderLight, paddingTop: 10,
    },
    totalLabel: { fontSize: 20, fontWeight: '500', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium },
    totalAmount: { fontSize: 32, fontWeight: '800', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
    checkoutButton: {
        width: '100%', backgroundColor: theme.colors.primary,
        borderRadius: 16, paddingVertical: 20,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
        shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
    },
    checkoutButtonPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
    checkoutText: { fontSize: 24, fontWeight: '700', color: theme.colors.white, fontFamily: theme.typography.fontFamily.bold },
});
