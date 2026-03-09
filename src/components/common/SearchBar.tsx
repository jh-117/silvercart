import React from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    onPress?: () => void;
    editable?: boolean;
}

const SearchBar = ({
    value,
    onChangeText,
    placeholder = "Search...",
    onPress,
    editable = true
}: SearchBarProps) => {
    return (
        <Pressable onPress={onPress} style={styles.container}>
            <MaterialIcons name="search" size={24} color={theme.colors.textMuted} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                editable={editable}
            />
            {value ? (
                <Pressable onPress={() => onChangeText?.('')}>
                    <MaterialIcons name="close" size={24} color={theme.colors.textMuted} />
                </Pressable>
            ) : null}
        </Pressable>
    );
};

export default SearchBar;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundLight,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: theme.colors.textMain,
        fontFamily: theme.typography.fontFamily.medium,
        height: '100%',
    },
});
