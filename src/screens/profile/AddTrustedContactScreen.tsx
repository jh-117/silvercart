import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';

const relationships = [
    { label: 'Choose relationship', value: '' },
    { label: 'Son / Daughter', value: 'son-daughter' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Friend', value: 'friend' },
    { label: 'Caregiver', value: 'caregiver' },
    { label: 'Other', value: 'other' },
];

function normalizeMalaysiaPhone(rawPhone: string): string | null {
    const cleaned = rawPhone.trim().replace(/[^\d+]/g, '');
    if (!cleaned) return null;
    if (cleaned.startsWith('+60')) return cleaned;
    if (cleaned.startsWith('60')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+6${cleaned}`;
    // Fallback for numbers entered without leading 0, e.g. 11934...
    if (/^\d+$/.test(cleaned)) return `+60${cleaned}`;
    return null;
}

export default function AddTrustedContactScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const isSetupFlow = route.params?.isSetupFlow === true;
    const { user, setHasCompletedSetup } = useContext(AuthContext);

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [relationship, setRelationship] = useState('');
    const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);
    const [notifyNewOrders, setNotifyNewOrders] = useState(true);
    const [notifyDelivery, setNotifyDelivery] = useState(true);
    const [notifySecurity, setNotifySecurity] = useState(true);
    const [saving, setSaving] = useState(false);

    const finishSetup = () => {
        if (isSetupFlow) {
            setHasCompletedSetup(true);
        } else {
            navigation.goBack();
        }
    };

    const handleSave = async () => {
        if (!fullName || !phoneNumber || !relationship) {
            Alert.alert('Missing Info', 'Please fill in all required fields.');
            return;
        }
        const normalizedPhone = normalizeMalaysiaPhone(phoneNumber);
        if (!normalizedPhone) {
            Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
            return;
        }
        if (!user) return;

        setSaving(true);
        try {
            // Check current count
            const { count, error: countError } = await supabase
                .from('trusted_contacts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (countError) throw countError;
            if (count && count >= 2) {
                Alert.alert('Limit Reached', 'You can only have a maximum of 2 trusted contacts.');
                return;
            }

            const { error } = await supabase
                .from('trusted_contacts')
                .insert({
                    user_id: user.id,
                    full_name: fullName,
                    phone_number: normalizedPhone,
                    relationship,
                    notify_new_orders: notifyNewOrders,
                    notify_delivery: notifyDelivery,
                    notify_security: notifySecurity,
                });

            if (error) throw error;

            if (isSetupFlow) {
                Alert.alert('All set!', 'Your trusted contact has been saved.', [
                    { text: 'Continue', onPress: finishSetup },
                ]);
            } else {
                Alert.alert('Saved', 'Trusted contact added successfully.');
                navigation.goBack();
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to save contact.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = () => {
        finishSetup();
    };

    const selectedRelationship = relationships.find(r => r.value === relationship);

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
                    <Text style={styles.headerTitle}>Add Trusted Contact</Text>
                    <View style={{ width: 48 }} />
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Instructional Header */}
                <View style={styles.instructionSection}>
                    <Text style={styles.instructionTitle}>
                        Add someone you trust to help manage your orders.
                    </Text>
                    <Text style={styles.instructionDescription}>
                        They will be able to receive notifications and help with your deliveries.
                    </Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Full Name Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter full name"
                            placeholderTextColor={theme.colors.textMuted}
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>

                    {/* Phone Number Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            placeholderTextColor={theme.colors.textMuted}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Relationship Dropdown */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Relationship</Text>
                        <Pressable
                            style={styles.pickerButton}
                            onPress={() => setShowRelationshipPicker(true)}
                        >
                            <Text style={[styles.pickerText, !relationship && styles.placeholder]}>
                                {selectedRelationship ? selectedRelationship.label : 'Choose relationship'}
                            </Text>
                            <MaterialIcons name="unfold-more" size={24} color={theme.colors.textMuted} />
                        </Pressable>
                    </View>

                    <View style={styles.divider} />

                    {/* Notification Preferences */}
                    <View style={styles.notificationSection}>
                        <Text style={styles.notificationTitle}>
                            What should they be notified about?
                        </Text>

                        <Pressable
                            style={styles.checkboxRow}
                            onPress={() => setNotifyNewOrders(!notifyNewOrders)}
                        >
                            <View style={[styles.checkbox, notifyNewOrders && styles.checkboxChecked]}>
                                {notifyNewOrders && (
                                    <MaterialIcons name="check" size={20} color={theme.colors.white} />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>New order placements</Text>
                        </Pressable>

                        <Pressable
                            style={styles.checkboxRow}
                            onPress={() => setNotifyDelivery(!notifyDelivery)}
                        >
                            <View style={[styles.checkbox, notifyDelivery && styles.checkboxChecked]}>
                                {notifyDelivery && (
                                    <MaterialIcons name="check" size={20} color={theme.colors.white} />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Delivery status updates</Text>
                        </Pressable>

                        <Pressable
                            style={styles.checkboxRow}
                            onPress={() => setNotifySecurity(!notifySecurity)}
                        >
                            <View style={[styles.checkbox, notifySecurity && styles.checkboxChecked]}>
                                {notifySecurity && (
                                    <MaterialIcons name="check" size={20} color={theme.colors.white} />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>Security alerts</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Relationship Picker Modal */}
            <Modal
                visible={showRelationshipPicker}
                transparent
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Relationship</Text>
                            <Pressable onPress={() => setShowRelationshipPicker(false)}>
                                <MaterialIcons name="close" size={28} color={theme.colors.textPrimary} />
                            </Pressable>
                        </View>
                        <ScrollView>
                            {relationships.map((item) => (
                                <Pressable
                                    key={item.value}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setRelationship(item.value);
                                        setShowRelationshipPicker(false);
                                    }}
                                >
                                    <Text style={styles.modalItemText}>{item.label}</Text>
                                    {relationship === item.value && (
                                        <MaterialIcons name="check" size={24} color={theme.colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Footer Action Button */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.saveButton,
                        pressed && styles.buttonPressed
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={theme.colors.white} />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Contact</Text>
                    )}
                </Pressable>
                {isSetupFlow && (
                    <Pressable style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                    </Pressable>
                )}
            </SafeAreaView>
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
        paddingVertical: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundLight,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 24,
    },
    instructionSection: {
        paddingTop: 8,
        gap: 8,
    },
    instructionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        lineHeight: 32,
    },
    instructionDescription: {
        fontSize: 18,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 26,
    },
    formCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 24,
        gap: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    inputSection: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 16,
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    pickerButton: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        borderRadius: 12,
        paddingVertical: 18,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    placeholder: {
        color: theme.colors.textMuted,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginVertical: 8,
    },
    notificationSection: {
        gap: 16,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 4,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    modalItemText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
    },
    footer: {
        backgroundColor: theme.colors.white,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderLight,
        padding: 16,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    skipButtonText: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
