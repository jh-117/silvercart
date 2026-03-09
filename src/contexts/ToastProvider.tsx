import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
    message: string;
    type: ToastType;
    duration?: number; // milliseconds
    id: string;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 3000; // 3 seconds

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const showToast = useCallback((message: string, type: ToastType, duration: number = DEFAULT_DURATION) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastConfig = {
            message,
            type,
            duration,
            id
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-dismiss after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const showSuccess = useCallback((message: string, duration?: number) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message: string, duration?: number) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showInfo = useCallback((message: string, duration?: number) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    const showWarning = useCallback((message: string, duration?: number) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const value: ToastContextType = {
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Container Component
import { View, StyleSheet } from 'react-native';
import { Toast } from '../components/feedback/Toast';

interface ToastContainerProps {
    toasts: ToastConfig[];
}

const ToastContainer = ({ toasts }: ToastContainerProps) => {
    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    }
});
