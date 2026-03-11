import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('../services/productService', () => ({
    getProductCatalog: jest.fn(),
    searchProducts: jest.fn()
}));

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: jest.fn().mockImplementation(() => {
            return {
                getGenerativeModel: jest.fn().mockReturnValue({
                    generateContent: (...args: any[]) => mockGenerateContent(...args)
                })
            };
        })
    };
});

describe('aiService', () => {
    let processVoiceCommand: any;
    let getProductCatalog: any;

    beforeAll(() => {
        process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'mock_key';
        processVoiceCommand = require('../services/aiService').processVoiceCommand;
        getProductCatalog = require('../services/productService').getProductCatalog;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        getProductCatalog.mockResolvedValue([{ id: '1', name: 'Paracetamol 500mg' }]);
        
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify({
                    intent: 'call_contact',
                    contactName: 'son',
                    confidence: 0.9,
                    response: 'Calling your son'
                })
            }
        });
    });

    it('should correctly map a contact calling intent from Gemini', async () => {
        const result = await processVoiceCommand('Call my son');
        
        expect(result.intent).toBe('call_contact');
        expect(result.contactName).toBe('son');
        expect(result.response).toBe('Calling your son');
    });

    it('should fall back to basic parsing if Gemini fails', async () => {
        mockGenerateContent.mockRejectedValueOnce(new Error('Network Error'));

        const result = await processVoiceCommand('I want to checkout');
        expect(result.intent).toBe('checkout');
    });
});
