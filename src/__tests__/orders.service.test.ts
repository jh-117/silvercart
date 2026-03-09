/**
 * Unit Tests: orders.service.ts
 */

jest.mock('../services/supabase');

import {
    getAllOrders,
    getMyOrders,
    getOrderById,
    placeOrder,
    updateOrderStatus,
    getOrderStats,
} from '../services/orders.service';

import { mockFrom } from '../__mocks__/supabase';

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RAW_ORDER = {
    id: 'order-1',
    user_id: 'user-1',
    total_amount: 45.50,
    subtotal: 40.00,
    delivery_fee: 5.50,
    delivery_address: '123 Main St',
    payment_method: 'cash',
    status: 'pending',
    estimated_delivery: null,
    delivered_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    cancelled_by: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    order_items: [
        { id: 'item-1', order_id: 'order-1', product_name: 'Panadol', product_image: null, quantity: 2, price_at_purchase: 20.00 }
    ],
};

/** Build a mock query chain with a fixed resolved value */
function mockChain(resolvedValue: any) {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.limit = jest.fn().mockReturnValue(chain);
    chain.or = jest.fn().mockReturnValue(chain);
    chain.insert = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.single = jest.fn().mockResolvedValue(resolvedValue);
    chain.maybeSingle = jest.fn().mockResolvedValue(resolvedValue);
    // For queries that don't call .single(), the chain itself resolves
    chain.then = (resolve: any) => Promise.resolve(resolvedValue).then(resolve);
    return chain;
}

// ─── getAllOrders ──────────────────────────────────────────────────────────────

describe('getAllOrders', () => {
    it('returns normalised orders on success', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [RAW_ORDER], error: null }));
        const orders = await getAllOrders();
        expect(orders).toHaveLength(1);
        expect(orders[0].total).toBe(45.50); // normalised alias
        expect(orders[0].items![0].productName).toBe('Panadol');
    });

    it('returns empty array on DB error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'DB error' } }));
        const orders = await getAllOrders();
        expect(orders).toEqual([]);
    });
});

// ─── getMyOrders ──────────────────────────────────────────────────────────────

describe('getMyOrders', () => {
    it('returns orders for a specific user', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [RAW_ORDER], error: null }));
        const orders = await getMyOrders('user-1');
        expect(orders).toHaveLength(1);
        expect(orders[0].user_id).toBe('user-1');
    });

    it('returns empty array on DB error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'RLS error' } }));
        const orders = await getMyOrders('user-1');
        expect(orders).toEqual([]);
    });
});

// ─── getOrderById ─────────────────────────────────────────────────────────────

describe('getOrderById', () => {
    it('returns a normalised single order when found', async () => {
        const chain = mockChain({ data: RAW_ORDER, error: null });
        mockFrom.mockReturnValueOnce(chain);
        const order = await getOrderById('order-1');
        expect(order).not.toBeNull();
        expect(order!.id).toBe('order-1');
        expect(order!.total).toBe(45.50);
    });

    it('returns null when not found', async () => {
        const chain = mockChain({ data: null, error: { message: 'Not found', code: 'PGRST116' } });
        mockFrom.mockReturnValueOnce(chain);
        const order = await getOrderById('nonexistent');
        expect(order).toBeNull();
    });
});

// ─── placeOrder ───────────────────────────────────────────────────────────────

describe('placeOrder', () => {
    const PAYLOAD = {
        user_id: 'user-1',
        items: [{ productName: 'Panadol', productImage: null, quantity: 2, price: 20.00 }],
        subtotal: 40.00,
        delivery_fee: 5.50,
        total: 45.50,
        status: 'pending' as const,
        payment_method: 'cash',
        delivery_address: '123 Main St',
    };

    it('inserts order and items, returns success with orderId', async () => {
        // First call: insert order header → returns id
        const orderChain = mockChain({ data: { id: 'order-new' }, error: null });
        // Second call: insert line items → returns success
        const itemsChain = mockChain({ data: null, error: null });
        mockFrom
            .mockReturnValueOnce(orderChain)
            .mockReturnValueOnce(itemsChain);

        const result = await placeOrder(PAYLOAD);
        expect(result.success).toBe(true);
        expect(result.orderId).toBe('order-new');
    });

    it('returns failure if order header insert fails', async () => {
        const failChain = mockChain({ data: null, error: { message: 'Insert failed' } });
        mockFrom.mockReturnValueOnce(failChain);
        const result = await placeOrder(PAYLOAD);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Insert failed');
    });

    it('returns success even if items insert fails (order header is saved)', async () => {
        const orderChain = mockChain({ data: { id: 'order-new' }, error: null });
        const itemsFailChain = mockChain({ data: null, error: { message: 'Items failed' } });
        mockFrom
            .mockReturnValueOnce(orderChain)
            .mockReturnValueOnce(itemsFailChain);
        const result = await placeOrder(PAYLOAD);
        expect(result.success).toBe(true);
        expect(result.orderId).toBe('order-new');
    });
});

// ─── updateOrderStatus ────────────────────────────────────────────────────────

describe('updateOrderStatus', () => {
    it('returns success on valid update', async () => {
        const chain = mockChain({ error: null });
        mockFrom.mockReturnValueOnce(chain);
        const result = await updateOrderStatus('order-1', 'delivered');
        expect(result.success).toBe(true);
    });

    it('returns failure on DB error', async () => {
        const chain = mockChain({ error: { message: 'Permission denied' } });
        mockFrom.mockReturnValueOnce(chain);
        const result = await updateOrderStatus('order-1', 'delivered');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Permission denied');
    });
});

// ─── getOrderStats ────────────────────────────────────────────────────────────

describe('getOrderStats', () => {
    it('aggregates stats correctly', async () => {
        const rawData = [
            { status: 'pending', total_amount: 30 },
            { status: 'pending', total_amount: 20 },
            { status: 'delivered', total_amount: 50 },
        ];
        mockFrom.mockReturnValueOnce(mockChain({ data: rawData, error: null }));
        const stats = await getOrderStats();
        expect(stats.total).toBe(3);
        expect(stats.revenue).toBe(100);
        expect(stats.pending).toBe(2);
        expect(stats.delivered).toBe(1);
    });

    it('returns zeroed stats on DB error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'error' } }));
        const stats = await getOrderStats();
        expect(stats).toEqual({ total: 0, revenue: 0, pending: 0, delivered: 0 });
    });
});
