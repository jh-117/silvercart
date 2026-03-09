import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
    const navigation = useNavigation();

    const sections = [
        {
            title: '1. Information We Collect',
            icon: 'info-outline',
            content: 'We collect information you provide when you register, including your name, email address, phone number, and delivery address. We also collect order history and payment method details (stored securely — we never store full card numbers).',
        },
        {
            title: '2. How We Use Your Information',
            icon: 'how-to-reg',
            content: 'We use your information to:\n• Process and deliver your orders\n• Send order updates and delivery notifications\n• Improve our service and recommend products\n• Provide you with customer support\n• Comply with legal and regulatory requirements',
        },
        {
            title: '3. Sharing Your Information',
            icon: 'share',
            content: 'We do NOT sell your personal data. We only share your information with:\n• Delivery partners (to fulfil your orders)\n• Payment processors (for secure transactions)\n• Government or regulatory bodies (only when legally required)',
        },
        {
            title: '4. Data Security',
            icon: 'security',
            content: 'Your data is protected with industry-standard SSL encryption. Sensitive information such as passwords is hashed and never stored in plain text. We regularly audit our systems for security vulnerabilities.',
        },
        {
            title: '5. Your Rights',
            icon: 'verified-user',
            content: 'You have the right to:\n• Access your personal data\n• Request correction of inaccurate data\n• Request deletion of your account and data\n• Withdraw consent for marketing messages at any time\n\nTo exercise these rights, contact us at privacy@silvercart.my',
        },
        {
            title: '6. Cookies',
            icon: 'cookie',
            content: 'We use cookies to keep you logged in and to understand how you use our app. You can clear cookies at any time via your device settings. Essential cookies are required for the app to function properly.',
        },
        {
            title: '7. Changes to This Policy',
            icon: 'update',
            content: 'We may update this Privacy Policy from time to time. When we do, we will notify you via the app or email. Continued use of SilverCart after changes means you accept the updated policy.',
        },
        {
            title: '8. Contact Us',
            icon: 'contact-support',
            content: 'If you have questions about this Privacy Policy, please contact us:\n\nEmail: privacy@silvercart.my\nPhone: 1800-88-SILVER\nAddress: SilverCart Sdn Bhd, Level 15, Menara SilverTech, Kuala Lumpur, 50450',
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
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <View style={styles.heroIcon}>
                        <MaterialIcons name="shield" size={40} color={theme.colors.white} />
                    </View>
                    <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                    <Text style={styles.heroSubtitle}>
                        SilverCart is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data.
                    </Text>
                    <Text style={styles.lastUpdated}>Last updated: February 2026</Text>
                </View>

                {/* Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIconBox}>
                                <MaterialIcons name={section.icon as any} size={22} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                {/* Contact Card */}
                <Pressable
                    style={styles.contactCard}
                    onPress={() => Linking.openURL('mailto:privacy@silvercart.my')}
                >
                    <MaterialIcons name="email" size={28} color={theme.colors.primary} />
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.contactTitle}>Questions about your privacy?</Text>
                        <Text style={styles.contactSubtitle}>privacy@silvercart.my</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
                </Pressable>
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
        gap: 16,
        paddingBottom: 48,
    },
    heroBanner: {
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}25`,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 24,
    },
    lastUpdated: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        fontStyle: 'italic',
    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sectionIconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        flex: 1,
    },
    sectionContent: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 26,
    },
    contactCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: `${theme.colors.primary}30`,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    contactSubtitle: {
        fontSize: 15,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 2,
    },
});
