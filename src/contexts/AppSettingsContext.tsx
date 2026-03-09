import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { userSettingsService, AppSettings } from '../services/userSettings.service';

interface AppSettingsContextType {
    settings: AppSettings | null;
    loading: boolean;
    updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
    getFontSize: (baseSize: number) => number;
}

const AppSettingsContext = createContext<AppSettingsContextType>({
    settings: null,
    loading: true,
    updateSettings: async () => { },
    getFontSize: (baseSize: number) => baseSize,
});

export const useAppSettings = () => useContext(AppSettingsContext);

export const AppSettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            if (!user) {
                setSettings(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await userSettingsService.getSettings(user.id);
                setSettings(data);
            } catch (error) {
                console.error('[AppSettingsContext] Error loading settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [user]);

    const updateSettings = async (updates: Partial<AppSettings>) => {
        if (!user || !settings) return;

        // Optimistic update
        const previousSettings = settings;
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        try {
            await userSettingsService.updateSettings(user.id, updates);
        } catch (error) {
            console.error('[AppSettingsContext] Error updating settings:', error);
            // Rollback on error
            setSettings(previousSettings);
            throw error;
        }
    };

    /**
     * Helper to calculate font size based on the global text_size setting.
     * text_size can be 'small', 'medium', 'large', 'xl'.
     */
    const getFontSize = (baseSize: number) => {
        if (!settings) return baseSize;

        switch (settings.text_size) {
            case 'small':
                return baseSize * 0.9;
            case 'medium':
                return baseSize;
            case 'large':
                return baseSize * 1.2;
            case 'xl':
                return baseSize * 1.4;
            default:
                return baseSize;
        }
    };

    const value = {
        settings,
        loading,
        updateSettings,
        getFontSize,
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
};
