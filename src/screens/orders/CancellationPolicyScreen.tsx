import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function CancellationPolicyScreen() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Cancellation Policy</Text>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <MaterialIcons name="info-outline" size={32} color={theme.colors.primary} style={styles.icon} />
                    <Text style={styles.title}>Our Policy</Text>
                    <Text style={styles.text}>
                        1. <Text style={styles.bold}>1-Hour Window:</Text> You can cancel any order within 1 hour of placement for a full refund without questions.
                    </Text>
                    <Text style={styles.text}>
                        2. <Text style={styles.bold}>Discounts & Coupons:</Text> If an order is cancelled, any single-use discounts or coupons applied to that order will be forfeited and cannot be recovered.
                    </Text>
                    <Text style={styles.text}>
                        3. <Text style={styles.bold}>Processing Orders:</Text> Once an order begins processing at our facility (typically after the 1-hour window), it cannot be cancelled via the app. You must contact Support directly.
                    </Text>
                    <Text style={styles.text}>
                        4. <Text style={styles.bold}>Refunds:</Text> Approved cancellations will result in refunds issued to the original payment method within 3-5 business days.
                    </Text>
                </View>

                <Pressable style={styles.supportButton} onPress={() => (navigation as any).navigate('Support')}>
                    <Text style={styles.supportButtonText}>Contact Support</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
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
        borderRadius: 24,
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
    content: {
        padding: 24,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 24,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    icon: {
        marginBottom: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    text: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
    },
    supportButton: {
        marginTop: 32,
        backgroundColor: `${theme.colors.primary}15`,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    supportButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
