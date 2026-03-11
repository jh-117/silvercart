import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { CartProvider, useCart, CartItem } from '../contexts/CartContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
}));

// Mock productService
jest.mock('../services/productService', () => ({
    getProductById: jest.fn().mockResolvedValue(null),
}));

const mockProduct = {
    id: 'p001',
    name: 'Paracetamol 500mg',
    price: 5.90,
    category: 'pharmacy',
    image_url: '',
    description: '',
    in_stock: true,
    stock_quantity: 100,
    unit: 'box',
    brand: 'PharmaCorp',
};

let capturedCart: ReturnType<typeof useCart> | null = null;

function TestConsumer() {
    capturedCart = useCart();
    return (
        <>
            <Text testID="item-count">{capturedCart.itemCount}</Text>
            <Text testID="loading">{capturedCart.loading ? 'loading' : 'ready'}</Text>
        </>
    );
}

describe('CartContext', () => {
    beforeEach(() => {
        capturedCart = null;
    });

    it('should start with an empty cart after loading completes', async () => {
        const { getByTestId } = render(
            <CartProvider>
                <TestConsumer />
            </CartProvider>
        );

        // Wait for loading to complete
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));

        expect(getByTestId('item-count').props.children).toBe(0);
    });

    it('should add items via addCustomItem without requiring a database lookup', async () => {
        const { getByTestId } = render(
            <CartProvider>
                <TestConsumer />
            </CartProvider>
        );

        // Wait for the cart to finish loading its initial state from AsyncStorage
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('ready'));
        expect(getByTestId('item-count').props.children).toBe(0);

        const item: CartItem = { product: mockProduct as any, quantity: 3 };
        await act(async () => {
            await capturedCart!.addCustomItem(item);
        });

        expect(getByTestId('item-count').props.children).toBe(3);
    });
});
