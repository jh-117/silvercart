import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProductCatalog, searchProducts } from './productService';
import { parseVoiceCommand as fallbackParseVoiceCommand, VoiceCommand } from '../utils/voiceCommandParser';

// Use Expo Constants or directly read from process.env if available
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export interface AIVoiceCommand extends VoiceCommand {
    response?: string;
    product?: string;
    quantity?: number;
    items?: Array<{ product: string; quantity: number; products?: any[] }>; // Supports multiple items
    category?: string;
    products?: any[]; // Legacy fallback for single search
}

/**
 * Process voice command and extract intent + entities using Gemini
 * Falls back to voiceCommandParser if Gemini fails, API key is missing, or network fails.
 */
export async function processVoiceCommand(transcript: string): Promise<AIVoiceCommand> {
    if (!genAI || !transcript.trim()) {
        console.log('[AI Service] No Gemini API Key or empty transcript, falling back to basic parser.');
        return fallbackParseVoiceCommand(transcript);
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Get current product catalog for context
        const products = await getProductCatalog();
        const productNames = products.map(p => p.name).join(', ');

        const prompt = `
You are a helpful shopping assistant for SilverCart, an e-commerce app for elderly users in Malaysia.

AVAILABLE PRODUCTS:
${productNames || 'Paracetamol, Panadol, Milk, Rice, Bread, Cooking Oil'}

USER SAID:
"${transcript}"

TASK:
Analyze the user's intent and extract relevant information.

SUPPORTED INTENTS:
- "search": User wants to find products
- "add_to_cart": User wants to add product(s) to cart. You MUST extract ALL requested items into an "items" array.
- "remove_from_cart": User wants to remove product(s) from their cart. You MUST extract ALL requested items into an "items" array.
- "view_cart": User wants to see their cart
- "checkout": User wants to complete purchase, pay, or check out.
- "navigate": User wants to go to orders, profile, favorites, reminders, or category (params.category / params.screen)
- "call_contact": User wants to call a contact (e.g. "my son", "doctor", "emergency"). Try to extract the requested name into "contactName".
- "support": User wants help, support, or live chat
- "unknown": Cannot determine intent

RESPONSE FORMAT (JSON ONLY, NO MARKDOWN TAGS):
{
  "intent": "add_to_cart",
  "product": "exact product name", // Use for single 'search'
  "items": [
    { "product": "milk", "quantity": 1 },
    { "product": "panadol", "quantity": 2 }
  ], // ONLY if intent is add_to_cart
  "contactName": "son", // ONLY if intent is call_contact
  "confidence": 0.85,
  "response": "Friendly confirmation message for the user. E.g: Let me add those to your cart."
}

IMPORTANT:
- Match product names flexibly (e.g., "panadol" matches "Paracetamol 500mg")
- If intent is view_cart, checkout, set intent accordingly.
- If intent is orders, set intent: "navigate", params: { screen: "Orders" }
- If intent is profile, set intent: "navigate", params: { screen: "Profile" }
- If intent is favorites, set intent: "navigate", params: { screen: "Favorites" }
- If intent is reminders or alarms, set intent: "navigate", params: { screen: "Reminders" }
- If intent is support or help, set intent: "navigate", params: { screen: "Support" }
- Quantity defaults to 1 if not specified
- Return ONLY valid JSON. Wait for the user request, do not output anything else.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean JSON from Markdown fences if explicitly present
        const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed: AIVoiceCommand = JSON.parse(jsonText);

        if (!parsed.intent) {
            throw new Error('Invalid AI response format: Missing intent');
        }

        // Map parsed AI to router inputs
        if (parsed.intent === 'search' && parsed.product) {
            const searchResults = await searchProducts(parsed.product);
            parsed.products = searchResults;
            parsed.params = { query: parsed.product };
        } else if (parsed.intent === 'add_to_cart' || parsed.intent === 'remove_from_cart') {
            // Handle multiple items or default fallback
            if (parsed.items && Array.isArray(parsed.items)) {
                for (const item of parsed.items) {
                    const searchResults = await searchProducts(item.product);
                    item.products = searchResults;
                }
            } else if (parsed.product) {
                // Backward compatibility if AI drops `items` array
                const searchResults = await searchProducts(parsed.product);
                parsed.products = searchResults;
                parsed.items = [{ product: parsed.product, quantity: parsed.quantity || 1, products: searchResults }];
            }
        } else if (parsed.intent === 'navigate') {
            // Provide safe fallbacks if the AI didn't provide them
            parsed.params = parsed.params || {};
        }

        return parsed;

    } catch (error) {
        console.error('[AI Service] Gemini processing error:', error);
        // Fallback to keyword matching
        return fallbackParseVoiceCommand(transcript);
    }
}

/**
 * Suggest scheduling defaults for Auto-Reorder and Medication Alarm.
 * Uses Gemini to provide context-aware defaults; falls back to safe values.
 */
export async function suggestScheduleDefaults(
    productName: string,
    category: string,
): Promise<{ intervalDays: number; alarmTimes: string[]; reason: string }> {
    const fallback = {
        intervalDays: category?.toLowerCase() === 'pharmacy' ? 14 : 30,
        alarmTimes: category?.toLowerCase() === 'pharmacy' ? ['08:00', '20:00'] : ['09:00'],
        reason: 'Default suggestion based on category.',
    };

    if (!genAI) return fallback;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const prompt = `
You are a helpful health and shopping assistant for elderly users in Malaysia.

Product: "${productName}"
Category: "${category}"

Based on the product name and category, suggest:
1. How often should this be reordered? (intervalDays: number between 7 and 90)
2. If it's a medication, what are the ideal reminder times? (alarmTimes: array of "HH:MM" strings, max 3)
3. A brief reason for your suggestion (reason: short string, max 15 words)

IMPORTANT: Return ONLY pure JSON (no markdown, no extra text):
{
  "intervalDays": 30,
  "alarmTimes": ["08:00", "20:00"],
  "reason": "Taken twice daily; typically a 30-day supply."
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(text);
        return {
            intervalDays: parsed.intervalDays ?? fallback.intervalDays,
            alarmTimes: parsed.alarmTimes ?? fallback.alarmTimes,
            reason: parsed.reason ?? fallback.reason,
        };
    } catch {
        return fallback;
    }
}
