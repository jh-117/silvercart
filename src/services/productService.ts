import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const CATALOG_CACHE_KEY = 'silvercart_product_catalog';

export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    image_url: string;
    stock_status: string;
    search_keywords: string[];
    show_on_storefront?: boolean;
    elderly_friendly?: boolean;
}

const STOPWORDS = new Set([
    'i', 'want', 'to', 'buy', 'add', 'please', 'the', 'a', 'an', 'for', 'my', 'cart',
]);

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function toTokens(value: string): string[] {
    return normalizeText(value)
        .split(' ')
        .filter(token => token.length >= 3 && !STOPWORDS.has(token));
}

function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    return dp[m][n];
}

function scoreProductForQuery(product: Product, rawQuery: string): number {
    const query = normalizeText(rawQuery);
    if (!query) return 0;

    const name = normalizeText(product.name || '');
    const keywords = (product.search_keywords || []).map(k => normalizeText(k));
    const haystack = [name, ...keywords].join(' ');
    const tokens = toTokens(query);

    if (haystack.includes(query)) return 100;

    let score = 0;
    for (const token of tokens) {
        if (haystack.includes(token)) {
            score += 30;
            continue;
        }

        const candidateWords = haystack.split(' ').filter(Boolean);
        const minDist = candidateWords.reduce((best, w) => Math.min(best, levenshtein(token, w)), 99);
        if (minDist <= 1) score += 20;
        else if (minDist === 2 && token.length >= 5) score += 10;
    }

    return score;
}

/**
 * Get all products (in stock) for customers
 */
export async function getProductCatalog(): Promise<Product[]> {
    // Try to load cached catalog immediately
    const cached = await AsyncStorage.getItem(CATALOG_CACHE_KEY).catch(() => null);
    let returnData = cached ? JSON.parse(cached) : null;

    // Fetch fresh data
    const fetchFresh = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('stock_status', 'in_stock');

        if (error) {
            console.error('Error fetching product catalog:', error);
            return null;
        }
        if (data) {
            await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(data)).catch(() => {});
            return data;
        }
        return null;
    };

    if (returnData && returnData.length > 0) {
        // Fire & forget background refresh
        fetchFresh();
        return returnData;
    }

    // No cache, wait for fetch
    const freshData = await fetchFresh();
    return freshData || [];
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
    const cleanedQuery = normalizeText(query);
    const tokens = toTokens(cleanedQuery);
    const tokenForDb = tokens[0] || cleanedQuery;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${tokenForDb}%,search_keywords.cs.{${tokenForDb}}`)
        .eq('stock_status', 'in_stock')
        .limit(10);

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }

    if (data && data.length > 0) {
        return data;
    }

    // Fallback: typo-tolerant in-memory ranking across in-stock catalog.
    const catalog = await getProductCatalog();
    const ranked = catalog
        .map(product => ({ product, score: scoreProductForQuery(product, cleanedQuery) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(item => item.product);

    return ranked;
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
