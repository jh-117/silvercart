import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, Pressable, ScrollView,
    ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAutoReorders, WeekDay } from '../../hooks/useReminders';
import { useCart } from '../../contexts/CartContext';

const INTERVAL_OPTIONS = [
    { label: 'Every week', days: 7 },
    { label: 'Every 14 days', days: 14 },
    { label: 'Every 30 days', days: 30 },
    { label: 'Every 60 days', days: 60 },
];

const WEEKDAY_LABELS: { label: string; value: WeekDay }[] = [
    { label: 'Sun', value: 1 },
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 4 },
    { label: 'Thu', value: 5 },
    { label: 'Fri', value: 6 },
    { label: 'Sat', value: 7 },
];

interface Props {
    visible: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    category: string;
}

export default function AutoReorderModal({ visible, onClose, productId, productName, category }: Props) {
    const { addAutoReorder } = useAutoReorders();
    const { addItem } = useCart();

    const [mode, setMode] = useState<'interval' | 'weekly'>('interval');
    const [selectedDays, setSelectedDays] = useState(30);
    const [selectedWeekdays, setSelectedWeekdays] = useState<WeekDay[]>([]);
    const [reminderTime, setReminderTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (visible) setSelectedDays(30);
    }, [visible]);

    const toggleWeekday = (day: WeekDay) => {
        setSelectedWeekdays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            const h = reminderTime.getHours();
            const m = reminderTime.getMinutes();
            const success = await addAutoReorder(
                productId, productName, h, m,
                mode === 'interval' ? selectedDays : undefined,
                mode === 'weekly' ? selectedWeekdays : undefined,
            );
            if (success) {
                // Also add 1 to cart as a convenience
                try { await addItem(productId, 1); } catch { }
            }
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const timeLabel = reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Set Up Auto-Reorder</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Product Name */}
                    <View style={styles.productBanner}>
                        <MaterialIcons name="shopping-bag" size={22} color={theme.colors.primary} />
                        <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                    </View>

                    {/* ⚠️ Cart Check Warning */}
                    <View style={styles.warningCard}>
                        <MaterialIcons name="info-outline" size={20} color="#B45309" />
                        <Text style={styles.warningText}>
                            When notified, please <Text style={{ fontWeight: '700' }}>check your cart</Text> before confirming payment to avoid duplicate orders.
                        </Text>
                    </View>

                    {/* Mode Toggle */}
                    <Text style={styles.sectionTitle}>Reorder Frequency</Text>
                    <View style={styles.modeRow}>
                        <Pressable
                            style={[styles.modeBtn, mode === 'interval' && styles.modeBtnActive]}
                            onPress={() => setMode('interval')}
                        >
                            <Text style={[styles.modeBtnText, mode === 'interval' && styles.modeBtnTextActive]}>Every X Days</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.modeBtn, mode === 'weekly' && styles.modeBtnActive]}
                            onPress={() => setMode('weekly')}
                        >
                            <Text style={[styles.modeBtnText, mode === 'weekly' && styles.modeBtnTextActive]}>Specific Days</Text>
                        </Pressable>
                    </View>

                    {/* Interval Selector */}
                    {mode === 'interval' && (
                        <View style={styles.optionGrid}>
                            {INTERVAL_OPTIONS.map(opt => (
                                <Pressable
                                    key={opt.days}
                                    style={[styles.optionChip, selectedDays === opt.days && styles.optionChipActive]}
                                    onPress={() => setSelectedDays(opt.days)}
                                >
                                    <Text style={[styles.optionChipText, selectedDays === opt.days && styles.optionChipTextActive]}>
                                        {opt.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Weekday Selector */}
                    {mode === 'weekly' && (
                        <View style={styles.weekdayRow}>
                            {WEEKDAY_LABELS.map(d => (
                                <Pressable
                                    key={d.value}
                                    style={[styles.dayChip, selectedWeekdays.includes(d.value) && styles.dayChipActive]}
                                    onPress={() => toggleWeekday(d.value)}
                                >
                                    <Text style={[styles.dayChipText, selectedWeekdays.includes(d.value) && styles.dayChipTextActive]}>
                                        {d.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Reminder Time */}
                    <Text style={styles.sectionTitle}>Reminder Time</Text>
                    <Pressable style={styles.timeRow} onPress={() => setShowTimePicker(true)}>
                        <MaterialIcons name="access-time" size={22} color={theme.colors.primary} />
                        <Text style={styles.timeText}>{timeLabel}</Text>
                        <MaterialIcons name="edit" size={18} color={theme.colors.textMuted} />
                    </Pressable>

                    {showTimePicker && (
                        <DateTimePicker
                            value={reminderTime}
                            mode="time"
                            is24Hour={false}
                            display="default"
                            onChange={(_, d) => { setShowTimePicker(false); if (d) setReminderTime(d); }}
                        />
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Pressable
                        style={[styles.confirmBtn, saving && { opacity: 0.6 }]}
                        onPress={handleConfirm}
                        disabled={saving || (mode === 'weekly' && selectedWeekdays.length === 0)}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="autorenew" size={22} color="#fff" />
                                <Text style={styles.confirmText}>Confirm Auto-Reorder</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
    },
    closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    content: { padding: 20, gap: 16 },
    productBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: `${theme.colors.primary}10`, padding: 14, borderRadius: 12,
    },
    productName: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold },
    warningCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 10,
        backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: '#FDE68A',
    },
    warningText: { flex: 1, fontSize: 14, color: '#92400E', fontFamily: theme.typography.fontFamily.regular, lineHeight: 20 },
    aiCard: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: `${theme.colors.primary}08`, borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: `${theme.colors.primary}20`,
    },
    aiText: { flex: 1, fontSize: 13, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.regular, fontStyle: 'italic' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    modeRow: { flexDirection: 'row', gap: 12 },
    modeBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: theme.colors.borderLight,
        alignItems: 'center', backgroundColor: theme.colors.white,
    },
    modeBtnActive: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
    modeBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold },
    modeBtnTextActive: { color: theme.colors.primary },
    optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionChip: {
        paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: theme.colors.borderLight,
        backgroundColor: theme.colors.white,
    },
    optionChipActive: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
    optionChipText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.semibold },
    optionChipTextActive: { color: theme.colors.primary },
    weekdayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dayChip: {
        width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: theme.colors.borderLight, backgroundColor: theme.colors.white,
    },
    dayChipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
    dayChipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.bold },
    dayChipTextActive: { color: '#fff' },
    timeRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: theme.colors.white, padding: 16, borderRadius: 12,
        borderWidth: 1, borderColor: theme.colors.borderLight,
    },
    timeText: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    footer: {
        backgroundColor: theme.colors.white, padding: 20, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
    },
    confirmBtn: {
        backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 18,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    confirmText: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: theme.typography.fontFamily.bold },
});
