import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    address: string | null;
    dob: string | null;
}

export const profileService = {
    async getProfile(userId: string): Promise<{ data: UserProfile | null, error: any }> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
        return { data, error };
    },

    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: any }> {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        return { error };
    },

    async uploadAvatar(userId: string, imageUri: string): Promise<{ url: string | null, error: any }> {
        try {
            // Read image as base64 to avoid Android fetch(file://) blob creation bugs
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });

            // Enforce max 2MB size limit (approx base64 size is 33% larger than binary)
            const approxSize = base64.length * 0.75;
            if (approxSize > 2 * 1024 * 1024) {
                return { url: null, error: new Error('Image size exceeds 2MB limit.') };
            }

            const arrayBuffer = decode(base64);

            const fileExt = imageUri.split('.').pop() || 'jpg';
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (uploadError) {
                return { url: null, error: uploadError };
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return { url: publicUrl, error: null };
        } catch (error) {
            return { url: null, error };
        }
    }
};
