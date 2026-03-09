import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Image, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../contexts/ToastProvider';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqData = [
    {
        q: 'How do I track my order?',
        a: 'Go to Profile → Order History → tap on your order → select "Track Order". You will see real-time updates on your delivery status.',
    },
    {
        q: 'Can I change or cancel my order?',
        a: 'Orders can be cancelled within 1 hour of placing them. Go to Order History, tap the order, and select "Cancel Order". After the 1-hour window, please call our support line.',
    },
    {
        q: 'How do I return a product?',
        a: 'We have a 7-day easy return policy. Simply call 1800-88-SILVER or email support@silvercart.my with your order number and we will arrange a free pickup.',
    },
    {
        q: 'How do I reorder my regular medicines?',
        a: 'Tap the "Orders" tab at the bottom → find the order → tap "Reorder". All items will be added to your cart instantly. You can also set up Auto-Reorder from your Profile settings.',
    },
    {
        q: 'Is my payment information safe?',
        a: 'Yes. SilverCart uses bank-grade SSL encryption. We never store your full card number — only a secure token provided by your bank. Your data is never sold to third parties.',
    },
    {
        q: 'What if I received a wrong or damaged item?',
        a: 'We apologise for the inconvenience. Please take a photo of the item and email it to support@silvercart.my or call us directly. We will replace it or issue a full refund within 2 business days.',
    },
];

function FaqItem({
    item,
    isOpen,
    onToggle
}: {
    item: typeof faqData[0],
    isOpen: boolean,
    onToggle: () => void
}) {
    return (
        <Pressable
            style={[styles.faqItem, isOpen && styles.faqItemOpen]}
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                onToggle();
            }}
        >
            <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>{item.q}</Text>
                <MaterialIcons
                    name={isOpen ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={isOpen ? theme.colors.primary : theme.colors.textMuted}
                />
            </View>
            {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
        </Pressable>
    );
}

export default function SupportScreen() {
    const navigation = useNavigation<any>();
    const { showInfo, showSuccess } = useToast();
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const supportOptions = [
        {
            icon: 'phone-in-talk',
            title: 'Call Us',
            subtitle: 'Mon–Sat, 8am–9pm',
            detail: '1800-88-SILVER',
            color: '#1565C0',
            bg: '#E3F2FD',
            onPress: () => showInfo('Calling 1800-88-SILVER...'),
        },
        {
            icon: 'chat-bubble-outline',
            title: 'Live Chat',
            subtitle: 'Avg. reply: 2 min',
            detail: 'Chat with an agent',
            color: '#2e7d32',
            bg: '#E8F5E9',
            onPress: () => navigation.navigate('SupportForm'),
        },
        {
            icon: 'email',
            title: 'Email Us',
            subtitle: 'Reply within 24 hours',
            detail: 'support@silvercart.my',
            color: '#6a1b9a',
            bg: '#F3E5F5',
            onPress: () => showSuccess('Email app opening...'),
        },
        {
            icon: 'article',
            title: 'Safety Guide',
            subtitle: 'Tips for safe shopping',
            detail: 'Read the guide',
            color: '#078834',
            bg: '#E8F5E9',
            onPress: () => navigation.navigate('SafetyGuide'),
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Help & Support</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.heroIcon}>
                        <MaterialIcons name="support-agent" size={42} color={theme.colors.white} />
                    </View>
                    <Text style={styles.heroTitle}>We're Here to Help</Text>
                    <Text style={styles.heroSubtitle}>
                        Real people, not bots. Our senior-friendly support team is ready to assist.
                    </Text>
                </View>

                {/* Contact Info Bar */}
                <View style={styles.contactBar}>
                    <View style={styles.contactBarItem}>
                        <MaterialIcons name="access-time" size={18} color={theme.colors.primary} />
                        <Text style={styles.contactBarText}>Mon–Sat{'\n'}8am – 9pm</Text>
                    </View>
                    <View style={styles.contactDivider} />
                    <View style={styles.contactBarItem}>
                        <MaterialIcons name="phone" size={18} color={theme.colors.primary} />
                        <Text style={styles.contactBarText}>1800-88{'\n'}SILVER</Text>
                    </View>
                    <View style={styles.contactDivider} />
                    <View style={styles.contactBarItem}>
                        <MaterialIcons name="timer" size={18} color={theme.colors.primary} />
                        <Text style={styles.contactBarText}>Avg wait{'\n'}{'< 2 min'}</Text>
                    </View>
                </View>

                {/* Support Options Grid */}
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <View style={styles.optionsGrid}>
                    {supportOptions.map((opt, i) => (
                        <Pressable
                            key={i}
                            style={({ pressed }) => [styles.optionCard, { backgroundColor: opt.bg }, pressed && styles.cardPressed]}
                            onPress={opt.onPress}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: opt.color }]}>
                                <MaterialIcons name={opt.icon as any} size={28} color={theme.colors.white} />
                            </View>
                            <Text style={[styles.optionTitle, { color: opt.color }]}>{opt.title}</Text>
                            <Text style={styles.optionDetail}>{opt.detail}</Text>
                            <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* FAQ */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                <View style={styles.faqContainer}>
                    {faqData.map((item, i) => (
                        <FaqItem
                            key={i}
                            item={item}
                            isOpen={openFaqIndex === i}
                            onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        />
                    ))}
                </View>

                {/* Emergency Note */}
                <View style={styles.emergencyNote}>
                    <MaterialIcons name="local-hospital" size={22} color="#d32f2f" />
                    <Text style={styles.emergencyText}>
                        For medical emergencies, call{' '}
                        <Text style={styles.emergencyNum}>999</Text>{' '}
                        or{' '}
                        <Text style={styles.emergencyNum}>112</Text>
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
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
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: 16,
        gap: 20,
        paddingBottom: 48,
    },
    hero: {
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 10,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    heroSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: theme.typography.fontFamily.regular,
    },
    contactBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    contactBarItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        gap: 6,
    },
    contactDivider: {
        width: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: 12,
    },
    contactBarText: {
        fontSize: 13,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        width: '47%',
        borderRadius: 16,
        padding: 18,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },
    optionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    optionTitle: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: theme.typography.fontFamily.bold,
    },
    optionDetail: {
        fontSize: 13,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
        fontWeight: '600',
    },
    optionSubtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    faqContainer: {
        gap: 8,
    },
    faqItem: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    faqItemOpen: {
        backgroundColor: `${theme.colors.primary}05`,
        borderColor: 'transparent',
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.semibold,
        lineHeight: 22,
    },
    faqQuestionOpen: {
        color: theme.colors.primary,
    },
    faqAnswer: {
        marginTop: 12,
        fontSize: 15,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
    },
    emergencyNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#ffebee',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ffcdd2',
    },
    emergencyText: {
        flex: 1,
        fontSize: 15,
        color: '#c62828',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    emergencyNum: {
        fontWeight: '800',
        fontSize: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
