import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, KeyboardAvoidingView, Platform, Keyboard,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { supportService, SupportMessage, SupportTicket } from '../../services/support.service';

const ADMIN_AVATAR = 'https://ui-avatars.com/api/?name=Admin+Support&background=00778a&color=fff';

export default function TicketChatScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user } = useAuth();

    // We expect a ticketId or just a newly created ticket from the route
    const ticketId = route.params?.ticketId;

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        const load = async () => {
            if (!ticketId) {
                navigation.goBack();
                return;
            }
            const data = await supportService.getTicketById(ticketId);
            if (data) {
                setTicket(data);
                setMessages(data.messages);
            } else {
                navigation.goBack();
            }
        };
        load();
    }, [ticketId]);

    // Force scroll to bottom when new messages arrive or keyboard opens
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        });

        // Initial scroll
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !ticket || !user?.id) return;

        const sentMessage = await supportService.addMessageToTicket(
            ticket.id,
            user.id,
            newMessage.trim(),
            false
        );

        if (sentMessage) {
            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage('');
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    if (!ticket) return null;

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <View style={styles.headerTitleContainer}>
                        <View style={styles.headerTitleRow}>
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                Ticket #{ticket.id.split('-')[0]}
                            </Text>
                            <View style={[
                                styles.statusBadge,
                                ticket.status === 'resolved' ? styles.statusBadgeResolved : null
                            ]}>
                                <Text style={[
                                    styles.statusText,
                                    ticket.status === 'resolved' ? styles.statusTextResolved : null
                                ]}>
                                    {ticket.status.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {ticket.order_id
                                ? `Order ${ticket.order_id.split('-')[0]}`
                                : ticket.subject.toUpperCase()}
                        </Text>
                    </View>
                    <Pressable style={styles.moreButton}>
                        <MaterialIcons name="more-vert" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                </View>
            </SafeAreaView>

            {/* Chat Area */}
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatScroll}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Date Badge */}
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>TODAY</Text>
                    </View>

                    {messages.map((msg, index) => {
                        const isSelf = msg.sender_id === (user?.id || 'guest') && !msg.is_admin;

                        return isSelf ? (
                            /* Customer Message (Right side usually for self, but HTML mockup has customer on left, admin on right. Since this is customer view, customer is self and should be on the right) */
                            <View key={msg.id} style={styles.messageSelfContainer}>
                                <View style={styles.messageSelfBubble}>
                                    <Text style={styles.messageSelfText}>{msg.message}</Text>
                                </View>
                                <View style={styles.messageSelfFooter}>
                                    <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
                                    <MaterialIcons name="done" size={12} color={theme.colors.textMuted} />
                                </View>
                            </View>
                        ) : (
                            /* Admin Message (Left side for incoming) */
                            <View key={msg.id} style={styles.messageIncomingContainer}>
                                <Image source={{ uri: ADMIN_AVATAR }} style={styles.avatar} />
                                <View style={styles.messageIncomingContent}>
                                    <View style={styles.messageIncomingBubble}>
                                        <Text style={styles.messageIncomingText}>{msg.message}</Text>
                                    </View>
                                    <Text style={styles.messageTimeIncoming}>{formatTime(msg.created_at)}</Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputArea}>
                    <View style={styles.inputContainer}>
                        <Pressable style={styles.attachButton}>
                            <MaterialIcons name="add-circle-outline" size={26} color={theme.colors.textMuted} />
                        </Pressable>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={500}
                        />
                        <Pressable
                            style={[
                                styles.sendButton,
                                !newMessage.trim() && styles.sendButtonDisabled
                            ]}
                            onPress={handleSend}
                            disabled={!newMessage.trim()}
                        >
                            <MaterialIcons
                                name="send"
                                size={20}
                                color={theme.colors.white}
                            />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitleContainer: {
        flex: 1,
        marginLeft: 8,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    statusBadge: {
        backgroundColor: `${theme.colors.primary}15`,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeResolved: {
        backgroundColor: '#E8F5E9',
    },
    statusText: {
        fontSize: 10,
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    statusTextResolved: {
        color: '#2e7d32',
    },
    headerSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
    moreButton: {
        padding: 8,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    chatScroll: {
        flex: 1,
        backgroundColor: 'rgba(251, 249, 244, 0.5)',
    },
    chatContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 24,
    },
    dateSeparator: {
        alignSelf: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        marginVertical: 8,
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        letterSpacing: 1,
    },
    // Self Message
    messageSelfContainer: {
        alignSelf: 'flex-end',
        maxWidth: '85%',
        alignItems: 'flex-end',
        gap: 4,
    },
    messageSelfBubble: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    messageSelfText: {
        color: theme.colors.white,
        fontSize: 15,
        lineHeight: 22,
        fontFamily: theme.typography.fontFamily.regular,
    },
    messageSelfFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginRight: 4,
    },
    messageTime: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    // Incoming Message
    messageIncomingContainer: {
        alignSelf: 'flex-start',
        maxWidth: '85%',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        marginBottom: 20,
    },
    messageIncomingContent: {
        flex: 1,
        alignItems: 'flex-start',
        gap: 4,
    },
    messageIncomingBubble: {
        backgroundColor: theme.colors.white,
        padding: 14,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageIncomingText: {
        color: theme.colors.textPrimary,
        fontSize: 15,
        lineHeight: 22,
        fontFamily: theme.typography.fontFamily.regular,
    },
    messageTimeIncoming: {
        fontSize: 11,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginLeft: 4,
    },
    // Input Area
    inputArea: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 20,
        padding: 6,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    attachButton: {
        padding: 8,
        marginBottom: 2,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 8,
        fontSize: 15,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    sendButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        marginRight: 2,
        shadowColor: `${theme.colors.primary}50`,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: theme.colors.borderLight,
        shadowOpacity: 0,
        elevation: 0,
    },
});
