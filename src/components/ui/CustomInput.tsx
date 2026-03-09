
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, Platform } from 'react-native';

interface CustomInputProps extends TextInputProps { }

export default function CustomInput(props: CustomInputProps) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <TextInput
                {...props}
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    props.style
                ]}
                placeholderTextColor="#999"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    input: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    inputFocused: {
        backgroundColor: '#ffffff',
        borderColor: '#006d5b', // theme.colors.primary
        borderWidth: 1.5,
    }
});
