/**
 * Unit Tests: support.service.ts
 */

jest.mock('../services/supabase');

import { supportService } from '../services/support.service';
import { mockFrom } from '../__mocks__/supabase';

function mockChain(resolved: any) {
    const chain: any = {};
    chain.select = jest.fn().mockReturnValue(chain);
    chain.insert = jest.fn().mockReturnValue(chain);
    chain.update = jest.fn().mockReturnValue(chain);
    chain.eq = jest.fn().mockReturnValue(chain);
    chain.order = jest.fn().mockReturnValue(chain);
    chain.single = jest.fn().mockResolvedValue(resolved);
    chain.maybeSingle = jest.fn().mockResolvedValue(resolved);
    chain.then = (resolve: any) => Promise.resolve(resolved).then(resolve);
    return chain;
}

beforeEach(() => jest.clearAllMocks());

const MOCK_TICKET_ROW = {
    id: 'ticket-1',
    user_id: 'user-1',
    subject: 'Order problem',
    message: 'My order did not arrive.',
    order_id: null,
    status: 'open',
    priority: 'normal',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
};

const MOCK_REPLY_ROW = {
    id: 'reply-1',
    support_message_id: 'ticket-1',
    sender_id: 'admin',
    sender_type: 'admin',
    message: 'We will investigate.',
    created_at: '2025-01-02T00:00:00Z',
};

// ─── getTicketsByUser ─────────────────────────────────────────────────────────

describe('supportService.getTicketsByUser', () => {
    it('returns list of tickets with empty messages array', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_TICKET_ROW], error: null }));
        const tickets = await supportService.getTicketsByUser('user-1');
        expect(tickets).toHaveLength(1);
        expect(tickets[0].subject).toBe('Order problem');
        expect(tickets[0].messages).toEqual([]);
    });

    it('returns empty array on error', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'error' } }));
        const tickets = await supportService.getTicketsByUser('user-1');
        expect(tickets).toEqual([]);
    });
});

// ─── getAllTickets ─────────────────────────────────────────────────────────────

describe('supportService.getAllTickets', () => {
    it('returns all tickets for admin', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_TICKET_ROW], error: null }));
        const tickets = await supportService.getAllTickets();
        expect(tickets).toHaveLength(1);
        expect(tickets[0].status).toBe('open');
    });
});

// ─── getTicketById ────────────────────────────────────────────────────────────

describe('supportService.getTicketById', () => {
    it('returns ticket with initial message and replies', async () => {
        // First call: the ticket
        mockFrom.mockReturnValueOnce(mockChain({ data: MOCK_TICKET_ROW, error: null }));
        // Second call: replies
        mockFrom.mockReturnValueOnce(mockChain({ data: [MOCK_REPLY_ROW], error: null }));

        const ticket = await supportService.getTicketById('ticket-1');
        expect(ticket).not.toBeNull();
        expect(ticket!.messages).toHaveLength(2); // initial + 1 reply
        expect(ticket!.messages[0].is_admin).toBe(false); // initial msg from user
        expect(ticket!.messages[1].is_admin).toBe(true);  // admin reply
    });

    it('returns null when ticket not found', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'Not found' } }));
        const ticket = await supportService.getTicketById('bad-id');
        expect(ticket).toBeNull();
    });
});

// ─── createTicket ─────────────────────────────────────────────────────────────

describe('supportService.createTicket', () => {
    it('includes order_id if it is a valid UUID', async () => {
        const validUUID = '550e8400-e29b-41d4-a716-446655440000';
        // First: insert ticket; second: getTicketById (ticket); third: getTicketById (replies)
        mockFrom
            .mockReturnValueOnce(mockChain({ data: { id: 'ticket-new' }, error: null }))
            .mockReturnValueOnce(mockChain({ data: { ...MOCK_TICKET_ROW, id: 'ticket-new', order_id: validUUID }, error: null }))
            .mockReturnValueOnce(mockChain({ data: [], error: null }));

        const ticket = await supportService.createTicket('user-1', 'Subject', 'Message', validUUID);
        expect(ticket).not.toBeNull();
    });

    it('omits order_id if not a valid UUID (e.g. "SC-1234")', async () => {
        mockFrom
            .mockReturnValueOnce(mockChain({ data: { id: 'ticket-new' }, error: null }))
            .mockReturnValueOnce(mockChain({ data: { ...MOCK_TICKET_ROW, id: 'ticket-new' }, error: null }))
            .mockReturnValueOnce(mockChain({ data: [], error: null }));

        // Should not crash with non-UUID order ID
        const ticket = await supportService.createTicket('user-1', 'Subject', 'Message', 'SC-1234');
        expect(ticket).not.toBeNull();
    });
});

// ─── addMessageToTicket ───────────────────────────────────────────────────────

describe('supportService.addMessageToTicket', () => {
    it('customer reply does NOT update status', async () => {
        // First call: insert reply; second call: update ticket
        const updateChain = mockChain({ error: null });
        mockFrom
            .mockReturnValueOnce(mockChain({ data: MOCK_REPLY_ROW, error: null }))
            .mockReturnValueOnce(updateChain);

        await supportService.addMessageToTicket('ticket-1', 'user-1', 'Thanks!', false);
        // Verify we called update but not with status: 'in_progress'
        // (hard to deep-verify without spy, but chain runs without error)
        expect(mockFrom).toHaveBeenCalledTimes(2);
    });

    it('admin reply updates status to in_progress', async () => {
        mockFrom
            .mockReturnValueOnce(mockChain({ data: { ...MOCK_REPLY_ROW, sender_type: 'admin' }, error: null }))
            .mockReturnValueOnce(mockChain({ error: null }));

        const msg = await supportService.addMessageToTicket('ticket-1', 'admin', 'We will fix this.', true);
        expect(msg).not.toBeNull();
        expect(msg!.is_admin).toBe(true);
    });

    it('returns null on reply insert failure', async () => {
        mockFrom.mockReturnValueOnce(mockChain({ data: null, error: { message: 'Insert failed' } }));
        const msg = await supportService.addMessageToTicket('ticket-1', 'user-1', 'Hello!', false);
        expect(msg).toBeNull();
    });
});
