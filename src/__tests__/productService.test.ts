/**
 * Unit Tests: productService.ts
 */

jest.mock('../services/supabase');

import {
    getProductCatalog,
    getProductById,
    searchProducts,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../services/productService';

import { mockFrom } from '../__mocks__/supabase';

const MOCK_PRODUCT = {
    id: 'prod-1',
    name: 'Panadol 500mg',
    category: 'pharmacy',
    description: 'Pain relief',
    price: 8.90,
    image_url: 'https://example.com/panadol.jpg',
    stock_status: 'in_stock',
    search_keywords: ['panadol', 'painkiller'],
};

function mockChain(resolved: any) {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.insert = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.delete = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.or = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.limit = jest.fn().mockReturnValue(chain);
    chain.single = jest.fn().mockResolvedValue(resolved);
    chain.maybeSingle = jest.fn().mockResolvedValue(resolved);
    chain.then = (resolve: any) => Promise.resolve(resolved).then(resolve);
    return chain;
}

beforeEach(() => jest.clearAllMocks());

// ─── getProductCatalog ────────────────────────────────────────────────────────

describe('getProductCatalog', () => {
    it('returns in_stock products', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_PRODUCT], error: null }));
        const products = await getProductCatalog();
        expect(products).toHaveLength(1);
        expect(products[0].name).toBe('Panadol 500mg');
    });

    it('returns empty array on error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'DB error' } }));
        const products = await getProductCatalog();
        expect(products).toEqual([]);
    });
});

// ─── getProductById ───────────────────────────────────────────────────────────

describe('getProductById', () => {
    it('returns product when found', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: MOCK_PRODUCT, error: null }));
        const product = await getProductById('prod-1');
        expect(product).not.toBeNull();
        expect(product!.id).toBe('prod-1');
    });

    it('returns null when not found', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'Not found', code: 'PGRST116' } }));
        const product = await getProductById('nonexistent');
        expect(product).toBeNull();
    });
});

// ─── searchProducts ───────────────────────────────────────────────────────────

describe('searchProducts', () => {
    it('returns matching products', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_PRODUCT], error: null }));
        const results = await searchProducts('panadol');
        expect(results).toHaveLength(1);
        expect(results[0].name).toContain('Panadol');
    });

    it('returns empty array on error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'Query error' } }));
        const results = await searchProducts('xyz');
        expect(results).toEqual([]);
    });
});

// ─── getAllProducts ───────────────────────────────────────────────────────────

describe('getAllProducts', () => {
    it('returns all products including out_of_stock', async () => {
        const outOfStock = { ...MOCK_PRODUCT, id: 'prod-2', stock_status: 'out_of_stock' };
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_PRODUCT, outOfStock], error: null }));
        const products = await getAllProducts();
        expect(products).toHaveLength(2);
    });
});

// ─── createProduct ────────────────────────────────────────────────────────────

describe('createProduct', () => {
    it('inserts and returns the new product', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: MOCK_PRODUCT, error: null }));
        const product = await createProduct({ name: 'Panadol 500mg', price: 8.90 });
        expect(product.name).toBe('Panadol 500mg');
    });

    it('throws on supabase error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: new Error('Insert failed') }));
        await expect(createProduct({ name: 'Bad product' })).rejects.toThrow('Insert failed');
    });
});

// ─── updateProduct ────────────────────────────────────────────────────────────

describe('updateProduct', () => {
    it('updates and returns the updated product', async () => {
        const updated = { ...MOCK_PRODUCT, price: 9.90 };
        mockFrom.mockReturnValueOnce(mockChain({ data: updated, error: null }));
        const product = await updateProduct('prod-1', { price: 9.90 });
        expect(product.price).toBe(9.90);
    });
});

// ─── deleteProduct ────────────────────────────────────────────────────────────

describe('deleteProduct', () => {
    it('returns true on successful delete', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ error: null }));
        const result = await deleteProduct('prod-1');
        expect(result).toBe(true);
    });

    it('throws on error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ error: new Error('Delete failed') }));
        await expect(deleteProduct('prod-1')).rejects.toThrow('Delete failed');
    });
});
