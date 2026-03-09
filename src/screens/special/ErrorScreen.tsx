import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ErrorScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { title, message } = route.params as { title?: string, message?: string } || {};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="error-outline" size={80} color={theme.colors.error} />
                </View>

                <Text style={styles.title}>{title || 'Something went wrong'}</Text>
                <Text style={styles.message}>
                    {message || 'We encountered an unexpected error. Please try again later or contact support if the problem persists.'}
                </Text>

                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        title="Try Again"
                        onPress={() => navigation.goBack()}
                        style={styles.retryButton}
                    />

                    <Pressable
                        style={styles.homeButton}
                        onPress={() => navigation.navigate('Main' as any)}
                    >
                        <Text style={styles.homeButtonText}>Go to Home</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.textMain,
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
    },
    message: {
        fontSize: 18,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 26,
        fontFamily: theme.typography.fontFamily.medium,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
    },
    homeButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
