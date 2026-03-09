import { supabase } from '../services/supabase';

export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    image_url: string;
    stock_status: string;
    search_keywords: string[];
}

/**
 * Get all products (in stock) for customers
 */
export async function getProductCatalog() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('stock_status', 'in_stock');

    if (error) {
        console.error('Error fetching product catalog:', error);
        return [];
    }
    return data || [];
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', id, error);
        return null;
    }
    return data;
}

/**
 * Search products by name
 */
export async function searchProducts(query: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,search_keywords.cs.{${query}}`)
        .eq('stock_status', 'in_stock')
        .limit(10);

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }
    return data || [];
}

/**
 * Get ALL products (for Admin Inventory view)
 */
export async function getAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all products:', error);
        return [];
    }
    return data || [];
}

export async function createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteProduct(id: string) {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}
