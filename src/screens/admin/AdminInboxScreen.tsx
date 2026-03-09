import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    RefreshControl, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supportService, SupportTicket } from '../../services/support.service';

type TabType = 'active' | 'unassigned' | 'resolved';

export default function AdminInboxScreen() {
    const navigation = useNavigation<any>();

    const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);

    const loadTickets = async () => {
        const tickets = await supportService.getAllTickets();
        setAllTickets(tickets);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadTickets();
        }, [])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadTickets();
        setRefreshing(false);
    }, []);

    // Filter tickets based on active tab
    const getFilteredTickets = (): SupportTicket[] => {
        let filtered: SupportTicket[];
        switch (activeTab) {
            case 'active':
                filtered = allTickets.filter(t => t.status !== 'resolved');
                break;
            case 'unassigned':
                // "Unassigned" = open tickets with no admin reply yet
                filtered = allTickets.filter(t =>
                    t.status === 'open' && !t.messages.some(m => m.is_admin)
                );
                break;
            case 'resolved':
                filtered = allTickets.filter(t => t.status === 'resolved');
                break;
            default:
                filtered = allTickets;
        }

        // Apply search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.id.toLowerCase().includes(q) ||
                t.subject.toLowerCase().includes(q) ||
                (t.order_id?.toLowerCase().includes(q) ?? false) ||
                t.messages.some(m => m.message.toLowerCase().includes(q))
            );
        }

        return filtered;
    };

    const getTabCount = (tab: TabType): number => {
        switch (tab) {
            case 'active': return allTickets.filter(t => t.status !== 'resolved').length;
            case 'unassigned': return allTickets.filter(t =>
                t.status === 'open' && !t.messages.some(m => m.is_admin)
            ).length;
            case 'resolved': return allTickets.filter(t => t.status === 'resolved').length;
            default: return 0;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#E65100';
            case 'in_progress': return '#1565C0';
            case 'resolved': return '#2E7D32';
            default: return theme.colors.textMuted;
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'open': return '#FFF3E0';
            case 'in_progress': return '#E3F2FD';
            case 'resolved': return '#E8F5E9';
            default: return theme.colors.backgroundLight;
        }
    };

    const renderTicket = ({ item }: { item: SupportTicket }) => {
        const lastMessage = item.messages.length > 0
            ? item.messages[item.messages.length - 1]
            : null;

        const date = new Date(item.updated_at);
        const isToday = new Date().toDateString() === date.toDateString();
        const timeString = isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        return (
            <Pressable
                style={({ pressed }) => [styles.ticketCard, pressed && { backgroundColor: '#F8FAFC' }]}
                onPress={() => navigation.navigate('AdminTicketChat', { ticketId: item.id })}
            >
                {/* Header Row */}
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketTitleContainer}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.avatarText}>{item.user_id.substring(0, 2).toUpperCase()}</Text>
                        </View>
                        <View style={styles.ticketTitleTextContainer}>
                            <Text style={styles.ticketTitle}>User {item.user_id}</Text>
                            <Text style={styles.ticketIdText}>#{item.id.split('-')[0]} • {item.subject}</Text>
                        </View>
                    </View>
                    <View style={styles.ticketMetaContainer}>
                        <Text style={styles.timeText}>{timeString}</Text>
                        {item.status === 'open' && (
                            <View style={styles.unreadDot} />
                        )}
                    </View>
                </View>

                {/* Message Snippet */}
                {lastMessage && (
                    <Text style={[
                        styles.lastMessageText,
                        item.status === 'open' && styles.lastMessageTextUnread
                    ]} numberOfLines={2}>
                        {lastMessage.is_admin ? 'You: ' : ''}{lastMessage.message}
                    </Text>
                )}

                {/* Footer Tags */}
                <View style={styles.ticketFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusBg(item.status) }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                    {item.order_id && (
                        <View style={styles.orderBadge}>
                            <MaterialIcons name="local-shipping" size={12} color={theme.colors.textMuted} style={styles.orderIcon} />
                            <Text style={styles.orderText}>{item.order_id.split('-')[0]}</Text>
                        </View>
                    )}
                </View>
            </Pressable>
        );
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: 'active', label: 'All Active' },
        { key: 'unassigned', label: 'Unassigned' },
        { key: 'resolved', label: 'Resolved' },
    ];

    const filteredTickets = getFilteredTickets();

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Support Inbox</Text>
                    <View style={styles.headerActions}>
                        <Pressable
                            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                            onPress={() => {
                                setSearchVisible(v => !v);
                                if (searchVisible) setSearchQuery('');
                            }}
                        >
                            <MaterialIcons
                                name={searchVisible ? 'close' : 'search'}
                                size={24}
                                color={searchVisible ? theme.colors.primary : theme.colors.textPrimary}
                            />
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                            onPress={() => {
                                // Cycle to next tab as a quick filter shortcut
                                const order: TabType[] = ['active', 'unassigned', 'resolved'];
                                const idx = order.indexOf(activeTab);
                                setActiveTab(order[(idx + 1) % order.length]);
                            }}
                        >
                            <MaterialIcons name="filter-list" size={24} color={theme.colors.textPrimary} />
                        </Pressable>
                    </View>
                </View>

                {/* Search Bar */}
                {searchVisible && (
                    <View style={styles.searchContainer}>
                        <MaterialIcons name="search" size={20} color={theme.colors.textMuted} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tickets, orders, messages..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <MaterialIcons name="cancel" size={18} color={theme.colors.textMuted} />
                            </Pressable>
                        )}
                    </View>
                )}
            </SafeAreaView>

            {/* Tabs — all pressable and state-driven */}
            <View style={styles.tabContainer}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab.key;
                    const count = getTabCount(tab.key);
                    return (
                        <Pressable
                            key={tab.key}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                            <View style={[styles.badgeContainer, isActive && styles.activeBadgeContainer]}>
                                <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>
                                    {count}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            <FlatList
                data={filteredTickets}
                keyExtractor={(item) => item.id}
                renderItem={renderTicket}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="inbox" size={64} color={theme.colors.borderLight} />
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? 'No results found' : 'Inbox is empty'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {searchQuery
                                ? `No tickets matched "${searchQuery}"`
                                : 'All caught up! There are no tickets here.'}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: theme.typography.fontFamily.bold,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 4,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
    },
    iconButtonPressed: {
        backgroundColor: '#F1F5F9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        fontFamily: theme.typography.fontFamily.regular,
        paddingVertical: 0,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        gap: 6,
    },
    activeTab: {
        borderBottomColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        fontFamily: theme.typography.fontFamily.semibold,
    },
    activeTabText: {
        color: theme.colors.primary,
    },
    badgeContainer: {
        backgroundColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center',
    },
    activeBadgeContainer: {
        backgroundColor: `${theme.colors.primary}20`,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#475569',
    },
    activeBadgeText: {
        color: theme.colors.primary,
    },
    listContent: {
        paddingTop: 8,
        paddingBottom: 100,
    },
    ticketCard: {
        backgroundColor: theme.colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ticketTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: theme.colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    ticketTitleTextContainer: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: theme.typography.fontFamily.bold,
    },
    ticketIdText: {
        fontSize: 13,
        color: '#64748B',
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    ticketMetaContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        height: 40,
    },
    timeText: {
        fontSize: 12,
        color: '#94A3B8',
        fontFamily: theme.typography.fontFamily.regular,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        marginTop: 6,
    },
    lastMessageText: {
        fontSize: 14,
        color: '#475569',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 20,
        marginBottom: 12,
        paddingLeft: 52,
    },
    lastMessageTextUnread: {
        color: '#0F172A',
        fontWeight: '600',
        fontFamily: theme.typography.fontFamily.semibold,
    },
    ticketFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 52,
        gap: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    orderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    orderIcon: {
        marginRight: 4,
    },
    orderText: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
        fontFamily: theme.typography.fontFamily.semibold,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: theme.typography.fontFamily.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
    },
});
