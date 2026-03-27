import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, Pressable, ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useReminders, WeekDay } from '../../hooks/useReminders';

const WEEKDAY_LABELS: { label: string; value: WeekDay }[] = [
    { label: 'Sun', value: 1 },
    { label: 'Mon', value: 2 },
    { label: 'Tue', value: 3 },
    { label: 'Wed', value: 4 },
    { label: 'Thu', value: 5 },
    { label: 'Fri', value: 6 },
    { label: 'Sat', value: 7 },
];

const timeToDate = (timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(new Date().setHours(h, m, 0, 0));
};

interface AlarmSlot { time: Date; id: string; showPicker: boolean; }

interface Props {
    visible: boolean;
    onClose: () => void;
    productId: string;
    productName: string;
    onSuccess?: () => void;
}

export default function MedicationAlarmModal({ visible, onClose, productId, productName, onSuccess }: Props) {
    const { addReminder } = useReminders();

    const [alarms, setAlarms] = useState<AlarmSlot[]>([
        { time: new Date(new Date().setHours(8, 0, 0, 0)), id: '1', showPicker: false },
    ]);
    const [selectedWeekdays, setSelectedWeekdays] = useState<WeekDay[]>([]); // empty = every day
    const [everyday, setEveryday] = useState(true);
    const [saving, setSaving] = useState(false);

    const toggleWeekday = (day: WeekDay) => {
        setSelectedWeekdays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const addAlarmSlot = () => {
        if (alarms.length >= 3) return;
        setAlarms(prev => [...prev, {
            time: new Date(new Date().setHours(12, 0, 0, 0)),
            id: String(Date.now()),
            showPicker: false,
        }]);
    };

    const removeAlarmSlot = (id: string) => {
        setAlarms(prev => prev.filter(a => a.id !== id));
    };

    const updateAlarmTime = (id: string, date: Date) => {
        setAlarms(prev => prev.map(a => a.id === id ? { ...a, time: date, showPicker: false } : a));
    };

    const togglePicker = (id: string) => {
        setAlarms(prev => prev.map(a => a.id === id ? { ...a, showPicker: !a.showPicker } : { ...a, showPicker: false }));
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            const weekdays = everyday ? undefined : selectedWeekdays;
            let allOk = true;
            for (const alarm of alarms) {
                const ok = await addReminder(
                    productId, productName,
                    alarm.time.getHours(), alarm.time.getMinutes(),
                    weekdays,
                );
                if (!ok) allOk = false;
            }
            if (allOk) onSuccess?.();
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.closeBtn}>
                        <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Daily Medication Alarm</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Product */}
                    <View style={styles.productBanner}>
                        <MaterialIcons name="medication" size={22} color="#1565C0" />
                        <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
                    </View>

                    {/* Alarm Times */}
                    <Text style={styles.sectionTitle}>Alarm Time(s)</Text>
                    <Text style={styles.sectionSub}>Set up to 3 daily alarms for this medication.</Text>

                    {alarms.map((alarm, index) => (
                        <View key={alarm.id}>
                            <View style={styles.alarmRow}>
                                <View style={styles.alarmIndex}>
                                    <Text style={styles.alarmIndexText}>{index + 1}</Text>
                                </View>
                                <Pressable style={styles.timeRow} onPress={() => togglePicker(alarm.id)}>
                                    <MaterialIcons name="alarm" size={22} color="#1565C0" />
                                    <Text style={styles.timeText}>
                                        {alarm.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <MaterialIcons name="edit" size={18} color={theme.colors.textMuted} />
                                </Pressable>
                                {alarms.length > 1 && (
                                    <Pressable onPress={() => removeAlarmSlot(alarm.id)} style={styles.removeBtn}>
                                        <MaterialIcons name="remove-circle" size={26} color="#e53e3e" />
                                    </Pressable>
                                )}
                            </View>
                            {alarm.showPicker && (
                                <DateTimePicker
                                    value={alarm.time}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                    onChange={(_, d) => { if (d) updateAlarmTime(alarm.id, d); else togglePicker(alarm.id); }}
                                />
                            )}
                        </View>
                    ))}

                    {alarms.length < 3 && (
                        <Pressable style={styles.addAlarmBtn} onPress={addAlarmSlot}>
                            <MaterialIcons name="add-alarm" size={20} color={theme.colors.primary} />
                            <Text style={styles.addAlarmText}>Add another alarm time</Text>
                        </Pressable>
                    )}

                    {/* Days of Week */}
                    <Text style={styles.sectionTitle}>Which Days?</Text>

                    <Pressable style={styles.everydayRow} onPress={() => setEveryday(!everyday)}>
                        <View style={[styles.checkbox, everyday && styles.checkboxChecked]}>
                            {everyday && <MaterialIcons name="check" size={16} color="#fff" />}
                        </View>
                        <Text style={styles.everydayLabel}>Every day</Text>
                    </Pressable>

                    {!everyday && (
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

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <Pressable
                        style={[styles.confirmBtn, saving && { opacity: 0.6 }]}
                        onPress={handleConfirm}
                        disabled={saving || (!everyday && selectedWeekdays.length === 0)}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <MaterialIcons name="alarm-on" size={22} color="#fff" />
                                <Text style={styles.confirmText}>Set Alarm{alarms.length > 1 ? 's' : ''}</Text>
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
        backgroundColor: '#E3F2FD', padding: 14, borderRadius: 12,
    },
    productName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1565C0', fontFamily: theme.typography.fontFamily.semibold },
    aiCard: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: `${theme.colors.primary}08`, borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: `${theme.colors.primary}20`,
    },
    aiText: { flex: 1, fontSize: 13, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.regular, fontStyle: 'italic' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    sectionSub: { fontSize: 13, color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.regular, marginTop: -8 },
    alarmRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    alarmIndex: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#1565C0', justifyContent: 'center', alignItems: 'center',
    },
    alarmIndexText: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: theme.typography.fontFamily.bold },
    timeRow: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: theme.colors.white, padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: '#BBDEFB',
    },
    timeText: { flex: 1, fontSize: 20, fontWeight: '700', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.bold },
    removeBtn: { padding: 4 },
    addAlarmBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
        padding: 14, borderRadius: 12, borderWidth: 1.5,
        borderColor: theme.colors.primary, borderStyle: 'dashed',
    },
    addAlarmText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semibold },
    everydayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox: {
        width: 24, height: 24, borderRadius: 6, borderWidth: 2,
        borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    checkboxChecked: { backgroundColor: theme.colors.primary },
    everydayLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.semibold },
    weekdayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dayChip: {
        width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: theme.colors.borderLight, backgroundColor: theme.colors.white,
    },
    dayChipActive: { borderColor: '#1565C0', backgroundColor: '#1565C0' },
    dayChipText: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, fontFamily: theme.typography.fontFamily.bold },
    dayChipTextActive: { color: '#fff' },
    footer: {
        backgroundColor: theme.colors.white, padding: 20, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: theme.colors.borderLight,
    },
    confirmBtn: {
        backgroundColor: '#1565C0', borderRadius: 14, paddingVertical: 18,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    confirmText: { fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: theme.typography.fontFamily.bold },
});
