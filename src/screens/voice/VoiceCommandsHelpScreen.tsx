import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';

export default function VoiceCommandsHelpScreen() {
    const navigation = useNavigation<any>();

    const commands = [
        {
            icon: 'search',
            title: 'Find Products',
            examples: [
                '"Find Panadol"',
                '"Show me some milk"',
                '"I need to buy rice"'
            ]
        },
        {
            icon: 'add-shopping-cart',
            title: 'Add to Cart',
            examples: [
                '"Add paracetamol to my cart"',
                '"I want to buy 2 bottles of cooking oil"',
                '"Add milk and bread"'
            ]
        },
        {
            icon: 'remove-shopping-cart',
            title: 'Remove from Cart',
            examples: [
                '"Take the milk out of my cart"',
                '"Remove Panadol from my checkout"'
            ]
        },
        {
            icon: 'payment',
            title: 'Fast Checkout',
            examples: [
                '"I want to check out"',
                '"I am ready to pay"',
                '"Checkout now"'
            ]
        },
        {
            icon: 'explore',
            title: 'Navigate the App',
            examples: [
                '"Show my cart"',
                '"Open my orders"',
                '"Take me to my profile"',
                '"Show my favorite items"',
                '"Show my daily alarms"'
            ]
        },
        {
            icon: 'phone-in-talk',
            title: 'Call Contacts / Emergency',
            examples: [
                '"Call my son"',
                '"Call my daughter"',
                '"I need to call an emergency"'
            ]
        }
    ];

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>What can I say?</Text>
                    <View style={styles.iconButton} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.introCard}>
                        <View style={styles.introIconBox}>
                            <MaterialIcons name="graphic-eq" size={32} color={theme.colors.white} />
                        </View>
                        <Text style={styles.introTitle}>Voice Assistant Details</Text>
                        <Text style={styles.introText}>
                            Tap the microphone button at the bottom right of your screen and speak naturally. Our AI will automatically figure out what you want!
                        </Text>
                    </View>

                    <Text style={styles.sectionHeader}>Try these commands:</Text>

                    <View style={styles.grid}>
                        {commands.map((cmd, idx) => (
                            <View key={idx} style={styles.commandCard}>
                                <View style={styles.commandHeader}>
                                    <View style={styles.circleIcon}>
                                        <MaterialIcons name={cmd.icon as any} size={24} color={theme.colors.primary} />
                                    </View>
                                    <Text style={styles.commandTitle}>{cmd.title}</Text>
                                </View>
                                <View style={styles.examplesList}>
                                    {cmd.examples.map((ex, j) => (
                                        <Text key={j} style={styles.exampleText}>• {ex}</Text>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }}/>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    iconButton: {
        width: 48, height: 48, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    headerTitle: {
        fontSize: 20, fontWeight: '700', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollContent: { padding: 16 },
    introCard: {
        backgroundColor: `${theme.colors.primary}15`,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}30`,
    },
    introIconBox: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16
    },
    introTitle: { fontSize: 22, fontWeight: '700', color: theme.colors.primary, marginBottom: 8, fontFamily: theme.typography.fontFamily.bold },
    introText: { fontSize: 16, color: theme.colors.textPrimary, textAlign: 'center', lineHeight: 24, fontFamily: theme.typography.fontFamily.medium },
    sectionHeader: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 16, fontFamily: theme.typography.fontFamily.bold },
    grid: { gap: 16 },
    commandCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    commandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    circleIcon: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: `${theme.colors.primary}10`,
        justifyContent: 'center', alignItems: 'center'
    },
    commandTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    examplesList: { gap: 8, paddingLeft: 60 },
    exampleText: { fontSize: 16, color: theme.colors.textMuted, fontStyle: 'italic', fontFamily: theme.typography.fontFamily.medium }
});
