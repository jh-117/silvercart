import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@silvercart_favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const data = await AsyncStorage.getItem(FAVORITES_KEY);
            if (data) setFavorites(JSON.parse(data));
        } catch (e) {
            console.error('Failed to load favorites', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (productId: string) => {
        try {
            const newFavorites = favorites.includes(productId)
                ? favorites.filter(id => id !== productId)
                : [...favorites, productId];
            
            setFavorites(newFavorites);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to save favorite', e);
        }
    };

    const isFavorite = (productId: string) => favorites.includes(productId);

    return { favorites, loading, toggleFavorite, isFavorite };
}
