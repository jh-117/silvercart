
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const CIRCLE_SIZE = 9; // Size of individual dot
const RADIUS = 20; // Radius of the spinner circle
const COUNT = 10; // Number of dots

export default function CustomLoader({ style }: { style?: any }) {
    const animations = React.useRef([...Array(COUNT)].map(() => new Animated.Value(0))).current;

    useEffect(() => {
        const createAnimation = (index: number) => {
            const delay = index * 100; // 0.1s stagger
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animations[index], {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animations[index], {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            );
        };

        const parallelAnimations = animations.map((_, i) =>
            Animated.sequence([
                Animated.delay(i * 100),
                Animated.loop(
                    Animated.timing(animations[i], {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease), // Approximate the CSS ease
                        useNativeDriver: true
                    })
                )
            ])
        );

        // CSS Animation is complex (rotate + translate). 
        // A simpler RN approximation: Rotate the whole container or just opacity/scale individual dots.
        // The CSS rotates EACH div around the center which is tricky in RN without absolute positioning calcs.
        // Let's implement the absolute positioning approach.

        Animated.stagger(100, animations.map(anim =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true
                    })
                ])
            )
        )).start();

    }, []);

    return (
        <View style={[styles.container, style]}>
            <View style={styles.spinner}>
                {animations.map((anim, index) => {
                    // Calculate position for each dot in a circle
                    const angle = (index * 36) * (Math.PI / 180); // 36 degrees per dot
                    const x = Math.sin(angle) * RADIUS;
                    const y = -Math.cos(angle) * RADIUS;

                    const transform = [
                        { translateX: x },
                        { translateY: y },
                        { rotate: `${index * 36}deg` }, // Rotate dot to face center
                        { scale: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.5, 1] }) } // Pulse effect
                    ];

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    transform: transform as any,
                                    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] })
                                }
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100,
    },
    spinner: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        position: 'absolute',
        width: 6,
        height: 18, // Elongated like the CSS divs (width 50%, height 150% of 9px container)
        backgroundColor: '#000000',
        borderRadius: 3,
    }
});
