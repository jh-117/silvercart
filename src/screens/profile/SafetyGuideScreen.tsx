import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

const tips = [
    {
        id: '1',
        icon: 'lock',
        title: 'Never share your password',
        description: 'Keep your login details private. SilverCart will never ask for your password.',
    },
    {
        id: '2',
        icon: 'phone-disabled',
        title: 'Beware of unknown callers',
        description: 'If someone calls claiming to be from SilverCart, hang up and call our official number.',
    },
    {
        id: '3',
        icon: 'mark-email-unread',
        title: 'Check email addresses carefully',
        description: 'Scammers send fake emails. Always verify the sender before clicking links.',
    },
    {
        id: '4',
        icon: 'credit-card-off',
        title: 'Never pay via unusual methods',
        description: 'SilverCart will never ask for payment via gift cards or wire transfers.',
    },
];

export default function SafetyGuideScreen() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Safety Guide</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>


            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroCard}>
                    <MaterialIcons name="shield" size={64} color={theme.colors.primary} />
                    <Text style={styles.heroTitle}>Stay Safe Online</Text>
                    <Text style={styles.heroDesc}>Follow these tips to protect yourself from scams and fraud.</Text>
                </View>

                {tips.map((tip, index) => (
                    <View key={tip.id} style={styles.tipCard}>
                        <View style={styles.tipNumber}>
                            <Text style={styles.tipNumberText}>{index + 1}</Text>
                        </View>
                        <View style={styles.tipIcon}>
                            <MaterialIcons name={tip.icon as any} size={32} color="#d32f2f" />
                        </View>
                        <View style={styles.tipContent}>
                            <Text style={styles.tipTitle}>{tip.title}</Text>
                            <Text style={styles.tipDesc}>{tip.description}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.contactCard}>
                    <MaterialIcons name="contact-support" size={32} color={theme.colors.primary} />
                    <View style={styles.contactContent}>
                        <Text style={styles.contactTitle}>Suspicious activity?</Text>
                        <Text style={styles.contactDesc}>Contact our support team immediately if you believe you've been targeted by a scam.</Text>
                    </View>
                    <Pressable
                        style={styles.contactButton}
                        onPress={() => navigation.navigate('Support' as any)}
                    >
                        <Text style={styles.contactButtonText}>Report Now</Text>
                    </Pressable>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        paddingRight: 48,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        gap: 24,
        paddingBottom: 120,
    },
    heroCard: {
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        gap: 16,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    heroDesc: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 26,
    },
    tipCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    tipNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    tipIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#ffebee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipContent: {
        flex: 1,
        gap: 6,
    },
    tipTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    tipDesc: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    contactCard: {
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        padding: 24,
        gap: 16,
        marginTop: 16,
    },
    contactContent: {
        gap: 8,
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    contactDesc: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    contactButton: {
        backgroundColor: theme.colors.white,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    contactButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
});

