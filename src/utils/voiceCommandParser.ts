// Voice Command Parser
// Parses voice input and determines navigation or action intent

export interface VoiceCommand {
    intent: 'search' | 'navigate' | 'cart' | 'orders' | 'profile' | 'checkout' | 'support' | 'call_contact' | 'add_to_cart' | 'remove_from_cart' | 'unknown';
    params?: {
        query?: string;
        screen?: string;
        category?: string;
    };
    contactName?: string;
    confidence: number;
}

// Keywords for different intents
const SEARCH_KEYWORDS = ['search', 'find', 'look for', 'show me', 'i need', 'where is'];
const CART_KEYWORDS = ['cart', 'basket', 'shopping cart', 'my cart', 'cup']; // cup is a common misinterpretation of cart
const ORDERS_KEYWORDS = ['order', 'orders', 'my orders', 'delivery', 'track'];
const PROFILE_KEYWORDS = ['profile', 'account', 'settings', 'my profile'];
const PHARMACY_KEYWORDS = ['medicine', 'medication', 'pharmacy', 'drug', 'pills', 'tablet'];
const GROCERY_KEYWORDS = ['food', 'grocery', 'groceries', 'vegetables', 'fruits'];
const CHECKOUT_KEYWORDS = ['checkout', 'pay', 'payment', 'buy now'];
const SUPPORT_KEYWORDS = ['support', 'help', 'assist', 'chat'];
const CALL_KEYWORDS = ['call', 'phone', 'dial'];

export function parseVoiceCommand(transcript: string): VoiceCommand {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Check for call contact intent (e.g. "call my son", "call tester")
    if (CALL_KEYWORDS.some(keyword => lowerTranscript.startsWith(keyword) || lowerTranscript.includes(keyword))) {
        let contactName = extractSearchQuery(lowerTranscript, CALL_KEYWORDS);
        if (contactName) {
            // Remove conversational fluff like "my"
            contactName = contactName.replace(/^my\s+/i, '').trim();
            return {
                intent: 'call_contact',
                contactName: contactName,
                confidence: 0.95
            };
        }
    }

    // Check for support intent
    if (SUPPORT_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        return {
            intent: 'support',
            params: { screen: 'Support' },
            confidence: 0.9
        };
    }

    // Check for checkout intent
    if (CHECKOUT_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        return {
            intent: 'checkout',
            params: { screen: 'Checkout' },
            confidence: 0.9
        };
    }

    // Check for cart intent
    if (CART_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        return {
            intent: 'cart',
            params: { screen: 'Cart' },
            confidence: 0.9
        };
    }

    // Check for orders intent
    if (ORDERS_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        return {
            intent: 'orders',
            params: { screen: 'Orders' },
            confidence: 0.9
        };
    }

    // Check for profile intent
    if (PROFILE_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        return {
            intent: 'profile',
            params: { screen: 'Profile' },
            confidence: 0.85
        };
    }

    // Check for pharmacy category
    if (PHARMACY_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        const query = extractSearchQuery(lowerTranscript, SEARCH_KEYWORDS);
        return {
            intent: 'navigate',
            params: {
                screen: 'Category',
                category: 'pharmacy',
                query: query || undefined
            },
            confidence: 0.85
        };
    }

    // Check for grocery category
    if (GROCERY_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        const query = extractSearchQuery(lowerTranscript, SEARCH_KEYWORDS);
        return {
            intent: 'navigate',
            params: {
                screen: 'Category',
                category: 'grocery',
                query: query || undefined
            },
            confidence: 0.85
        };
    }

    // Check for search intent
    if (SEARCH_KEYWORDS.some(keyword => lowerTranscript.includes(keyword))) {
        const query = extractSearchQuery(lowerTranscript, SEARCH_KEYWORDS);
        if (query) {
            return {
                intent: 'search',
                params: { query },
                confidence: 0.8
            };
        }
    }

    // If we didn't match any intent, treat as general search
    if (lowerTranscript.length > 2) {
        return {
            intent: 'search',
            params: { query: lowerTranscript },
            confidence: 0.6
        };
    }

    return {
        intent: 'unknown',
        confidence: 0
    };
}

function extractSearchQuery(transcript: string, searchKeywords: string[]): string | null {
    let query = transcript;

    // Remove search keywords from the beginning
    for (const keyword of searchKeywords) {
        const regex = new RegExp(`^${keyword}\\s+`, 'i');
        query = query.replace(regex, '');
    }

    // Also handle "for" after search keywords
    query = query.replace(/^for\s+/i, '');

    query = query.trim();
    return query.length > 0 ? query : null;
}

// Example usage:
// parseVoiceCommand("search for milk") => { intent: 'search', params: { query: 'milk' }, confidence: 0.8 }
// parseVoiceCommand("show my cart") => { intent: 'cart', params: { screen: 'Cart' }, confidence: 0.9 }
// parseVoiceCommand("find medicine for headache") => { intent: 'navigate', params: { screen: 'Category', category: 'pharmacy', query: 'medicine for headache' }, confidence: 0.85 }
