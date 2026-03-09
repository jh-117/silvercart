import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface CustomAlertButton {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    icon?: string;
    buttons?: CustomAlertButton[];
    onDismiss?: () => void;
}

export default function CustomAlert({
    visible,
    title,
    message,
    icon,
    buttons = [{ text: 'OK', onPress: () => { }, style: 'default' }],
    onDismiss,
}: CustomAlertProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onDismiss}
        >
            <Pressable style={styles.overlay} onPress={onDismiss}>
                <Pressable style={styles.alertBox} onPress={() => { }}>
                    {/* Icon */}
                    {icon && (
                        <View style={styles.iconContainer}>
                            <MaterialIcons name={icon as any} size={36} color={theme.colors.primary} />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    {message ? <Text style={styles.message}>{message}</Text> : null}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Buttons */}
                    <View style={[styles.buttonRow, buttons.length === 1 && styles.singleButton]}>
                        {buttons.map((btn, index) => (
                            <Pressable
                                key={index}
                                style={({ pressed }) => [
                                    styles.button,
                                    btn.style === 'cancel' && styles.cancelButton,
                                    btn.style === 'destructive' && styles.destructiveButton,
                                    btn.style !== 'cancel' && btn.style !== 'destructive' && styles.primaryButton,
                                    buttons.length === 1 && styles.fullWidthButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={btn.onPress}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        btn.style === 'cancel' && styles.cancelText,
                                        btn.style === 'destructive' && styles.destructiveText,
                                        btn.style !== 'cancel' && btn.style !== 'destructive' && styles.primaryText,
                                    ]}
                                >
                                    {btn.text}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    alertBox: {
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        paddingTop: 28,
        paddingHorizontal: 28,
        paddingBottom: 0,
        width: '100%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${theme.colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
        textAlign: 'center',
        marginBottom: 10,
    },
    message: {
        fontSize: 17,
        color: theme.colors.textMuted,
        fontFamily: theme.typography.fontFamily.regular,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 20,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: theme.colors.borderLight,
        marginTop: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
    },
    singleButton: {
        flexDirection: 'column',
    },
    button: {
        flex: 1,
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullWidthButton: {
        flex: 1,
        width: '100%',
    },
    primaryButton: {
        borderLeftWidth: 0,
    },
    cancelButton: {
        borderRightWidth: 1,
        borderRightColor: theme.colors.borderLight,
    },
    destructiveButton: {
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.borderLight,
    },
    buttonPressed: {
        backgroundColor: `${theme.colors.primary}08`,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: theme.typography.fontFamily.bold,
    },
    primaryText: {
        color: theme.colors.primary,
    },
    cancelText: {
        color: theme.colors.textMuted,
    },
    destructiveText: {
        color: '#d32f2f',
    },
});
