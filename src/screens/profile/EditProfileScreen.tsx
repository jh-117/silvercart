import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { profileService, UserProfile } from '../../services/profile.service';

export default function EditProfileScreen() {
    const navigation = useNavigation<any>();
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dob, setDob] = useState('');
    const [address, setAddress] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const addressInputRef = useRef<TextInput>(null);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDob(selectedDate.toISOString().split('T')[0]);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.id) return;
            setLoading(true);
            const { data } = await profileService.getProfile(user.id);
            if (data) {
                setFullName(data.full_name || '');
                setPhone(data.phone || '');
                setAddress(data.address || '');
                setDob(data.dob || '');
                setAvatarUri(data.avatar_url || null);
            }
            setEmail(user?.email || '');
            setLoading(false);
        };
        loadProfile();
    }, [user]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);

        try {
            let finalAvatarUrl = avatarUri;
            if (avatarUri && avatarUri.startsWith('file://')) {
                const { url, error } = await profileService.uploadAvatar(user.id, avatarUri);
                if (error) {
                    Alert.alert('Upload Error', error.message || 'Could not upload image');
                    setSaving(false);
                    return;
                }
                if (url) finalAvatarUrl = url;
            }

            const updates: Partial<UserProfile> = {
                full_name: fullName,
                phone: phone,
                address: address,
                dob: dob,
                avatar_url: finalAvatarUrl,
            };

            const { error } = await profileService.updateProfile(user.id, updates);
            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <Pressable
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <>
                        <View style={styles.avatarSection}>
                            <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder}>
                                        <MaterialIcons name="person" size={48} color={theme.colors.textMuted} />
                                    </View>
                                )}
                                <View style={styles.editAvatarBadge}>
                                    <MaterialIcons name="edit" size={16} color={theme.colors.white} />
                                </View>
                            </Pressable>
                            <Text style={styles.avatarHelperText}>Tap to change photo (Max 2MB)</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Email Address</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: '#f0f0f0', color: theme.colors.textMuted }]}
                                value={email}
                                editable={false}
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor={theme.colors.textMuted}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Date of Birth</Text>
                            <Pressable style={styles.input} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.inputText}>{dob || 'Select a date'}</Text>
                                <MaterialIcons name="calendar-today" size={24} color={theme.colors.textMuted} />
                            </Pressable>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Address</Text>
                            <TextInput
                                ref={addressInputRef}
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter your address"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={theme.colors.textMuted}
                                onFocus={() => {
                                    setTimeout(() => {
                                        scrollRef.current?.scrollToEnd({ animated: true });
                                    }, 300);
                                }}
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
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
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    saveText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        gap: 24,
        paddingBottom: 120,
    },
    section: {
        gap: 8,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.semibold,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 20,
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    inputText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.regular,
    },
    textArea: {
        padding: 20,
        height: 100,
        textAlignVertical: 'top',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        position: 'relative',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    avatarHelperText: {
        marginTop: 8,
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
});

