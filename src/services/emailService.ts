import { supabase } from './supabase';

type SendEmailParams = {
    to: string;
    subject: string;
    text: string;
};

async function sendEmail(params: SendEmailParams) {
    const { to, subject, text } = params;

    console.log(`[Email Service] 📧 Sending email to: ${to}`);
    console.log(`[Email Service] Subject: ${subject}`);
    console.log(`[Email Service] Body: ${text}`);

    const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, text },
    });

    if (error) {
        console.error('[Email Service] ❌ send-email invoke error', error);
        throw error;
    }

    if (!data?.ok) {
        console.error('[Email Service] ❌ send-email failed', data);
        throw new Error(data?.error ?? 'Failed to send email');
    }

    return data;
}

type SendSmsParams = {
    to: string;
    message: string;
};

async function sendSms(params: SendSmsParams) {
    const { to, message } = params;

    console.log(`[SMS Service] 📲 Sending SMS to: ${to}`);
    console.log(`[SMS Service] Body: ${message}`);

    const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to, message },
    });

    if (error) {
        console.error('[SMS Service] ❌ send-sms invoke error', error);
        throw error;
    }

    if (!data?.ok) {
        console.error('[SMS Service] ❌ send-sms failed', data);
        throw new Error(data?.error ?? 'Failed to send SMS');
    }

    return data;
}

export const emailService = {
    async sendReceiptEmail(userEmail: string, orderId: string, totalAmount: number) {
        const subject = `Your SilverCart Receipt (Order ${orderId})`;
        const text = `Thank you for your purchase! Total: RM ${totalAmount.toFixed(2)}.`;
        return sendEmail({ to: userEmail, subject, text });
    },

    async sendOrderNotificationEmail(contactName: string, contactPhone: string | null, userName: string, orderId: string) {
        if (!contactPhone) {
            console.warn('[SMS Service] Missing trusted contact phone number, skipping SMS.');
            return;
        }
        const message = `Hi ${contactName}, ${userName} placed a new SilverCart order (${orderId}).`;
        return sendSms({ to: contactPhone, message });
    },
};
