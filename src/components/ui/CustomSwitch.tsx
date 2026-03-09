
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomSwitchProps {
    value: boolean;
    onValueChange: (newValue: boolean) => void;
}

export default function CustomSwitch({ value, onValueChange }: CustomSwitchProps) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 300,
            useNativeDriver: false, // color interpolation doesn't support native driver
        }).start();
    }, [value]);

    // Interpolations based on CSS values
    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22] // approx 13% to 133% of 48px width container width 48 height 27. Knob is 14px.
        // Left: 0 + something. CSS says transform translate(13%, 15%)
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#f1e1e1', '#e2f1e1']
    });

    const borderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#ff0000', '#02c202']
    });

    const knobBackgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(234, 7, 7, 0.5)', 'rgba(2, 194, 2, 0.5)']
    });

    const knobBorderColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['#ea0707', '#02c202']
    });

    return (
        <Pressable onPress={() => onValueChange(!value)} style={{ margin: 10 }}>
            <Animated.View style={[styles.container, { backgroundColor, borderColor }]}>
                <Animated.View style={[styles.knob, {
                    transform: [{ translateX }],
                    backgroundColor: knobBackgroundColor,
                    borderColor: knobBorderColor
                }]}>
                    {/* Icon inside knob */}
                    <View style={styles.iconContainer}>
                        {value ? (
                            <MaterialIcons name="check" size={10} color="#02c202" />
                        ) : (
                            <MaterialIcons name="close" size={10} color="#ea0707" />
                        )}
                    </View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 48,
        height: 27,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
    },
    knob: {
        width: 18, // slightly larger to fit icon
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 2.5, // Center vertically roughly
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
