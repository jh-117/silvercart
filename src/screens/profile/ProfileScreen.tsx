import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../contexts/AuthContext';
import { profileService, UserProfile } from '../../services/profile.service';
import { authService } from '../../services/auth.service';

const menuItems = [
    { id: '1', icon: 'receipt-long', title: 'Order History', subtitle: 'View your past purchases', route: 'OrderHistory' },
    { id: 'fav', icon: 'favorite', title: 'My Favorites', subtitle: 'Items you quickly reorder', route: 'Favorites' },
    { id: 'rem', icon: 'alarm', title: 'Daily Reminders', subtitle: 'Manage your medication alerts', route: 'Reminders' },
    { id: '2', icon: 'contact-emergency', title: 'Trusted Contact', subtitle: 'Manage your trusted contacts', route: 'TrustedContact' },
    { id: '3', icon: 'edit', title: 'Edit Profile', subtitle: 'Update your personal details', route: 'EditProfile' },
    { id: '4', icon: 'shield', title: 'Security Settings', subtitle: 'Biometrics & privacy controls', route: 'SecuritySettings' },
    { id: '5', icon: 'settings', title: 'App Settings', subtitle: 'Language, notifications & accessibility', route: 'AppSettings' },
    { id: '6', icon: 'contact-support', title: 'Help & Support', subtitle: 'Talk to us or read guides', route: 'Support' },
    { id: '7', icon: 'forum', title: 'My Tickets', subtitle: 'View your support conversations', route: 'SupportTickets' },
];

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { user } = React.useContext(AuthContext);
    const [profile, setProfile] = React.useState<UserProfile | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchProfile = async () => {
                if (user?.id) {
                    const { data } = await profileService.getProfile(user.id);
                    if (data) setProfile(data);
                }
            };
            fetchProfile();
        }, [user?.id])
    );

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <SafeAreaView edges={['top']}>
                    <View style={styles.header}>
                        <Pressable
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.textPrimary} />
                        </Pressable>
                        <Text style={styles.headerTitle}>My Profile</Text>
                    </View>
                </SafeAreaView>

                {/* Profile Header */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImage} />
                        )}
                        <Pressable
                            style={styles.editImageButton}
                            onPress={() => navigation.navigate('EditProfile')}
                        >
                            <MaterialIcons name="edit" size={16} color={theme.colors.white} />
                        </Pressable>
                    </View>
                    <Text style={styles.profileName}>{profile?.full_name || 'Guest User'}</Text>
                    <Text style={styles.profileMember}>{profile?.phone || user?.email || 'Set up your profile'}</Text>
                </View>

                {/* Trust Badge */}
                <View style={styles.trustCard}>
                    <View style={styles.trustContent}>
                        <View style={styles.trustIcon}>
                            <MaterialIcons name="verified-user" size={24} color={theme.colors.white} />
                        </View>
                        <View style={styles.trustText}>
                            <Text style={styles.trustTitle}>Protected Account</Text>
                            <Text style={styles.trustSubtitle}>Your account is safe and monitored.</Text>
                        </View>
                    </View>
                    <Pressable
                        style={styles.trustLink}
                        onPress={() => navigation.navigate('SecuritySettings' as any)}
                    >
                        <Text style={styles.trustLinkText}>View Security Details</Text>
                        <MaterialIcons name="arrow-forward" size={16} color={theme.colors.primary} />
                    </Pressable>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <Pressable
                            key={item.id}
                            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                            onPress={() => navigation.navigate(item.route as any)}
                        >
                            <View style={styles.menuIconContainer}>
                                <MaterialIcons name={item.icon as any} size={28} color={theme.colors.primary} />
                            </View>
                            <View style={styles.menuContent}>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={theme.colors.textMuted} />
                        </Pressable>
                    ))}

                    {/* Logout */}
                    <Pressable
                        style={({ pressed }) => [styles.logoutButton, pressed && styles.menuItemPressed]}
                        onPress={() => {
                            Alert.alert(
                                "Log Out",
                                "Are you sure you want to log out of your account?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Yes, Log Out",
                                        style: "destructive",
                                        onPress: async () => {
                                            const { error } = await authService.signOut();
                                            if (error) {
                                                alert(error.message);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <View style={styles.logoutIconContainer}>
                            <MaterialIcons name="logout" size={28} color="#d32f2f" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.logoutTitle}>Logout</Text>
                            <Text style={styles.logoutSubtitle}>Sign out of your account</Text>
                        </View>
                    </Pressable>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5f3',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#f7f5f3',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.borderLight,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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
    profileSection: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 16,
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 144,
        height: 144,
        borderRadius: 72,
        backgroundColor: '#E0E0E0',
        borderWidth: 4,
        borderColor: theme.colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    editImageButton: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    profileName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    profileMember: {
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.medium,
    },
    trustCard: {
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: `${theme.colors.primary}10`,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: `${theme.colors.primary}20`,
        padding: 20,
        gap: 16,
    },
    trustContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    trustIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trustText: {
        flex: 1,
        gap: 4,
    },
    trustTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    trustSubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
    },
    trustLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        marginLeft: 64,
    },
    trustLinkText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    menuContainer: {
        paddingHorizontal: 16,
        paddingTop: 24,
        gap: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
    },
    menuItemPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    menuIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: `${theme.colors.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        flex: 1,
        gap: 4,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    menuSubtitle: {
        fontSize: 16,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: 22,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        backgroundColor: '#ffebee',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#ffcdd2',
        marginTop: 16,
    },
    logoutIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#ef9a9a40',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d32f2f',
        fontFamily: theme.typography.fontFamily.bold,
    },
    logoutSubtitle: {
        fontSize: 16,
        color: '#d32f2f70',
        fontFamily: theme.typography.fontFamily.regular,
    },
});

