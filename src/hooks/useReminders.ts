import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDERS_KEY = '@silvercart_reminders';
const AUTOREORDER_KEY = '@silvercart_autoreorders';

export type WeekDay = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Sunday ... 7=Saturday (Expo convention)

export interface Reminder {
    id: string;
    productId: string;
    productName: string;
    hour: number;
    minute: number;
    weekdays?: WeekDay[]; // undefined = daily
    title: string;
    body: string;
}

export interface AutoReorder {
    id: string;
    productId: string;
    productName: string;
    intervalDays?: number; // e.g. every 30 days
    weekdays?: WeekDay[];  // OR specific days each week
    hour: number;
    minute: number;
    notificationIds: string[];
}

const CHANNEL = 'silvercart-reminders';

/** Request notification permissions. Returns true if granted. */
export async function requestNotifPermission(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

/** Schedule a single notification returning its identifier */
async function scheduleDailyNotif(title: string, body: string, hour: number, minute: number): Promise<string> {
    return Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
        } as any,
    });
}

async function scheduleWeeklyNotif(title: string, body: string, hour: number, minute: number, weekday: WeekDay): Promise<string> {
    return Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
        } as any,
    });
}

async function scheduleIntervalNotif(title: string, body: string, seconds: number): Promise<string> {
    return Notifications.scheduleNotificationAsync({
        content: { title, body, sound: true, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: true,
        } as any,
    });
}

// ─────────────────────────────────────────────
// useReminders — Medication Alarms
// ─────────────────────────────────────────────
export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadReminders(); }, []);

    const loadReminders = async () => {
        try {
            const data = await AsyncStorage.getItem(REMINDERS_KEY);
            if (data) setReminders(JSON.parse(data));
        } catch (e) {
            console.error('Failed to load reminders', e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Schedule medication alarms.
     * If weekdays are provided, one notification per weekday is created.
     * Otherwise a daily notification is created.
     */
    const addReminder = async (
        productId: string,
        productName: string,
        hour: number,
        minute: number,
        weekdays?: WeekDay[],
    ) => {
        try {
            const granted = await requestNotifPermission();
            if (!granted) return false;

            const title = '💊 Medication Reminder';
            const body = `Time to take your ${productName}!`;
            const ids: string[] = [];

            if (weekdays && weekdays.length > 0) {
                for (const wd of weekdays) {
                    ids.push(await scheduleWeeklyNotif(title, body, hour, minute, wd));
                }
            } else {
                ids.push(await scheduleDailyNotif(title, body, hour, minute));
            }

            // Store one Reminder entry per scheduled notification
            const newEntries: Reminder[] = ids.map(id => ({
                id, productId, productName, hour, minute, weekdays, title, body,
            }));

            const updated = [...reminders, ...newEntries];
            setReminders(updated);
            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
            return true;
        } catch (e) {
            console.error('Failed to schedule reminder', e);
            return false;
        }
    };

    const removeReminder = async (id: string) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(id);
            const updated = reminders.filter(r => r.id !== id);
            setReminders(updated);
            await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to remove reminder', e);
        }
    };

    return { reminders, loading, addReminder, removeReminder };
}

// ─────────────────────────────────────────────
// useAutoReorders — Auto Reorder Scheduling
// ─────────────────────────────────────────────
export function useAutoReorders() {
    const [autoReorders, setAutoReorders] = useState<AutoReorder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAutoReorders(); }, []);

    const loadAutoReorders = async () => {
        try {
            const data = await AsyncStorage.getItem(AUTOREORDER_KEY);
            if (data) setAutoReorders(JSON.parse(data));
        } catch (e) {
            console.error('Failed to load auto reorders', e);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Schedule an auto-reorder notification.
     * Either intervalDays (repeating interval) or weekdays (weekly on specific days).
     */
    const addAutoReorder = async (
        productId: string,
        productName: string,
        hour: number,
        minute: number,
        intervalDays?: number,
        weekdays?: WeekDay[],
    ) => {
        try {
            const granted = await requestNotifPermission();
            if (!granted) return false;

            const title = '🛒 Time to Reorder!';
            const body = `Your ${productName} may be running low. Check your cart before confirming!`;
            const notifIds: string[] = [];

            if (weekdays && weekdays.length > 0) {
                for (const wd of weekdays) {
                    notifIds.push(await scheduleWeeklyNotif(title, body, hour, minute, wd));
                }
            } else {
                const days = intervalDays ?? 30;
                notifIds.push(await scheduleIntervalNotif(title, body, days * 24 * 60 * 60));
            }

            const entry: AutoReorder = {
                id: `ar_${Date.now()}`,
                productId,
                productName,
                intervalDays,
                weekdays,
                hour,
                minute,
                notificationIds: notifIds,
            };

            const updated = [...autoReorders, entry];
            setAutoReorders(updated);
            await AsyncStorage.setItem(AUTOREORDER_KEY, JSON.stringify(updated));
            return true;
        } catch (e) {
            console.error('Failed to schedule auto-reorder', e);
            return false;
        }
    };

    const removeAutoReorder = async (id: string) => {
        try {
            const entry = autoReorders.find(r => r.id === id);
            if (entry) {
                for (const nid of entry.notificationIds) {
                    await Notifications.cancelScheduledNotificationAsync(nid);
                }
            }
            const updated = autoReorders.filter(r => r.id !== id);
            setAutoReorders(updated);
            await AsyncStorage.setItem(AUTOREORDER_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to remove auto-reorder', e);
        }
    };

    return { autoReorders, loading, addAutoReorder, removeAutoReorder };
}
