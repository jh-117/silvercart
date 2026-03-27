/**
 * Mock Email Service
 * In a production environment, this would call a Supabase Edge Function 
 * which uses Resend or SendGrid to dispatch real emails.
 */

export const emailService = {
    /**
     * Send an order receipt to the customer
     */
    async sendReceiptEmail(userEmail: string, orderId: string, totalAmount: number) {
        console.log(`[Email Service] 📧 Sending Receipt Email to: ${userEmail}`);
        console.log(`[Email Service] Subject: Your SilverCart Receipt (Order ${orderId})`);
        console.log(`[Email Service] Body: Thank you for your purchase! Total: RM ${totalAmount.toFixed(2)}.`);
        
        // Simulate network delay
        return new Promise(resolve => setTimeout(resolve, 1000));
    },

    /**
     * Send an order notification to a trusted contact
     */
    async sendOrderNotificationEmail(contactName: string, contactPhone: string | null, userName: string, orderId: string) {
        console.log(`[Email Service] 🚨 Notifying Trusted Contact: ${contactName}`);
        console.log(`[Email Service] Subject: Update: ${userName} placed a new order`);
        console.log(`[Email Service] Body: Hi ${contactName}, this is a notification that ${userName} has placed order ${orderId} on SilverCart. Please check the app for details.`);
        
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
};
