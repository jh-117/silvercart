import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps, View } from 'react-native';
import { theme } from '../../theme';
import CustomLoader from '../ui/CustomLoader';

interface PrimaryButtonProps extends PressableProps {
    title: string;
    loading?: boolean;
    onPress: () => void;
    icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    title,
    loading = false,
    onPress,
    icon,
    style,
    disabled,
    ...props
}) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                disabled && styles.disabled,
                pressed && styles.pressed,
                style as any,
            ]}
            {...props}
        >
            {loading ? (
                <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <CustomLoader style={{ transform: [{ scale: 0.5 }] }} />
                </View>
            ) : (
                <>
                    {title ? <Text style={styles.text}>{title}</Text> : null}
                    {icon && icon}
                </>
            )
            }
        </Pressable >
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: 60,
        borderRadius: 30, // Pill shape
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    text: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: '700',
        fontFamily: theme.typography.fontFamily.bold,
    },
    disabled: {
        opacity: 0.6,
        backgroundColor: theme.colors.textDisabled,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
});
