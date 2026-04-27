import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../theme';
import { useReminders, useAutoReorders, Reminder, AutoReorder } from '../../hooks/useReminders';

export default function RemindersScreen() {
    const navigation = useNavigation<any>();
    const { reminders, loading: remLoading, removeReminder, updateReminder } = useReminders();
    const { autoReorders, loading: arLoading, removeAutoReorder, updateAutoReorder } = useAutoReorders();

    const [editingRemId, setEditingRemId] = useState<string | null>(null);
    const [editingArId, setEditingArId] = useState<string | null>(null);
    const [pickerDate, setPickerDate] = useState(new Date());

    // Toast state
    const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);
    const toastAnim = useRef(new Animated.Value(0)).current;
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string, success: boolean) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, success });
        Animated.sequence([
            Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.delay(2200),
            Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            setToast(null);
        });
    };

    const loading = remLoading || arLoading;

    const formatTime = (hour: number, minute: number) => {
        const d = new Date();
        d.setHours(hour, minute, 0);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const openRemPicker = (item: Reminder) => {
        const d = new Date();
        d.setHours(item.hour, item.minute, 0, 0);
        setPickerDate(d);
        setEditingRemId(item.id);
        setEditingArId(null);
    };

    const openArPicker = (item: AutoReorder) => {
        const d = new Date();
        d.setHours(item.hour, item.minute, 0, 0);
        setPickerDate(d);
        setEditingArId(item.id);
        setEditingRemId(null);
    };

    const handlePickerChange = async (_: any, selected?: Date) => {
        if (!selected) {
            setEditingRemId(null);
            setEditingArId(null);
            return;
        }
        setPickerDate(selected);
        const timeStr = selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (editingRemId) {
            const ok = await updateReminder(editingRemId, selected.getHours(), selected.getMinutes());
            setEditingRemId(null);
            showToast(
                ok ? `✅ Reminder updated to ${timeStr}` : '❌ Failed to update reminder',
                !!ok
            );
        } else if (editingArId) {
            const ok = await updateAutoReorder(editingArId, selected.getHours(), selected.getMinutes());
            setEditingArId(null);
            showToast(
                ok ? `✅ Reorder time updated to ${timeStr}` : '❌ Failed to update reorder time',
                !!ok
            );
        }
    };

    const renderReminder = ({ item }: { item: Reminder }) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => openRemPicker(item)}
        >
            <View style={styles.timeContainer}>
                <MaterialIcons name="alarm" size={28} color="#1565C0" />
                <Text style={styles.timeText}>{formatTime(item.hour, item.minute)}</Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.subtitle}>Daily Reminder · tap to edit time</Text>
            </View>
            <View style={styles.actions}>
                <MaterialIcons name="edit" size={18} color={theme.colors.textMuted} style={styles.editIcon} />
                <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeReminder(item.id)}
                    hitSlop={8}
                >
                    <MaterialIcons name="delete-outline" size={26} color="#e53e3e" />
                </Pressable>
            </View>
        </Pressable>
    );

    const renderReorder = ({ item }: { item: AutoReorder }) => {
        const scheduleLabel = item.intervalDays
            ? `Every ${item.intervalDays} days`
            : 'Weekly';
        return (
            <Pressable
                style={({ pressed }) => [styles.card, styles.reorderCard, pressed && styles.cardPressed]}
                onPress={() => openArPicker(item)}
            >
                <View style={styles.timeContainer}>
                    <MaterialIcons name="autorenew" size={28} color={theme.colors.primary} />
                    <Text style={[styles.timeText, { color: theme.colors.primary }]}>
                        {formatTime(item.hour, item.minute)}
                    </Text>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.subtitle}>{scheduleLabel} · tap to edit time</Text>
                </View>
                <View style={styles.actions}>
                    <MaterialIcons name="edit" size={18} color={theme.colors.textMuted} style={styles.editIcon} />
                    <Pressable
                        style={styles.removeBtn}
                        onPress={() => removeAutoReorder(item.id)}
                        hitSlop={8}
                    >
                        <MaterialIcons name="delete-outline" size={26} color="#e53e3e" />
                    </Pressable>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {/* Toast Notification */}
            {toast && (
                <Animated.View
                    style={[
                        styles.toast,
                        toast.success ? styles.toastSuccess : styles.toastError,
                        {
                            opacity: toastAnim,
                            transform: [{
                                translateY: toastAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [20, 0],
                                }),
                            }],
                        },
                    ]}
                >
                    <MaterialIcons
                        name={toast.success ? 'check-circle' : 'error'}
                        size={20}
                        color="#fff"
                    />
                    <Text style={styles.toastText}>{toast.message}</Text>
                </Animated.View>
            )}

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                {/* Header — no circle on the right */}
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Reminders</Text>
                    {/* transparent spacer keeps title centred */}
                    <View style={styles.headerSpacer} />
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* ── Medication Reminders ── */}
                        <Text style={styles.sectionLabel}>Medication Alarms</Text>
                        {reminders.length === 0 ? (
                            <View style={styles.emptySection}>
                                <MaterialIcons name="notifications-off" size={40} color={theme.colors.textMuted} />
                                <Text style={styles.emptyText}>No medication reminders set.</Text>
                                <Text style={styles.emptyHint}>Set them from any product page.</Text>
                            </View>
                        ) : (
                            reminders.map(item => (
                                <View key={item.id}>
                                    {renderReminder({ item })}
                                    {editingRemId === item.id && (
                                        <DateTimePicker
                                            value={pickerDate}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={handlePickerChange}
                                        />
                                    )}
                                </View>
                            ))
                        )}

                        {/* ── Auto-Reorders ── */}
                        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Auto-Reorders</Text>
                        {autoReorders.length === 0 ? (
                            <View style={styles.emptySection}>
                                <MaterialIcons name="autorenew" size={40} color={theme.colors.textMuted} />
                                <Text style={styles.emptyText}>No auto-reorders set.</Text>
                                <Text style={styles.emptyHint}>Set them from any product page.</Text>
                            </View>
                        ) : (
                            autoReorders.map(item => (
                                <View key={item.id}>
                                    {renderReorder({ item })}
                                    {editingArId === item.id && (
                                        <DateTimePicker
                                            value={pickerDate}
                                            mode="time"
                                            is24Hour={false}
                                            display="default"
                                            onChange={handlePickerChange}
                                        />
                                    )}
                                </View>
                            ))
                        )}

                        <Pressable
                            style={styles.shopBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.shopBtnText}>Browse Products</Text>
                        </Pressable>
                    </ScrollView>
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
    backButton: {
        width: 48, height: 48,
        justifyContent: 'center', alignItems: 'center',
    },
    headerSpacer: { width: 48 }, // same width as backButton — keeps title centred, no circle
    headerTitle: {
        fontSize: 20, fontWeight: '700', color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 13, fontWeight: '700', color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.bold,
        letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, marginLeft: 4,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#1565C0',
    },
    reorderCard: {
        borderLeftColor: theme.colors.primary,
    },
    cardPressed: { opacity: 0.75 },
    timeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: theme.colors.borderLight,
    },
    timeText: { fontSize: 16, fontWeight: '700', color: '#1565C0', marginTop: 4, fontFamily: theme.typography.fontFamily.bold },
    cardInfo: { flex: 1 },
    title: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 2, fontFamily: theme.typography.fontFamily.bold },
    subtitle: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
    editIcon: { marginRight: 4 },
    removeBtn: { padding: 4 },
    emptySection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
    emptyText: { fontSize: 16, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold },
    emptyHint: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular },
    shopBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30,
        alignSelf: 'center', marginTop: 24,
    },
    shopBtnText: { color: theme.colors.white, fontSize: 18, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold },
    toast: {
        position: 'absolute',
        bottom: 32,
        left: 24,
        right: 24,
        zIndex: 999,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    toastSuccess: { backgroundColor: '#1a7f4b' },
    toastError: { backgroundColor: '#c0392b' },
    toastText: {
        flex: 1,
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: theme.typography.fontFamily.semibold,
    },
});
