import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SecurityKeypadProps {
    onPress: (key: string) => void;
    onDelete: () => void;
    style?: ViewStyle;
}

export const SecurityKeypad: React.FC<SecurityKeypadProps> = ({ onPress, onDelete, style }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

    const handlePress = (key: string) => {
        if (key === 'delete') {
            onDelete();
        } else if (key !== '') {
            onPress(key);
        }
    };

    return (
        <View style={[styles.container, style]}>
            {keys.map((key, index) => {
                const isDelete = key === 'delete';
                const isEmpty = key === '';

                if (isEmpty) {
                    return <View key={`empty-${index}`} style={styles.keyContainer} />;
                }

                return (
                    <View key={key} style={styles.keyContainer}>
                        <Pressable
                            onPress={() => handlePress(key)}
                            style={({ pressed }) => [
                                styles.key,
                                pressed && styles.keyPressed
                            ]}
                        >
                            {isDelete ? (
                                <MaterialIcons name="backspace" size={32} color={theme.colors.textMain} />
                            ) : (
                                <Text style={styles.keyText}>{key}</Text>
                            )}
                        </Pressable>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    keyContainer: {
        width: '30%',
        aspectRatio: 1.5, // Rectangular keys
        alignItems: 'center',
        justifyContent: 'center',
    },
    key: {
        width: '100%',
        height: 64, // Large touch target
        backgroundColor: theme.colors.white,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderLight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    keyPressed: {
        backgroundColor: theme.colors.backgroundLight,
        transform: [{ scale: 0.96 }],
    },
    keyText: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
