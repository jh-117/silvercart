import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { useReminders, Reminder } from '../../hooks/useReminders';

export default function RemindersScreen() {
    const navigation = useNavigation<any>();
    const { reminders, loading, removeReminder } = useReminders();

    const formatTime = (hour: number, minute: number) => {
        const d = new Date();
        d.setHours(hour, minute, 0);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderItem = ({ item }: { item: Reminder }) => (
        <View style={styles.card}>
            <View style={styles.timeContainer}>
                <MaterialIcons name="alarm" size={28} color="#1565C0" />
                <Text style={styles.timeText}>{formatTime(item.hour, item.minute)}</Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.subtitle}>Daily Reminder</Text>
            </View>
            <Pressable 
                style={styles.removeBtn}
                onPress={() => removeReminder(item.id)}
            >
                <MaterialIcons name="delete-outline" size={26} color="#e53e3e" />
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Reminders</Text>
                    <View style={styles.iconButton} /> 
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : reminders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="notifications-off" size={64} color={theme.colors.textMuted} />
                        <Text style={styles.emptyTitle}>No Reminders Set</Text>
                        <Text style={styles.emptySubtitle}>You can set daily medication reminders directly from any product page.</Text>
                        <Pressable 
                            style={styles.shopBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.shopBtnText}>Browse Products</Text>
                        </Pressable>
                    </View>
                ) : (
                    <FlatList
                        data={reminders}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, gap: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#1565C0'
    },
    timeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: theme.colors.borderLight
    },
    timeText: { fontSize: 16, fontWeight: '700', color: '#1565C0', marginTop: 4, fontFamily: theme.typography.fontFamily.bold },
    cardInfo: { flex: 1 },
    title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4, fontFamily: theme.typography.fontFamily.bold },
    subtitle: { fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    removeBtn: { padding: 8, marginLeft: 8 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    emptyTitle: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginTop: 16, marginBottom: 8, fontFamily: theme.typography.fontFamily.bold, textAlign: 'center' },
    emptySubtitle: { fontSize: 16, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 32, fontFamily: theme.typography.fontFamily.regular, lineHeight: 24 },
    shopBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30,
    },
    shopBtnText: { color: theme.colors.white, fontSize: 18, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold }
});
