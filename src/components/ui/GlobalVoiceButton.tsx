import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Animated, Keyboard, Platform, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

export default function GlobalVoiceButton() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { session, isAdmin, hasCompletedSetup } = useAuth();

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const keyboardDidShowListener = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const keyboardDidHideListener = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    // Conditions where we don't want the floating mic to show
    if (!session || isAdmin || !hasCompletedSetup || isKeyboardVisible) {
        return null;
    }

    // Get bottom padding, account for standard tab bar height if we are inside a tab screen
    // On screens without the tab bar, we just use the safe area inset bottom.
    // Assuming standard tab bar height is roughly 64
    const bottomPadding = Math.max(insets.bottom + 80, 100);

    return (
        <View style={[styles.container, { bottom: bottomPadding }]} pointerEvents="box-none">
            <Pressable
                style={({ pressed }) => [
                    styles.micButton,
                    pressed && styles.micButtonPressed
                ]}
                onPress={() => navigation.navigate('VoiceSearch')}
            >
                <MaterialIcons name="mic" size={32} color={theme.colors.white} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 20,
        zIndex: 9999, // Ensure it floats above everything
    },
    micButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 2,
        borderColor: theme.colors.white,
    },
    micButtonPressed: {
        transform: [{ scale: 0.95 }],
        backgroundColor: theme.colors.secondary,
    }
});
