import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const SAFETY_TIPS = [
    "SilverCart will NEVER ask you for your 6-digit OTP code.",
    "Only pay cash to our verified delivery partners wearing ID badges.",
    "Beware of fake WhatsApp messages. We only contact you via official channels.",
    "Check your prescription expiry dates regularly.",
    "Never send money to personal bank accounts."
];

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { profile } = useAuth();

    const [currentTip, setCurrentTip] = React.useState(SAFETY_TIPS[0]);

    React.useEffect(() => {
        // Pick a random tip on mount
        const randomTip = SAFETY_TIPS[Math.floor(Math.random() * SAFETY_TIPS.length)];
        setCurrentTip(randomTip);

        // Rotate tip every 10 seconds
        const interval = setInterval(() => {
            setCurrentTip((prev) => {
                const currentIndex = SAFETY_TIPS.indexOf(prev);
                const nextIndex = (currentIndex + 1) % SAFETY_TIPS.length;
                return SAFETY_TIPS[nextIndex];
            });
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleSpeakPress = () => {
        navigation.navigate('VoiceSearch');
    };

    const handlePharmacyPress = () => {
        navigation.navigate('Category', { category: 'pharmacy' });
    };

    const handleGroceriesPress = () => {
        navigation.navigate('Category', { category: 'grocery' });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.brandContainer}>
                    <View style={styles.logoBox}>
                        <MaterialIcons name="shield" size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.brandText}>SilverCart</Text>
                </View>
                <Pressable style={styles.profileButton} onPress={() => navigation.navigate('Profile')} hitSlop={12}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.headerAvatar} />
                    ) : (
                        <MaterialIcons name="account-circle" size={32} color={theme.colors.textMain} />
                    )}
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Trust Badge */}
                <View style={styles.trustBadgeContainer}>
                    <View style={styles.trustBadge}>
                        <MaterialIcons name="verified" size={20} color={theme.colors.primary} />
                        <Text style={styles.trustText}>Licensed Pharmacy</Text>
                    </View>
                </View>

                {/* Headline */}
                <View style={styles.headlineContainer}>
                    <Text style={styles.headline}>How can I help you today?</Text>
                </View>

                {/* FAB/Voice Command Hub */}
                <View style={styles.voiceContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.voiceButton,
                            pressed && styles.voiceButtonPressed
                        ]}
                        onPress={handleSpeakPress}
                    >
                        <View style={styles.micCircle}>
                            <MaterialIcons name="mic" size={64} color={theme.colors.white} />
                        </View>
                        <View style={styles.tapLabelContainer}>
                            <Text style={styles.tapLabel}>Tap to speak</Text>
                        </View>
                    </Pressable>
                </View>

                {/* Action Cards Grid */}
                <View style={styles.gridContainer}>
                    {/* Pharmacy Card */}
                    <Pressable style={styles.card} onPress={handlePharmacyPress}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwIUY2hmB14fVfLSZERBY_WR7OI4bqTpNPl_M2V2uFXmg5h2jODomFk2nFyXqSxT9WKeKsEkxvvX1QyuNSrb82rK6zlrmIdEHy5AAWUgfhm7vuPhyBl0kpgDXjCCKYVx0aYmzag-cuLOwgmrzaPsz2x5VqQAFjCE9s_5s8-OD7zE_TqYGwDWklljH1q56ZZ31KuLB7Hk6CnIvsfrjr-2-mWvA9_RL9yloTh65yyedzjGjwsJEV_w3yqsFUWI5Bewinz_rgaeJiN-4' }}
                            style={styles.cardImage}
                        />
                        <View style={styles.cardOverlay} />
                        <View style={styles.cardContent}>
                            <MaterialIcons name="medication" size={32} color={theme.colors.white} style={styles.cardIcon} />
                            <Text style={styles.cardTitle}>Pharmacy</Text>
                        </View>
                    </Pressable>

                    {/* Groceries Card */}
                    <Pressable style={styles.card} onPress={handleGroceriesPress}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9i_vez22eG7YDqokNi6Jun8w47DSqoYl9OMLFMWm5GxAgmw92_dSDNj6zaora_x2aIExWU98D266PbU1JXHwClsI5mvi3i1CYJjildHeqp6zIJ5QsGds1RXt1zWynoACxqIlgRB_7H68Eg45nYOzhnsq6ms8RGdu6uWZa4J0uQ41C7Dq_9czsbujuJ7MkC_AhRU8SDZv2AigI79txhuloQt5XCgl-QuoIQ8dcLCAGJrZD0YZuP7m9-NnA6M0ly8AC6UY9LeqU508' }}
                            style={styles.cardImage}
                        />
                        <View style={styles.cardOverlay} />
                        <View style={styles.cardContent}>
                            <MaterialIcons name="shopping-basket" size={32} color={theme.colors.white} style={styles.cardIcon} />
                            <Text style={styles.cardTitle}>Groceries</Text>
                        </View>
                    </Pressable>
                </View>

                {/* Safety Tip Banner */}
                <View style={styles.safetyTipContainer}>
                    <View style={styles.safetyTip}>
                        <MaterialIcons name="info" size={28} color="#1976D2" />
                        <View style={styles.safetyTextContainer}>
                            <Text style={styles.safetyTitle}>Safety Tip</Text>
                            <Text style={styles.safetyDescription}>{currentTip}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
        backgroundColor: theme.colors.background,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: `${theme.colors.primary}1A`, // 10% opacity
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandText: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    profileButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        overflow: 'hidden', // Add hidden overflow so Image respects border radius
    },
    headerAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    scrollContent: {
        paddingBottom: 120, // Space for bottom tab bar
    },
    trustBadgeContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.trustGreen,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}33`, // 20% opacity
    },
    trustText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: theme.typography.fontFamily.bold,
    },
    headlineContainer: {
        paddingHorizontal: 16,
        paddingTop: 32,
        paddingBottom: 16,
    },
    headline: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.textMain,
        lineHeight: 40,
        fontFamily: theme.typography.fontFamily.bold,
    },
    voiceContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    voiceButton: {
        alignItems: 'center',
        gap: 16,
    },
    voiceButtonPressed: {
        transform: [{ scale: 0.95 }],
    },
    micCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 8,
        borderColor: theme.colors.white,
    },
    tapLabelContainer: {
        backgroundColor: theme.colors.white,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: theme.colors.backgroundLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tapLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    gridContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 20,
        paddingBottom: 32,
    },
    card: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
        width: undefined,
        height: undefined,
        resizeMode: 'cover',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        // Gradient simulation: darker at bottom
    },
    cardContent: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
    },
    cardIcon: {
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    safetyTipContainer: {
        paddingHorizontal: 16,
    },
    safetyTip: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#E3F2FD', // Blue-50
        borderLeftWidth: 8,
        borderLeftColor: '#2196F3', // Blue-500
        borderRadius: 16,
        padding: 24,
    },
    safetyTextContainer: {
        flex: 1,
        gap: 4,
    },
    safetyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0D47A1', // Blue-900
        fontFamily: theme.typography.fontFamily.bold,
    },
    safetyDescription: {
        fontSize: 18,
        color: '#1565C0', // Blue-800
        lineHeight: 24,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
