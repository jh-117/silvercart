import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, getProductById } from '../services/productService';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
    loading: boolean;
    error: string | null;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = '@silvercart_cart';
const DELIVERY_FEE = 5.00;

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load cart from storage on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to storage whenever it changes
    useEffect(() => {
        if (!loading) {
            saveCart();
        }
    }, [items]);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);

            if (cartData) {
                const parsedCart: CartItem[] = JSON.parse(cartData);
                // Re-hydrate products from db to ensure we have latest info
                const hydratedItems = await Promise.all(
                    parsedCart.map(async (item) => {
                        const product = await getProductById(item.product.id);
                        if (product) {
                            return { product, quantity: item.quantity };
                        }
                        return null;
                    })
                );

                const rehydratedCart = hydratedItems.filter((item): item is CartItem => item !== null);

                setItems(rehydratedCart);
            }
        } catch (err) {
            console.error('Error loading cart:', err);
            setError('Failed to load cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch (err) {
            console.error('Error saving cart:', err);
            setError('Failed to save cart changes.');
        }
    };

    const addItem = async (productId: string, quantity: number = 1) => {
        try {
            setError(null);
            const product = await getProductById(productId);

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.stock_status !== 'in_stock') {
                throw new Error('Product is out of stock');
            }

            if (quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            setItems(prevItems => {
                const existingItemIndex = prevItems.findIndex(
                    item => item.product.id === productId
                );

                if (existingItemIndex !== -1) {
                    // Update quantity if item already exists
                    const updatedItems = [...prevItems];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity + quantity
                    };
                    return updatedItems;
                } else {
                    // Add new item
                    return [...prevItems, { product, quantity }];
                }
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add item to cart';
            setError(message);
            throw new Error(message);
        }
    };

    const removeItem = async (productId: string) => {
        try {
            setError(null);
            setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        } catch (err) {
            const message = 'Failed to remove item from cart';
            setError(message);
            throw new Error(message);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            setError(null);

            if (quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            setItems(prevItems => {
                const itemIndex = prevItems.findIndex(item => item.product.id === productId);

                if (itemIndex === -1) {
                    throw new Error('Item not found in cart');
                }

                const updatedItems = [...prevItems];
                updatedItems[itemIndex] = {
                    ...updatedItems[itemIndex],
                    quantity
                };
                return updatedItems;
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update quantity';
            setError(message);
            throw new Error(message);
        }
    };

    const clearCart = async () => {
        try {
            setError(null);
            setItems([]);
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
        } catch (err) {
            const message = 'Failed to clear cart';
            setError(message);
            throw new Error(message);
        }
    };

    // Computed values
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    const value: CartContextType = {
        items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        loading,
        error,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
