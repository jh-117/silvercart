import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, Pressable,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { supportService, SupportTicket } from '../../services/support.service';

export default function SupportTicketsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();

    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadTickets = async () => {
        if (!user) {
            setTickets([]);
            setLoading(false);
            return;
        }

        const userTickets = await supportService.getTicketsByUser(user.id);
        setTickets(userTickets);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadTickets();
        }, [user])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadTickets();
        setRefreshing(false);
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#E65100'; // Orange
            case 'in_progress': return '#1565C0'; // Blue
            case 'resolved': return '#2E7D32'; // Green
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
        const date = new Date(item.updated_at);
        const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.ticketCard,
                    pressed && styles.ticketCardPressed
                ]}
                onPress={() => navigation.navigate('TicketChat', { ticketId: item.id })}
            >
                <View style={styles.ticketHeader}>
                    <View style={styles.ticketTitleContainer}>
                        <MaterialIcons
                            name="receipt-long"
                            size={18}
                            color={theme.colors.textPrimary}
                        />
                        <Text style={styles.ticketTitle}>
                            {item.subject.toUpperCase()}
                            {item.order_id ? ` • ${item.order_id.split('-')[0]}` : ''}
                        </Text>
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBg(item.status) }
                    ]}>
                        <Text style={[
                            styles.statusText,
                            { color: getStatusColor(item.status) }
                        ]}>
                            {item.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={styles.ticketIdText}>Ticket #{item.id.split('-')[0]}</Text>

                <View style={styles.ticketFooter}>
                    <Text style={styles.timeText}>Updated {dateString}</Text>
                    <MaterialIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>My Tickets</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <FlatList
                data={tickets}
                keyExtractor={(item) => item.id}
                renderItem={renderTicket}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="sms-failed" size={64} color={theme.colors.borderLight} />
                        <Text style={styles.emptyTitle}>No support tickets</Text>
                        <Text style={styles.emptyText}>
                            If you need help, you can contact us from the Support page.
                        </Text>
                        <Pressable
                            style={styles.newTicketButton}
                            onPress={() => navigation.navigate('Support')}
                        >
                            <Text style={styles.newTicketText}>Contact Support</Text>
                        </Pressable>
                    </View>
                )}
            />

            {/* FAB to create new ticket */}
            <Pressable
                style={styles.fab}
                onPress={() => navigation.navigate('SupportForm')}
            >
                <MaterialIcons name="add" size={28} color={theme.colors.white} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbf9f4',
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
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    listContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 100,
    },
    ticketCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    ticketCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    ticketTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        marginRight: 8,
    },
    ticketTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    ticketIdText: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginBottom: 12,
    },
    lastMessageContainer: {
        backgroundColor: theme.colors.backgroundLight,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    lastMessageSender: {
        fontSize: 13,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginBottom: 2,
    },
    lastMessageText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 20,
    },
    ticketFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        paddingTop: 12,
    },
    timeText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
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
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: theme.colors.textMuted,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
        marginBottom: 24,
    },
    newTicketButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    newTicketText: {
        color: theme.colors.white,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});
