import { supabase } from './supabase';

export interface CreateNotificationParams {
    userId: string;
    orderId?: string;
    type: 'order_placed' | 'order_confirmed' | 'order_delivered' | 'order_cancelled' | 'security_alert';
    message: string;
    recipientType: 'customer' | 'trusted_contact';
    recipientPhone?: string;
}

export const notificationsService = {
    async createNotification(params: CreateNotificationParams) {
        const { error } = await supabase.from('notifications').insert({
            user_id: params.userId,
            order_id: params.orderId,
            type: params.type,
            message: params.message,
            recipient_type: params.recipientType,
            recipient_phone: params.recipientPhone,
        });
        return { error };
    },

    async notifyTrustedContacts(userId: string, orderId: string, type: 'order_placed' | 'order_confirmed' | 'order_delivered' | 'order_cancelled' | 'security_alert', message: string) {
        // Fetch user's trusted contacts
        const { data: contacts, error: fetchError } = await supabase
            .from('trusted_contacts')
            .select('*')
            .eq('user_id', userId);

        if (fetchError || (!contacts || contacts.length === 0)) {
            return { error: fetchError };
        }

        // Filter based on notification type
        const contactsToNotify = contacts.filter(c => {
            if (type === 'security_alert') return c.notify_security;
            if (['order_placed', 'order_cancelled'].includes(type)) return c.notify_new_orders;
            if (['order_confirmed', 'order_delivered'].includes(type)) return c.notify_delivery;
            return true;
        });

        // Create notifications for each
        const notificationsToInsert = contactsToNotify.map(contact => ({
            user_id: userId,
            order_id: orderId,
            type,
            message,
            recipient_type: 'trusted_contact',
            recipient_phone: contact.phone_number,
        }));

        if (notificationsToInsert.length > 0) {
            const { error: insertError } = await supabase.from('notifications').insert(notificationsToInsert);
            return { error: insertError };
        }

        return { error: null };
    }
};
