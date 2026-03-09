import { supabase } from './supabase';

export interface AppSettings {
    id?: string;
    user_id: string;
    language: 'en' | 'bm';
    push_notifications_enabled: boolean;
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
    text_size: 'small' | 'medium' | 'large' | 'xl';
    high_contrast_mode: boolean;
    voice_feedback_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

export const userSettingsService = {
    async getSettings(userId: string): Promise<AppSettings> {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // No record found, create default settings
            return this.createDefaultSettings(userId);
        }

        if (error) {
            console.error('Error fetching app settings:', error);
            throw error;
        }

        // Map 'ms' to 'bm' if necessary, though the DB says 'ms' in comment, 
        // let's stick to what we decided in the plan (en/bm).
        return data as AppSettings;
    },

    async createDefaultSettings(userId: string): Promise<AppSettings> {
        const defaultSettings: Partial<AppSettings> = {
            user_id: userId,
            language: 'en',
            push_notifications_enabled: true,
            email_notifications_enabled: false,
            sms_notifications_enabled: true,
            text_size: 'medium',
            high_contrast_mode: false,
            voice_feedback_enabled: false,
        };

        const { data, error } = await supabase
            .from('app_settings')
            .insert([defaultSettings])
            .select()
            .single();

        if (error) {
            console.error('Error creating default app settings:', error);
            throw error;
        }

        return data as AppSettings;
    },

    async updateSettings(userId: string, updates: Partial<AppSettings>): Promise<AppSettings> {
        const { data, error } = await supabase
            .from('app_settings')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating app settings:', error);
            throw error;
        }

        return data as AppSettings;
    }
};
