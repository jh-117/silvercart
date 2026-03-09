import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import CustomSwitch from '../../components/ui/CustomSwitch';
import CustomAlert from '../../components/ui/CustomAlert';
import { useAppSettings } from '../../contexts/AppSettingsContext';

export default function AppSettingsScreen() {
    const navigation = useNavigation();
    const { settings, loading, updateSettings } = useAppSettings();
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    if (loading || !settings) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const textSizeLabels = ['Small', 'Medium', 'Large', 'Extra Large'];
    const textSizeMap: ('small' | 'medium' | 'large' | 'xl')[] = ['small', 'medium', 'large', 'xl'];
    const currentTextSizeIdx = textSizeMap.indexOf(settings.text_size);

    const handleTextSizeChange = (index: number) => {
        updateSettings({ text_size: textSizeMap[index] });
    };

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
                    <Text style={styles.headerTitle}>App & Accessibility</Text>
                    <Pressable
                        style={styles.doneButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.doneText}>Done</Text>
                    </Pressable>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Language Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="language" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Language</Text>
                    </View>
                    <View style={styles.card}>
                        <Pressable
                            style={[
                                styles.languageOption,
                                { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }
                            ]}
                            onPress={() => updateSettings({ language: 'en' })}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.languageTitle}>English (EN)</Text>
                                <Text style={styles.languageSubtitle}>Standard interface language</Text>
                            </View>
                            <View style={[styles.radio, settings.language === 'en' && styles.radioSelected]}>
                                {settings.language === 'en' && <View style={styles.radioInner} />}
                            </View>
                        </Pressable>
                        <Pressable
                            style={styles.languageOption}
                            onPress={() => updateSettings({ language: 'bm' })}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.languageTitle}>Bahasa Malaysia (BM)</Text>
                                <Text style={styles.languageSubtitle}>Bahasa kebangsaan</Text>
                            </View>
                            <View style={[styles.radio, settings.language === 'bm' && styles.radioSelected]}>
                                {settings.language === 'bm' && <View style={styles.radioInner} />}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Notifications Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="notifications-active" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Notifications</Text>
                    </View>
                    <View style={styles.card}>
                        <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }]}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>Push Notifications</Text>
                                <Text style={styles.toggleSubtitle}>Get delivery updates on your lock screen</Text>
                            </View>
                            <CustomSwitch
                                value={settings.push_notifications_enabled}
                                onValueChange={(val) => updateSettings({ push_notifications_enabled: val })}
                            />
                        </View>
                        <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight }]}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>Email Updates</Text>
                                <Text style={styles.toggleSubtitle}>Monthly newsletters and special discounts</Text>
                            </View>
                            <CustomSwitch
                                value={settings.email_notifications_enabled}
                                onValueChange={(val) => updateSettings({ email_notifications_enabled: val })}
                            />
                        </View>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>SMS Alerts</Text>
                                <Text style={styles.toggleSubtitle}>Urgent order and account security alerts</Text>
                            </View>
                            <CustomSwitch
                                value={settings.sms_notifications_enabled}
                                onValueChange={(val) => updateSettings({ sms_notifications_enabled: val })}
                            />
                        </View>
                    </View>
                </View>

                {/* Accessibility Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="text-fields" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Accessibility</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.textSizeLabel}>Text Size</Text>
                        <View style={styles.sliderContainer}>
                            <MaterialIcons name="text-fields" size={16} color={theme.colors.textMuted} />
                            <View style={styles.sliderTrack}>
                                {[0, 1, 2, 3].map((index) => (
                                    <Pressable
                                        key={index}
                                        style={styles.sliderDot}
                                        onPress={() => handleTextSizeChange(index)}
                                    >
                                        <View style={[
                                            styles.sliderDotInner,
                                            currentTextSizeIdx === index && styles.sliderDotActive
                                        ]} />
                                    </Pressable>
                                ))}
                            </View>
                            <MaterialIcons name="text-fields" size={32} color={theme.colors.textMuted} />
                        </View>
                        <View style={styles.textSizeLabels}>
                            {textSizeLabels.map((label, index) => (
                                <Text
                                    key={index}
                                    style={[
                                        styles.textSizeLabelText,
                                        currentTextSizeIdx === index && styles.textSizeLabelActive
                                    ]}
                                >
                                    {label}
                                </Text>
                            ))}
                        </View>
                        <View style={styles.previewCard}>
                            <Text style={[styles.previewText, { fontSize: 14 + (currentTextSizeIdx * 4) }]}>
                                "This is how your text will look. Larger text makes reading easier."
                            </Text>
                        </View>

                        {/* High Contrast Toggle */}
                        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>High Contrast Mode</Text>
                                <Text style={styles.toggleSubtitle}>Increase text visibility and color contrast</Text>
                            </View>
                            <CustomSwitch
                                value={settings.high_contrast_mode}
                                onValueChange={(val) => updateSettings({ high_contrast_mode: val })}
                            />
                        </View>

                        {/* Voice Feedback Toggle */}
                        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: theme.colors.borderLight }]}>
                            <View style={styles.toggleInfo}>
                                <Text style={styles.toggleTitle}>Voice Feedback</Text>
                                <Text style={styles.toggleSubtitle}>Read screen selections aloud</Text>
                            </View>
                            <CustomSwitch
                                value={settings.voice_feedback_enabled}
                                onValueChange={(val) => updateSettings({ voice_feedback_enabled: val })}
                            />
                        </View>

                        {/* Open System Accessibility */}
                        <Pressable
                            style={({ pressed }) => [styles.accessibilityButton, pressed && styles.buttonPressed]}
                            onPress={() => Linking.openSettings()}
                        >
                            <MaterialIcons name="open-in-new" size={22} color={theme.colors.white} />
                            <Text style={styles.accessibilityButtonText}>Open Phone Accessibility Settings</Text>
                        </Pressable>
                        <Text style={styles.accessibilityNote}>
                            💡 For app-wide text size, use your phone's built-in accessibility settings. SilverCart automatically respects your device font size.
                        </Text>
                    </View>
                </View>

                {/* Privacy & Data */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="security" size={24} color={theme.colors.primary} />
                        <Text style={styles.sectionTitle}>Privacy & Data</Text>
                    </View>
                    <View style={styles.card}>
                        <Pressable
                            style={styles.languageOption}
                            onPress={() => (navigation as any).navigate('PrivacyPolicy')}
                        >
                            <View style={styles.languageInfo}>
                                <Text style={styles.languageTitle}>Privacy Policy</Text>
                                <Text style={styles.languageSubtitle}>Read our privacy policy</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
                        </Pressable>
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="warning" size={24} color="#d32f2f" />
                        <Text style={[styles.sectionTitle, { color: '#d32f2f' }]}>Danger Zone</Text>
                    </View>
                    <View style={styles.dangerCard}>
                        <Text style={styles.dangerText}>
                            Deleting your account will permanently remove all your order history, saved addresses, and loyalty points. This action cannot be undone.
                        </Text>
                        <Pressable
                            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
                            onPress={() => setShowDeleteAlert(true)}
                        >
                            <MaterialIcons name="delete-forever" size={24} color={theme.colors.white} />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.versionText}>SilverCart Version 2.4.0 (Build 892)</Text>
                </View>
            </ScrollView>

            {/* Custom Delete Confirmation Dialog */}
            <CustomAlert
                visible={showDeleteAlert}
                title="Delete Account?"
                message="This will permanently remove all your order history, saved addresses, and loyalty points. This action cannot be undone."
                icon="warning"
                buttons={[
                    { text: 'Cancel', style: 'cancel', onPress: () => setShowDeleteAlert(false) },
                    { text: 'Delete', style: 'destructive', onPress: () => setShowDeleteAlert(false) },
                ]}
                onDismiss={() => setShowDeleteAlert(false)}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingVertical: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    doneButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    doneText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 32,
        paddingBottom: 120,
    },
    section: {
        gap: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    languageInfo: {
        flex: 1,
        gap: 4,
    },
    languageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    languageSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: theme.colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        minHeight: 72,
    },
    toggleInfo: {
        flex: 1,
        gap: 4,
        paddingRight: 16,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    toggleSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 20,
    },
    textSizeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        padding: 20,
        paddingBottom: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 16,
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    sliderDot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderDotInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.borderLight,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    sliderDotActive: {
        backgroundColor: theme.colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    textSizeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginTop: 16,
    },
    textSizeLabelText: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    textSizeLabelActive: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    previewCard: {
        margin: 20,
        marginTop: 24,
        padding: 16,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 12,
    },
    previewText: {
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    dangerCard: {
        backgroundColor: '#ffebee',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ffcdd2',
        gap: 20,
    },
    dangerText: {
        fontSize: 14,
        color: '#b71c1c',
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#d32f2f',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: 32,
    },
    accessibilityButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.primary,
        marginHorizontal: 20,
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 12,
    },
    accessibilityButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    accessibilityNote: {
        fontSize: 13,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 20,
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 8,
    },
});
