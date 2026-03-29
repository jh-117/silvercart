import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import * as Notifications from 'expo-notifications';
import { useToast } from '../../hooks/useToast';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface TrustedContact {
    id: string;
    full_name: string;
    phone_number: string;
    relationship: string;
}

export default function TrustedContactScreen() {
    const navigation = useNavigation<any>();
    const { user } = useContext(AuthContext);
    const toast = useToast();
    const [contacts, setContacts] = useState<TrustedContact[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const fetchContacts = async () => {
                if (!user?.id) return;
                setLoading(true);
                const { data, error } = await supabase
                    .from('trusted_contacts')
                    .select('id, full_name, phone_number, relationship')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });
                if (!error && data) setContacts(data);
                setLoading(false);
            };
            fetchContacts();
        }, [user?.id])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Remove Contact', `Are you sure you want to remove ${name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    await supabase.from('trusted_contacts').delete().eq('id', id);
                    setContacts(prev => prev.filter(c => c.id !== id));
                }
            }
        ]);
    };

    const handleTestNotification = async (contactName: string) => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Turn On Notifications', 'Please go to your phone settings to allow SilverCart to send you updates.');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'SilverCart Test Alert 🚨',
                body: `This is a mock. In reality, ${contactName} would receive this exact push notification on their device.`,
                sound: true,
            },
            trigger: null, // send immediately
        });

        toast.showSuccess(`Test push notification dispatched!`);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <MaterialIcons name="chevron-left" size={32} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Trusted Contact</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : contacts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="group-off" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No Trusted Contacts Yet</Text>
                        <Text style={styles.emptySubtitle}>Add a family member or caregiver who can help monitor your orders.</Text>
                        <Pressable
                            style={({ pressed }) => [styles.addPrimaryButton, pressed && styles.buttonPressed]}
                            onPress={() => navigation.navigate('AddTrustedContact')}
                        >
                            <MaterialIcons name="person-add" size={24} color={theme.colors.white} />
                            <Text style={styles.addPrimaryButtonText}>Add Trusted Contact</Text>
                        </Pressable>
                    </View>
                ) : (
                    contacts.map((contact, index) => {
                        const firstName = contact.full_name.split(' ')[0] || contact.full_name;

                        return (
                            <View key={contact.id} style={styles.contactWrapper}>
                                {/* Contact Card */}
                                <View style={styles.contactCard}>
                                    <View style={styles.avatarMain}>
                                        <MaterialIcons name="person" size={56} color={theme.colors.primary} />
                                    </View>
                                    <View style={styles.contactHeaderInfo}>
                                        {index === 0 && <Text style={styles.primaryContactLabel}>PRIMARY CONTACT</Text>}
                                        <Text style={styles.contactNameMain}>{contact.full_name}</Text>
                                        <Text style={styles.contactRelationMain}>{contact.relationship}</Text>
                                    </View>
                                </View>

                                {/* Permissions Section */}
                                <View style={styles.permissionsContainer}>
                                    <View style={styles.permissionsHeader}>
                                        <MaterialIcons name="security-update-good" size={24} color={theme.colors.primary} />
                                        <Text style={styles.permissionsTitle}>Permissions</Text>
                                    </View>
                                    <View style={styles.permissionsBox}>
                                        <Pressable style={styles.permissionRow}>
                                            <View style={styles.permissionTextContainer}>
                                                <Text style={styles.permissionLabel}>Order updates</Text>
                                                <Text style={styles.permissionSubtitle}>{firstName} will see your shopping progress</Text>
                                            </View>
                                            <MaterialIcons name="check-box" size={32} color={theme.colors.primary} />
                                        </Pressable>
                                        <View style={styles.permissionDivider} />
                                        <Pressable style={styles.permissionRow}>
                                            <View style={styles.permissionTextContainer}>
                                                <Text style={styles.permissionLabel}>Security alerts</Text>
                                                <Text style={styles.permissionSubtitle}>Alerts for unusual account activity</Text>
                                            </View>
                                            <MaterialIcons name="check-box" size={32} color={theme.colors.primary} />
                                        </Pressable>
                                    </View>
                                </View>

                                {/* Reassurance Text */}
                                <View style={styles.reassuranceBox}>
                                    <MaterialIcons name="info" size={20} color={theme.colors.primary} />
                                    <Text style={styles.reassuranceText}>
                                        {firstName} will be notified immediately if we notice any unusual activity on your account.
                                    </Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionButtonsContainer}>
                                    <Pressable
                                        style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressedOpacity]}
                                        onPress={() => navigation.navigate('EditTrustedContact', { contactId: contact.id })}
                                    >
                                        <MaterialIcons name="edit" size={24} color={theme.colors.white} />
                                        <Text style={styles.editButtonText}>Edit Contact Details</Text>
                                    </Pressable>

                                    <Pressable
                                        style={({ pressed }) => [styles.testNotificationButton, pressed && styles.buttonPressedOpacity]}
                                        onPress={() => handleTestNotification(contact.full_name)}
                                    >
                                        <MaterialIcons name="notifications-active" size={24} color={theme.colors.primary} />
                                        <Text style={styles.testNotificationText}>Test Notification</Text>
                                    </Pressable>

                                    {/* Add new / Remove layout */}
                                    {index === contacts.length - 1 && (
                                        <View style={styles.footerActionsRow}>
                                            {contacts.length < 2 && (
                                                <Pressable
                                                    style={styles.addAnotherButton}
                                                    onPress={() => navigation.navigate('AddTrustedContact')}
                                                >
                                                    <MaterialIcons name="add" size={20} color={theme.colors.primary} />
                                                    <Text style={styles.addAnotherText}>Add Another</Text>
                                                </Pressable>
                                            )}
                                            <Pressable
                                                style={styles.removeButton}
                                                onPress={() => handleDelete(contact.id, contact.full_name)}
                                            >
                                                <MaterialIcons name="delete-outline" size={20} color="#d32f2f" />
                                                <Text style={styles.removeButtonText}>Remove</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}

                {contacts.length > 0 && (
                    <View style={styles.footerTextContainer}>
                        <Text style={styles.footerText}>Trusted Assistant Settings • SilverCart</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f3f1',
    },
    header: {
        backgroundColor: '#f4f3f1',
        shadowColor: '#156979',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 24,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 16,
        paddingHorizontal: 16,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 22,
    },
    contactWrapper: {
        gap: 24,
        marginBottom: 8,
    },
    contactCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: `${theme.colors.primary}15`,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 3,
    },
    avatarMain: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: `${theme.colors.primary}10`,
        borderWidth: 4,
        borderColor: `${theme.colors.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    contactHeaderInfo: {
        alignItems: 'center',
        gap: 4,
    },
    primaryContactLabel: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    contactNameMain: {
        fontSize: 28,
        fontWeight: '900',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
    },
    contactRelationMain: {
        fontSize: 18,
        fontWeight: '500',
        color: '#666',
        fontFamily: theme.typography.fontFamily.medium,
    },
    permissionsContainer: {
        gap: 12,
    },
    permissionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 4,
    },
    permissionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
    },
    permissionsBox: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 3,
        overflow: 'hidden',
    },
    permissionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    permissionDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
    },
    permissionTextContainer: {
        flex: 1,
        paddingRight: 16,
        gap: 4,
    },
    permissionLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
    },
    permissionSubtitle: {
        fontSize: 14,
        color: '#666',
        fontFamily: theme.typography.fontFamily.regular,
    },
    reassuranceBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: `${theme.colors.primary}0D`,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}1A`,
    },
    reassuranceText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.medium,
        lineHeight: 22,
    },
    actionButtonsContainer: {
        gap: 16,
        marginTop: 4,
    },
    editButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 60,
        borderRadius: 16,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    editButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        fontFamily: theme.typography.fontFamily.bold,
    },
    testNotificationButton: {
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        height: 60,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}33`,
    },
    testNotificationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121617',
        fontFamily: theme.typography.fontFamily.bold,
    },
    footerActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        marginTop: 8,
    },
    addAnotherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    addAnotherText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: 8,
    },
    removeButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#d32f2f',
        fontFamily: theme.typography.fontFamily.bold,
    },
    footerTextContainer: {
        alignItems: 'center',
        paddingTop: 8,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#999',
        fontFamily: theme.typography.fontFamily.medium,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    buttonPressedOpacity: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    addPrimaryButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addPrimaryButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});

