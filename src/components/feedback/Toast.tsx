import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { ToastType } from '../../contexts/ToastProvider';

interface ToastProps {
    message: string;
    type: ToastType;
}

export const Toast = ({ message, type }: ToastProps) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Slide in animation
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Slide out animation after 2.7 seconds (before auto-dismiss)
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 2700);

        return () => clearTimeout(timeout);
    }, []);

    const getToastStyle = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: theme.colors.success,
                    icon: 'check-circle' as const,
                };
            case 'error':
                return {
                    backgroundColor: theme.colors.error,
                    icon: 'error' as const,
                };
            case 'warning':
                return {
                    backgroundColor: '#F59E0B',
                    icon: 'warning' as const,
                };
            case 'info':
            default:
                return {
                    backgroundColor: theme.colors.primary,
                    icon: 'info' as const,
                };
        }
    };

    const toastStyle = getToastStyle();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: toastStyle.backgroundColor,
                    transform: [{ translateY }],
                    opacity
                },
            ]}
        >
            <MaterialIcons name={toastStyle.icon} size={24} color={theme.colors.white} />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        minHeight: 60,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        maxWidth: '90%',
    },
    message: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.semibold,
        flex: 1,
        lineHeight: 24,
    },
});
