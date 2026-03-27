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

function normalizePhoneToE164(rawPhone: string): string {
    const trimmed = rawPhone.trim();
    const digits = trimmed.replace(/[^\d+]/g, '');

    // Already E.164
    if (digits.startsWith('+')) return digits;

    // Common Malaysia local formats -> E.164
    // 016xxxxxxx -> +6016xxxxxxx
    if (digits.startsWith('0')) return `+6${digits}`;
    // 6016xxxxxxx -> +6016xxxxxxx
    if (digits.startsWith('60')) return `+${digits}`;
    // 16xxxxxxx -> +6016xxxxxxx
    if (digits.length >= 9 && digits.length <= 11) return `+60${digits}`;

    return digits;
}

async function sendSms(params: SendSmsParams) {
    const normalizedTo = normalizePhoneToE164(params.to);
    const { message } = params;

    console.log(`[SMS Service] 📲 Sending SMS to: ${normalizedTo}`);
    console.log(`[SMS Service] Body: ${message}`);

    const { data, error } = await supabase.functions.invoke('send-sms', {
        body: { to: normalizedTo, message },
    });

    if (error) {
        console.error('[SMS Service] ❌ send-sms invoke error', error);
        throw error;
    }

    if (!data?.ok) {
        console.error('[SMS Service] ❌ send-sms failed', data);
        const rawError = String(data?.error ?? 'Failed to send SMS');
        if (rawError.includes('21608')) {
            throw new Error('Trusted contact SMS was not sent. Twilio trial accounts can only send SMS to verified numbers.');
        }
        if (rawError.includes('21211')) {
            throw new Error('Trusted contact SMS was not sent. The phone number format is invalid. Please use +60 format.');
        }
        throw new Error(rawError);
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
