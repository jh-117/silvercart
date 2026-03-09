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
    category?: string;
    products?: any[];
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
- "add_to_cart": User wants to add a product to cart
- "view_cart": User wants to see their cart
- "checkout": User wants to complete purchase
- "navigate": User wants to go to orders, profile, or category (params.category / params.screen)
- "unknown": Cannot determine intent

RESPONSE FORMAT (JSON ONLY, NO MARKDOWN TAGS):
{
  "intent": "search",
  "product": "exact product name",
  "quantity": 1,
  "confidence": 0.85,
  "response": "Friendly confirmation message for the user. E.g: Let me find paracetamol for you."
}

IMPORTANT:
- Match product names flexibly (e.g., "panadol" matches "Paracetamol 500mg")
- If intent is view_cart, checkout, set intent accordingly.
- If intent is orders, set intent: "navigate", params: { screen: "Orders" }
- If intent is profile, set intent: "navigate", params: { screen: "Profile" }
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
