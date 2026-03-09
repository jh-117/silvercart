import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, ScrollView,
    Image, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { placeOrder } from '../../services/orders.service';

export default function CheckoutReviewScreen() {
    const navigation = useNavigation<any>();
    const { items, subtotal, deliveryFee, total, clearCart } = useCart();
    const { user } = useAuth();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [placing, setPlacing] = useState(false);

    const handlePlaceOrder = async () => {
        if (!isConfirmed || placing) return;
        if (!user) {
            Alert.alert('Error', 'You must be logged in to place an order.');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
            return;
        }

        setPlacing(true);
        try {

            const result = await placeOrder({
                user_id: user.id,
                items: items.map(ci => ({
                    productId: ci.product.id,
                    productName: ci.product.name,
                    productImage: ci.product.image_url,
                    quantity: ci.quantity,
                    price: ci.product.price,
                })),
                subtotal,
                delivery_fee: deliveryFee,
                total,
                status: 'pending',
                payment_method: 'card',
                delivery_address: '123 Elderly Care Lane, Section 5, Petaling Jaya, 46000 Selangor',
            });

            if (result.success && result.orderId) {
                await clearCart();
                navigation.navigate('OrderSuccess', { orderId: result.orderId });
            } else {
                Alert.alert('Order Failed', result.error ?? 'Failed to place order. Please try again.');
            }
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Something went wrong.');
        } finally {
            setPlacing(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Final Review</Text>
                </View>
                <View style={styles.progressDots}>
                    <View style={[styles.progressDot, styles.progressDotCompleted]} />
                    <View style={[styles.progressDot, styles.progressDotCompleted]} />
                    <View style={[styles.progressDot, styles.progressDotActive]} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.headline}>Review Your Order</Text>
                <Text style={styles.subheadline}>Please double-check your details below before placing the order.</Text>

                {/* Shipping Section */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <MaterialIcons name="local-shipping" size={24} color={theme.colors.primary} />
                            <Text style={styles.cardTitle}>Shipping To</Text>
                        </View>
                        <Pressable style={styles.editButton} onPress={() => navigation.navigate('CheckoutAddress')}>
                            <Text style={styles.editButtonText}>EDIT</Text>
                        </Pressable>
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardName}>{user?.user_metadata?.full_name ?? 'Customer'}</Text>
                        <Text style={styles.cardAddress}>
                            123 Elderly Care Lane, Section 5,{'\n'}Petaling Jaya, 46000 Selangor
                        </Text>
                    </View>
                </View>

                {/* Payment Section */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardHeaderLeft}>
                            <MaterialIcons name="payments" size={24} color={theme.colors.primary} />
                            <Text style={styles.cardTitle}>Payment Method</Text>
                        </View>
                        <Pressable style={styles.editButton} onPress={() => navigation.navigate('CheckoutPayment')}>
                            <Text style={styles.editButtonText}>EDIT</Text>
                        </Pressable>
                    </View>
                    <View style={styles.cardContent}>
                        <View style={styles.paymentRow}>
                            <View style={styles.paymentIcon}>
                                <MaterialIcons name="credit-card" size={30} color={theme.colors.textPrimary} />
                            </View>
                            <View>
                                <Text style={styles.cardName}>Visa ending in 4242</Text>
                                <Text style={styles.cardExpiry}>Expires 12/26</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Order Items — real cart */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeaderSingle}>
                        <MaterialIcons name="shopping-basket" size={24} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Items Summary ({items.length})</Text>
                    </View>
                    {items.length === 0 ? (
                        <Text style={styles.emptyCart}>Your cart is empty.</Text>
                    ) : (
                        items.map((ci, index) => (
                            <View
                                key={ci.product.id}
                                style={[styles.itemRow, index < items.length - 1 && styles.itemRowBorder]}
                            >
                                {ci.product.image_url ? (
                                    <Image source={{ uri: ci.product.image_url }} style={styles.itemImageView} />
                                ) : (
                                    <View style={styles.itemImagePlaceholder} />
                                )}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{ci.product.name}</Text>
                                    <Text style={styles.itemVariant}>Qty: {ci.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>RM {(ci.product.price * ci.quantity).toFixed(2)}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* Price Breakdown */}
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>RM {subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.priceRow, styles.priceRowBorder]}>
                        <Text style={styles.priceLabel}>Shipping Fee</Text>
                        <Text style={styles.priceValue}>RM {deliveryFee.toFixed(2)}</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.totalLabel}>TOTAL</Text>
                        <Text style={styles.totalValue}>RM {total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Confirmation Checkbox */}
                <Pressable style={styles.checkboxContainer} onPress={() => setIsConfirmed(!isConfirmed)}>
                    <View style={[styles.checkbox, isConfirmed && styles.checkboxChecked]}>
                        {isConfirmed && <MaterialIcons name="check" size={20} color={theme.colors.white} />}
                    </View>
                    <Text style={styles.checkboxLabel}>I confirm this order is correct</Text>
                </Pressable>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.placeOrderButton,
                        (!isConfirmed || placing) && styles.placeOrderButtonDisabled,
                        pressed && styles.buttonPressed,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!isConfirmed || placing}
                >
                    {placing ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <>
                            <Text style={styles.placeOrderButtonText}>Place My Order</Text>
                            <MaterialIcons name="check-circle" size={24} color={theme.colors.white} />
                        </>
                    )}
                </Pressable>
                <Text style={styles.securityText}>Secure 256-bit encrypted checkout</Text>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    backButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        paddingRight: 48,
    },
    progressDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingVertical: 24,
    },
    progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#e0e0e0' },
    progressDotActive: {
        backgroundColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 3,
    },
    progressDotCompleted: { backgroundColor: theme.colors.primary },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
    headline: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 8,
    },
    subheadline: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardHeaderSingle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    editButton: {
        backgroundColor: `${theme.colors.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1,
    },
    cardContent: { gap: 4 },
    cardName: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
        marginBottom: 4,
    },
    cardAddress: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
    },
    cardExpiry: { fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCart: { textAlign: 'center', color: theme.colors.textMuted, paddingVertical: 16, fontFamily: theme.typography.fontFamily.regular },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12 },
    itemRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
    itemImageView: { width: 64, height: 64, borderRadius: 12, resizeMode: 'cover' },
    itemImagePlaceholder: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#E0E0E0' },
    itemInfo: { flex: 1 },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    priceCard: {
        backgroundColor: `${theme.colors.primary}05`,
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    priceRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: `${theme.colors.primary}10`,
        paddingBottom: 16,
        marginBottom: 8,
    },
    priceLabel: { fontSize: 18, fontWeight: '500', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.medium },
    priceValue: { fontSize: 18, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular },
    totalLabel: {
        fontSize: 20, fontWeight: 'bold', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold, letterSpacing: 1.5,
    },
    totalValue: {
        fontSize: 32, fontWeight: 'bold', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    checkbox: {
        width: 32, height: 32, borderRadius: 8,
        borderWidth: 2, borderColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: theme.colors.primary },
    checkboxLabel: {
        fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    footer: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingHorizontal: 16,
        paddingTop: 24,
        alignItems: 'center',
    },
    placeOrderButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 20,
        borderRadius: 20,
        width: '100%',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 16,
        minHeight: 60,
    },
    placeOrderButtonDisabled: { backgroundColor: theme.colors.borderLight, shadowOpacity: 0 },
    buttonPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
    placeOrderButtonText: {
        fontSize: 20, fontWeight: 'bold', color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    securityText: {
        fontSize: 14, color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center', marginTop: 8,
    },
});
