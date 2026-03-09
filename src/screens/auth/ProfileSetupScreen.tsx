import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import CustomInput from '../../components/ui/CustomInput';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { profileService } from '../../services/profile.service';

export default function ProfileSetupScreen() {
    const navigation = useNavigation<any>();
    const { user } = React.useContext(AuthContext);
    const [fullName, setFullName] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!fullName || !address) {
            Alert.alert('Missing Information', 'Please fill in your name and delivery address.');
            return;
        }

        if (!user) return;

        setLoading(true);
        try {
            const { error } = await profileService.updateProfile(user.id, {
                full_name: fullName,
                address: address,
            });

            if (error) throw error;

            setLoading(false);
            navigation.navigate('AddTrustedContact' as any);
        } catch (error: any) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
        }
    };

    const handleSkip = () => {
        navigation.navigate('AddTrustedContact' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        We need a few more details to deliver your orders.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <CustomInput
                            style={styles.input}
                            placeholder="e.g. Ali Bin Abu"
                            placeholderTextColor={theme.colors.textMuted}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Delivery Address</Text>
                        <CustomInput
                            style={[styles.input, styles.textArea]}
                            placeholder="No. 123, Jalan..."
                            placeholderTextColor={theme.colors.textMuted}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <Text style={styles.hint}>
                            This will be your default delivery address.
                        </Text>
                    </View>

                    <View style={styles.spacer} />

                    <PrimaryButton
                        title="Complete Setup"
                        onPress={handleComplete}
                        loading={loading}
                        icon={<MaterialIcons name="check" size={24} color={theme.colors.white} />}
                    />

                    <Pressable style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
    },
    headerSubtitle: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 26,
        fontFamily: theme.typography.fontFamily.medium,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
    input: {
        height: 64,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#D1DDE8',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
    },
    textArea: {
        height: 140,
        paddingTop: 16,
    },
    hint: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    spacer: {
        height: 16,
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
