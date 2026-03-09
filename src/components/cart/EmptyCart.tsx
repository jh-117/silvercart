import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';

export const EmptyCart = () => {
    const navigation = useNavigation<any>();

    const handleShopNow = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons
                    name="shopping-cart"
                    size={120}
                    color={theme.colors.borderLight}
                />
            </View>

            <Text style={styles.title}>Your cart is empty</Text>
            <Text style={styles.subtitle}>
                Add items to your cart to get started
            </Text>

            <Pressable
                style={styles.button}
                onPress={handleShopNow}
                hitSlop={8}
            >
                <Text style={styles.buttonText}>Shop Now</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: theme.colors.backgroundLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 12,
        fontFamily: theme.typography.fontFamily.bold,
    },
    subtitle: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: theme.typography.fontFamily.medium,
        lineHeight: 26,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 48,
        borderRadius: 30,
        minWidth: 200,
        minHeight: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
