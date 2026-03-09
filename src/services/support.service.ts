import { supabase } from './supabase';

export interface SupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string | 'admin';
    message: string;
    is_admin: boolean;
    created_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
    id: string;
    user_id: string;
    subject: string;
    order_id?: string;
    status: TicketStatus;
    created_at: string;
    updated_at: string;
    messages: SupportMessage[];
}

export const supportService = {
    async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error || !data) return [];

        return data.map(ticket => ({
            id: ticket.id,
            user_id: ticket.user_id,
            subject: ticket.subject,
            order_id: ticket.order_id,
            status: ticket.status as TicketStatus,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            messages: [] // We don't fetch messages for the list view to save bandwidth
        }));
    },

    async getAllTickets(): Promise<SupportTicket[]> {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error || !data) return [];

        return data.map(ticket => ({
            id: ticket.id,
            user_id: ticket.user_id,
            subject: ticket.subject,
            order_id: ticket.order_id,
            status: ticket.status as TicketStatus,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            messages: []
        }));
    },

    async getTicketById(ticketId: string): Promise<SupportTicket | null> {
        // Fetch the main ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('support_messages')
            .select('*')
            .eq('id', ticketId)
            .single();

        if (ticketError || !ticket) return null;

        // Fetch replies
        const { data: replies, error: repliesError } = await supabase
            .from('support_replies')
            .select('*')
            .eq('support_message_id', ticketId)
            .order('created_at', { ascending: true });

        const messages: SupportMessage[] = [];

        // Add the initial message from the ticket body
        messages.push({
            id: `init-${ticket.id}`,
            ticket_id: ticket.id,
            sender_id: ticket.user_id,
            message: ticket.message,
            is_admin: false,
            created_at: ticket.created_at,
        });

        // Add all replies
        if (replies) {
            replies.forEach(reply => {
                messages.push({
                    id: reply.id,
                    ticket_id: reply.support_message_id,
                    sender_id: reply.sender_id,
                    message: reply.message,
                    is_admin: reply.sender_type === 'admin',
                    created_at: reply.created_at,
                });
            });
        }

        return {
            id: ticket.id,
            user_id: ticket.user_id,
            subject: ticket.subject,
            order_id: ticket.order_id,
            status: ticket.status as TicketStatus,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            messages
        };
    },

    async createTicket(
        userId: string,
        subject: string,
        message: string,
        orderId?: string
    ): Promise<SupportTicket | null> {
        let insertData: any = {
            user_id: userId,
            subject,
            message,
            status: 'open',
            priority: 'normal'
        };

        // UUID parsing fails if orderId is empty string or "SC-1234". Ensure it's UUID or leave it null.
        // For now, if orderId is provided but not UUID, we just leave it out to prevent crashes.
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId || '');
        if (isUUID) {
            insertData.order_id = orderId;
        }

        const { data, error } = await supabase
            .from('support_messages')
            .insert(insertData)
            .select()
            .single();

        if (error || !data) {
            console.error('Error creating ticket:', error);
            return null;
        }

        return this.getTicketById(data.id);
    },

    async addMessageToTicket(
        ticketId: string,
        senderId: string,
        message: string,
        isAdmin: boolean
    ): Promise<SupportMessage | null> {
        // Insert reply
        const { data: reply, error: replyError } = await supabase
            .from('support_replies')
            .insert({
                support_message_id: ticketId,
                sender_id: senderId,
                sender_type: isAdmin ? 'admin' : 'customer',
                message,
            })
            .select()
            .single();

        if (replyError || !reply) {
            console.error('Error adding reply:', replyError);
            return null;
        }

        // Update ticket updated_at and status if admin replied
        let updates: any = { updated_at: new Date().toISOString() };
        if (isAdmin) {
            updates.status = 'in_progress';
        }

        await supabase
            .from('support_messages')
            .update(updates)
            .eq('id', ticketId);

        return {
            id: reply.id,
            ticket_id: reply.support_message_id,
            sender_id: reply.sender_id,
            message: reply.message,
            is_admin: isAdmin,
            created_at: reply.created_at,
        };
    }
};
