import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    TextInput, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastProvider';
import { useAuth } from '../../hooks/useAuth';
import { supportService } from '../../services/support.service';

const SUBJECT_OPTIONS = [
    { label: 'Order Tracking', value: 'order' },
    { label: 'Returns & Refunds', value: 'returns' },
    { label: 'Account Access', value: 'account' },
    { label: 'Payment Issues', value: 'payment' },
    { label: 'Other Inquiry', value: 'other' },
];

export default function SupportFormScreen() {
    const navigation = useNavigation<any>();
    const { showSuccess, showError } = useToast();
    const { user } = useAuth();

    const [subject, setSubject] = useState('');
    const [orderNumber, setOrderNumber] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

    const handleSubmit = async () => {
        if (!subject) {
            showError('Please select a subject');
            return;
        }
        if (!message.trim()) {
            showError('Please enter a message');
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API Call delay
            await new Promise(resolve => setTimeout(resolve, 800));

            if (!user?.id) {
                showError('Please sign in to submit a support ticket via the app. For urgent issues, please call 1800-88-SILVER.');
                setIsSubmitting(false);
                return;
            }

            const ticket = await supportService.createTicket(
                user.id,
                subject,
                message,
                orderNumber || undefined
            );

            if (!ticket) {
                throw new Error('Failed to create ticket');
            }

            showSuccess('Support request submitted successfully');

            // Navigate to the chat screen (we'll build it next)
            // For now, we'll just go back
            // navigation.navigate('TicketChat', { ticketId: ticket.id });
            navigation.goBack();
        } catch (error) {
            showError('Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Intro */}
                <View style={styles.introSection}>
                    <Text style={styles.introTitle}>Contact Support Form</Text>
                    <Text style={styles.introText}>
                        Please fill in the details below and our team will get back to you shortly.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.formSection}>

                    {/* Subject Field */}
                    <View style={[styles.inputGroup, { zIndex: 10 }]}>
                        <Text style={styles.inputLabel}>What do you need help with?</Text>
                        <Pressable
                            style={styles.dropdownButton}
                            onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
                        >
                            <Text style={[styles.dropdownText, !subject && styles.placeholderText]}>
                                {SUBJECT_OPTIONS.find(opt => opt.value === subject)?.label || 'Select a subject'}
                            </Text>
                            <MaterialIcons name="expand-more" size={24} color={theme.colors.primary} />
                        </Pressable>

                        {showSubjectDropdown && (
                            <View style={styles.dropdownList}>
                                {SUBJECT_OPTIONS.map((opt) => (
                                    <Pressable
                                        key={opt.value}
                                        style={[
                                            styles.dropdownItem,
                                            subject === opt.value && styles.dropdownItemSelected
                                        ]}
                                        onPress={() => {
                                            setSubject(opt.value);
                                            setShowSubjectDropdown(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            subject === opt.value && styles.dropdownItemTextSelected
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Order Number Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Order Number (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., #SC-9021"
                            placeholderTextColor={theme.colors.textMuted}
                            value={orderNumber}
                            onChangeText={setOrderNumber}
                        />
                    </View>

                    {/* Message Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>How can we help you today?</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Type your message here..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.submitButton,
                            pressed && styles.submitButtonPressed,
                            (!subject || !message.trim()) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !subject || !message.trim()}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>Send Message</Text>
                        )}
                    </Pressable>

                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialIcons name="info" size={20} color={theme.colors.primary} style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                        Our support team is available Mon-Sat, 8am - 9pm. We typically respond within 2 hours.
                    </Text>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbf9f4', // Eggshell white from mockup
    },
    header: {
        backgroundColor: 'rgba(251, 249, 244, 0.9)',
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
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: -0.5,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: 24,
        gap: 32,
        paddingBottom: 48,
    },
    introSection: {
        gap: 8,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    introText: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 26,
    },
    formSection: {
        gap: 24,
    },
    inputGroup: {
        gap: 12,
        zIndex: 1, // Needed for dropdown overlap on Android
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 64, // Taller for elderly accessibility
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    textArea: {
        height: 140,
        paddingTop: 20,
        paddingBottom: 20,
    },
    dropdownButton: {
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        borderRadius: 16,
        paddingHorizontal: 20,
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    placeholderText: {
        color: theme.colors.textMuted,
    },
    dropdownList: {
        position: 'absolute',
        top: 104, // Height of label + margin + input
        left: 0,
        right: 0,
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 10,
        overflow: 'hidden',
    },
    dropdownItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    dropdownItemSelected: {
        backgroundColor: `${theme.colors.primary}10`,
    },
    dropdownItemText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    dropdownItemTextSelected: {
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    submitButton: {
        backgroundColor: theme.colors.primary, // #00778a or similar from theme
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    submitButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    submitButtonDisabled: {
        backgroundColor: theme.colors.textMuted,
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    infoCard: {
        backgroundColor: `${theme.colors.primary}15`,
        borderColor: `${theme.colors.primary}30`,
        borderWidth: 1,
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
    },
    infoIcon: {
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 26,
    },
});
