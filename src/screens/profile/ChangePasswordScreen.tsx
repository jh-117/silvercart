import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Simple password strength calculation
    const getPasswordStrength = () => {
        if (!newPassword) return { level: 'None', percentage: 0, color: theme.colors.textMuted };
        const length = newPassword.length;
        if (length < 6) return { level: 'Weak', percentage: 30, color: theme.colors.error };
        if (length < 10) return { level: 'Good', percentage: 60, color: theme.colors.warning };
        return { level: 'Strong', percentage: 85, color: theme.colors.success };
    };

    const strength = getPasswordStrength();

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={28} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Change Password</Text>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialIcons name="shield" size={32} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        Your security is our priority. Please choose a password that is easy for you to remember but hard for others to guess.
                    </Text>
                </View>

                {/* Current Password */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Current Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter old password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry={!showCurrentPassword}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            <MaterialIcons
                                name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                                size={28}
                                color={theme.colors.textMuted}
                            />
                        </Pressable>
                    </View>
                    <Pressable style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </Pressable>
                </View>

                {/* New Password */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Create new password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={!showNewPassword}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowNewPassword(!showNewPassword)}
                        >
                            <MaterialIcons
                                name={showNewPassword ? 'visibility' : 'visibility-off'}
                                size={28}
                                color={theme.colors.textMuted}
                            />
                        </Pressable>
                    </View>

                    {/* Password Strength Indicator */}
                    {newPassword.length > 0 && (
                        <View style={styles.strengthCard}>
                            <View style={styles.strengthHeader}>
                                <Text style={styles.strengthLabel}>Security Level</Text>
                                <View style={[styles.strengthBadge, { backgroundColor: `${strength.color}20` }]}>
                                    <Text style={[styles.strengthBadgeText, { color: strength.color }]}>
                                        {strength.level}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.strengthBarContainer}>
                                <View
                                    style={[
                                        styles.strengthBar,
                                        { width: `${strength.percentage}%`, backgroundColor: strength.color }
                                    ]}
                                />
                            </View>
                            <View style={styles.strengthFeedback}>
                                <MaterialIcons
                                    name={strength.percentage >= 60 ? 'check-circle' : 'info'}
                                    size={20}
                                    color={strength.color}
                                />
                                <Text style={[styles.strengthFeedbackText, { color: strength.color }]}>
                                    {strength.percentage >= 60
                                        ? 'Great! This password is very secure.'
                                        : 'Try a longer password for better security.'}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type it once more"
                            placeholderTextColor={theme.colors.textMuted}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <Pressable
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <MaterialIcons
                                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                                size={28}
                                color={theme.colors.textMuted}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.updateButton,
                            pressed && styles.buttonPressed
                        ]}
                    >
                        <Text style={styles.updateButtonText}>Update Password</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.cancelButton,
                            pressed && styles.buttonPressed
                        ]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
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
        padding: 20,
        gap: 24,
        paddingBottom: 120,
    },
    infoCard: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}20`,
    },
    infoText: {
        flex: 1,
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 24,
    },
    inputSection: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        flex: 1,
        fontSize: 18,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.medium,
        paddingVertical: 18,
        paddingHorizontal: 20,
    },
    eyeButton: {
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    forgotButton: {
        marginLeft: 4,
        marginTop: 4,
    },
    forgotText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
        textDecorationLine: 'underline',
    },
    strengthCard: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    strengthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    strengthLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    strengthBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    strengthBadgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.bold,
        textTransform: 'uppercase',
    },
    strengthBarContainer: {
        height: 8,
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 4,
        overflow: 'hidden',
    },
    strengthBar: {
        height: '100%',
        borderRadius: 4,
    },
    strengthFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    strengthFeedbackText: {
        flex: 1,
        fontSize: 14,
        fontFamily: theme.typography.fontFamily.medium,
    },
    actionContainer: {
        marginTop: 32,
        gap: 16,
    },
    updateButton: {
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
    updateButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.borderLight,
    },
    cancelButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.bold,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
});
