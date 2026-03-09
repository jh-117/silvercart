import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
    SupabaseOrder,
    getMyOrders,
    placeOrder as placeSupabaseOrder,
    getOrderById as fetchOrderById,
    updateOrderStatus
} from '../services/orders.service';
import { useCart } from './CartContext';
import { useAuth } from '../hooks/useAuth';

interface OrderContextType {
    orders: SupabaseOrder[];
    loading: boolean;
    error: string | null;
    placeOrder: (deliveryAddress: string, paymentMethod: 'cod' | 'card' | 'ewallet') => Promise<SupabaseOrder>;
    cancelOrder: (orderId: string, reason?: string) => Promise<void>;
    getOrderById: (orderId: string) => SupabaseOrder | undefined;
    getUserOrders: () => SupabaseOrder[];
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<SupabaseOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { items: cartItems, clearCart, subtotal, deliveryFee, total } = useCart();
    const { user } = useAuth();

    // Fetch user orders when user context mounts
    useEffect(() => {
        if (user) {
            refreshOrders();
        } else {
            setOrders([]);
        }
    }, [user]);

    const refreshOrders = async () => {
        if (!user) return;
        setLoading(true);
        const userOrders = await getMyOrders(user.id);
        setOrders(userOrders);
        setLoading(false);
    };

    const placeOrder = async (
        deliveryAddress: string,
        paymentMethod: 'cod' | 'card' | 'ewallet'
    ): Promise<SupabaseOrder> => {
        try {
            setLoading(true);
            setError(null);

            if (!user) throw new Error('You must be logged in to place an order');
            if (cartItems.length === 0) throw new Error('Your cart is empty');
            if (!deliveryAddress || deliveryAddress.trim() === '') throw new Error('Delivery address is required');

            const payloadItems = cartItems.map(item => ({
                productName: item.product.name,
                productImage: item.product.image_url,
                quantity: item.quantity,
                price: item.product.price
            }));

            const { success, orderId, error: orderError } = await placeSupabaseOrder({
                user_id: user.id,
                items: payloadItems,
                subtotal,
                delivery_fee: deliveryFee,
                total,
                status: 'pending',
                payment_method: paymentMethod,
                delivery_address: deliveryAddress
            });

            if (!success || !orderId) {
                throw new Error(orderError || 'Failed to generate order ID');
            }

            const newlyCreatedOrder = await fetchOrderById(orderId);

            if (newlyCreatedOrder) {
                setOrders(prev => [newlyCreatedOrder, ...prev]);
            }

            await clearCart();

            // Assume it works and return dummy or newly fetched
            return newlyCreatedOrder!;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to place order';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: string, reason?: string) => {
        try {
            setLoading(true);
            setError(null);

            const order = getOrderById(orderId);
            if (!order) throw new Error("Order not found");

            if (order.status !== 'pending') {
                throw new Error("Only pending orders can be cancelled");
            }

            const { success, error: updateError } = await updateOrderStatus(orderId, 'cancelled');

            if (!success) {
                throw new Error(updateError);
            }

            await refreshOrders();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel order';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const getOrderById = (orderId: string): SupabaseOrder | undefined => {
        return orders.find(order => order.id === orderId);
    };

    const getUserOrders = (): SupabaseOrder[] => {
        return orders; // Filtered by user context above in the query
    };

    const value: OrderContextType = {
        orders,
        loading,
        error,
        placeOrder,
        cancelOrder,
        getOrderById,
        getUserOrders,
        refreshOrders,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};

