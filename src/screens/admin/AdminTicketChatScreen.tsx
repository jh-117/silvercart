import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, KeyboardAvoidingView, Platform, Keyboard,
    Image, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supportService, SupportMessage, SupportTicket } from '../../services/support.service';
import { supabase } from '../../services/supabase';

const CUSTOMER_AVATAR = 'https://ui-avatars.com/api/?name=Customer&background=E2E8F0&color=64748B';

export default function AdminTicketChatScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // We expect a ticketId from the route
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

        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);

        return () => {
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleSend = async () => {
        if (!newMessage.trim() || !ticket) return;

        const { data: { session } } = await supabase.auth.getSession();
        const adminId = session?.user?.id;

        if (!adminId) {
            console.error('No admin ID found in session');
            return;
        }

        const sentMessage = await supportService.addMessageToTicket(
            ticket.id,
            adminId,
            newMessage.trim(),
            true // is_admin = true
        );

        if (sentMessage) {
            setMessages((prev) => [...prev, sentMessage]);
            setNewMessage('');
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const handleQuickResponse = (text: string) => {
        setNewMessage(text);
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
                    <View style={styles.headerLeft}>
                        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                            <MaterialIcons name="arrow-back" size={24} color={'#0F172A'} />
                        </Pressable>
                        <View style={styles.headerTitleContainer}>
                            <View style={styles.headerTitleRow}>
                                <Text style={styles.headerTitle} numberOfLines={1}>
                                    User {ticket.user_id.substring(0, 5)}...
                                </Text>
                                <View style={styles.proBadge}>
                                    <Text style={styles.proBadgeText}>PRO</Text>
                                </View>
                            </View>
                            <Text style={styles.headerSubtitle} numberOfLines={1}>
                                Order #{ticket.order_id ? ticket.order_id.split('-')[0] : 'N/A'} • Ticket {ticket.id.split('-')[0]}
                            </Text>
                        </View>
                    </View>
                    <Pressable style={styles.moreButton}>
                        <MaterialIcons name="more-vert" size={24} color={'#0F172A'} />
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
                        const isAdmin = msg.is_admin;

                        return isAdmin ? (
                            /* Admin Message (Self in this view) */
                            <View key={msg.id} style={styles.messageSelfContainer}>
                                <View style={styles.messageSelfBubble}>
                                    <Text style={styles.messageSelfText}>{msg.message}</Text>
                                </View>
                                <View style={styles.messageSelfFooter}>
                                    <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
                                    <MaterialIcons name="done-all" size={14} color={theme.colors.primary} />
                                </View>
                            </View>
                        ) : (
                            /* Customer Message (Incoming in this view) */
                            <View key={msg.id} style={styles.messageIncomingContainer}>
                                <Image source={{ uri: CUSTOMER_AVATAR }} style={styles.avatar} />
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
                    <View style={styles.quickResponsesContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickResponsesScroll}>
                            <TouchableOpacity
                                style={styles.quickResponseChip}
                                onPress={() => handleQuickResponse("I've looked into this and resolved the issue. Let me know if you need anything else.")}
                            >
                                <Text style={styles.quickResponseText}>⚡ Quick Solve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickResponseChip}
                                onPress={() => handleQuickResponse("I'm checking the status of your order now. One moment please.")}
                            >
                                <Text style={styles.quickResponseText}>📦 Order Status</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickResponseChip}
                                onPress={() => handleQuickResponse("I can help you process a refund for this. Please confirm the items you wish to return.")}
                            >
                                <Text style={styles.quickResponseText}>💸 Refund Policy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <View style={styles.inputContainer}>
                        <Pressable style={styles.attachButton}>
                            <MaterialIcons name="add-circle" size={26} color={'#94A3B8'} />
                        </Pressable>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Type a response..."
                            placeholderTextColor={'#94A3B8'}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={1000}
                        />
                        <Pressable
                            style={[
                                styles.sendButton,
                                !newMessage.trim() && styles.sendButtonDisabled
                            ]}
                            onPress={handleSend}
                            disabled={!newMessage.trim()}
                        >
                            <MaterialIcons name="send" size={20} color={theme.colors.white} />
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
        backgroundColor: '#F8FAFC',
    },
    header: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9', // Very light grey
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    headerTitleContainer: {
        justifyContent: 'center',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        fontFamily: theme.typography.fontFamily.bold,
    },
    proBadge: {
        backgroundColor: `${theme.colors.primary}15`,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    proBadgeText: {
        fontSize: 10,
        color: theme.colors.primary,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#64748B',
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
        backgroundColor: 'rgba(248, 250, 252, 0.5)',
    },
    chatContent: {
        padding: 16,
        gap: 24, // Increased gap for admin view (from mockup)
        paddingBottom: 24,
    },
    dateSeparator: {
        alignSelf: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        marginVertical: 8,
    },
    dateText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 1,
    },
    // Admin Message (Self)
    messageSelfContainer: {
        alignSelf: 'flex-end',
        maxWidth: '85%',
        alignItems: 'flex-end',
        gap: 4,
    },
    messageSelfBubble: {
        backgroundColor: theme.colors.primary, // Red/Teal depending on theme
        padding: 14,
        borderRadius: 20,
        borderBottomRightRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    messageSelfText: {
        color: theme.colors.white,
        fontSize: 14,
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
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: theme.typography.fontFamily.regular,
    },
    // Customer Message (Incoming)
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
        borderColor: '#E2E8F0',
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
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageIncomingText: {
        color: '#1E293B',
        fontSize: 14,
        lineHeight: 22,
        fontFamily: theme.typography.fontFamily.regular,
    },
    messageTimeIncoming: {
        fontSize: 10,
        color: '#94A3B8',
        fontFamily: theme.typography.fontFamily.regular,
        marginLeft: 4,
    },
    // Input Area
    inputArea: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        gap: 12,
    },
    quickResponsesContainer: {
        marginBottom: 4,
    },
    quickResponsesScroll: {
        gap: 8,
        paddingRight: 16, // Extra padding at end
    },
    quickResponseChip: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    quickResponseText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    attachButton: {
        padding: 6,
        marginBottom: 2,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        paddingTop: 10,
        paddingBottom: 10,
        paddingHorizontal: 8,
        fontSize: 14,
        color: '#1E293B',
        fontFamily: theme.typography.fontFamily.regular,
    },
    sendButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#E2E8F0',
        shadowOpacity: 0,
        elevation: 0,
    },
});
