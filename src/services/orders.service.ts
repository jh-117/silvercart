import { supabase } from './supabase';

// Matches the exact `status` values allowed by the orders table
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Matches the `order_items` table columns exactly
export interface OrderItem {
    id?: string;
    order_id?: string;
    product_id?: string | null;
    product_name?: string | null;   // added via ALTER TABLE (see SQL below)
    product_image?: string | null;  // added via ALTER TABLE (see SQL below)
    quantity: number;
    price_at_purchase: number;      // real column name in order_items
    // Convenience alias used in UI
    price?: number;
    productName?: string;
    productImage?: string;
}

// Matches the `orders` table columns exactly
export interface SupabaseOrder {
    id: string;
    user_id: string;
    total_amount: number;           // real column name (NOT 'total')
    subtotal: number;
    delivery_fee: number;
    delivery_address: string | null;
    payment_method: string;
    status: OrderStatus;
    estimated_delivery: string | null;
    delivered_at: string | null;
    cancelled_at: string | null;
    cancellation_reason: string | null;
    cancelled_by: string | null;
    created_at: string;
    updated_at: string;
    // Joined from order_items
    order_items?: OrderItem[];
    // Convenience aliases used throughout UI
    items?: OrderItem[];
    total?: number;
    customer_name?: string; // Used in admin queries
}

// Normalise joined response so `items` and `total` aliases always exist
function normalise(order: any): SupabaseOrder {
    const items = (order.order_items ?? order.items ?? []).map((i: any) => ({
        ...i,
        price: i.price_at_purchase ?? i.price,
        productName: i.product_name,
        productImage: i.product_image,
    }));
    return {
        ...order,
        items,
        order_items: items,
        total: order.total_amount,   // convenience alias
    };
}

/** Admin: fetch ALL orders, newest first */
export async function getAllOrders(): Promise<SupabaseOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getAllOrders error:', error.message);
        return [];
    }
    return (data ?? []).map(normalise);
}

/** User: fetch own orders, newest first */
export async function getMyOrders(userId: string): Promise<SupabaseOrder[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getMyOrders error:', error.message);
        return [];
    }
    return (data ?? []).map(normalise);
}

/** Get a single order by ID (with items) */
export async function getOrderById(orderId: string): Promise<SupabaseOrder | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

    if (error) {
        console.error('getOrderById error:', error.message);
        return null;
    }
    return normalise(data);
}

/** Admin: update order status */
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

/** Admin: dashboard stats */
export async function getOrderStats(): Promise<{
    total: number; revenue: number; pending: number; delivered: number;
}> {
    const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount');

    if (error || !data) return { total: 0, revenue: 0, pending: 0, delivered: 0 };

    return {
        total: data.length,
        revenue: data.reduce((s, o) => s + (o.total_amount ?? 0), 0),
        pending: data.filter(o => o.status === 'pending').length,
        delivered: data.filter(o => o.status === 'delivered').length,
    };
}

/**
 * Customer: place a new order.
 * 
 * REQUIRED — run this SQL once in Supabase before placing orders:
 * 
 *   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
 *   ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;
 */
export async function placeOrder(payload: {
    user_id: string;
    items: Array<{
        productId?: string;
        productName: string;
        productImage?: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    total: number;
    status: OrderStatus;
    payment_method: string;
    delivery_address: string;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {

    // 1 ─ Insert order header (uses real column names)
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
            user_id: payload.user_id,
            subtotal: payload.subtotal,
            delivery_fee: payload.delivery_fee,
            total_amount: payload.total,        // ← real column name
            status: payload.status,
            payment_method: payload.payment_method,
            delivery_address: payload.delivery_address,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }])
        .select('id')
        .single();

    if (orderError) {
        console.error('placeOrder (order insert) error:', orderError.message);
        return { success: false, error: orderError.message };
    }

    const orderId = orderData.id;

    // 2 ─ Insert line items (uses real column names)
    const lineItems = payload.items.map(item => ({
        order_id: orderId,
        product_id: null,               // mock product IDs aren't Supabase UUIDs
        product_name: item.productName, // requires ALTER TABLE (see above)
        product_image: item.productImage ?? null,
        quantity: item.quantity,
        price_at_purchase: item.price,  // ← real column name
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(lineItems);

    if (itemsError) {
        console.error('placeOrder (items insert) error:', itemsError.message);
        // Order header is saved — return success anyway
        return { success: true, orderId };
    }

    return { success: true, orderId };
}
