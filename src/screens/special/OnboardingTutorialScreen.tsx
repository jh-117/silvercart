import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { OnboardingTutorialScreenProps } from '../../navigation/types';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        title: 'Tap to search by voice',
        description: "No need to type. Just say what you're looking for, and I'll find it for you.",
        icon: 'mic',
        color: theme.colors.primary,
    },
    {
        id: 2,
        title: 'Easy to Read & Tap',
        description: 'Buttons and text are large enough for everyone to see clearly.',
        icon: 'visibility', // representation for accessibility/easy read
        color: '#6B8E7A', // accent-sage from design
    },
    {
        id: 3,
        title: 'Simple 3-Step Shopping',
        description: 'Pick your items, confirm details, and your package arrives at your door.',
        icon: 'shopping-cart',
        color: theme.colors.primary,
    },
];

export default function OnboardingTutorialScreen({ navigation }: OnboardingTutorialScreenProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        if (roundIndex !== activeIndex) {
            setActiveIndex(roundIndex);
        }
    };

    const handleNext = async () => {
        if (activeIndex < slides.length - 1) {
            scrollRef.current?.scrollTo({ x: width * (activeIndex + 1), animated: true });
        } else {
            // Save state and Navigate to Main
            await SecureStore.setItemAsync('hasOnboarded', 'true');
            // We can't easily force a re-render of RootNavigator from here without a context/reload
            // But usually, navigating to Main works because it's in the stack. 
            // However, with the conditional rendering in RootNavigator, we might need to reload or use a context.
            // For now, let's just navigate. If RootNavigator re-evaluates, it will hide Onboarding.
            navigation.getParent()?.navigate('Main' as any);
        }
    };

    const handleSkip = async () => {
        await SecureStore.setItemAsync('hasOnboarded', 'true');
        navigation.getParent()?.navigate('Main' as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.brandContainer}>
                    <MaterialIcons name="shield" size={32} color={theme.colors.primary} />
                    <Text style={styles.brandText}>SilverCart</Text>
                </View>
                <Pressable onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </Pressable>
            </View>

            {/* Carousel */}
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {slides.map((slide) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={styles.illustrationContainer}>
                            <View style={styles.illustrationCircle}>
                                <View style={[styles.innerCircle, { backgroundColor: slide.color }]}>
                                    <MaterialIcons name={slide.icon as any} size={64} color={theme.colors.white} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{slide.title}</Text>
                            <Text style={styles.description}>{slide.description}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {/* Indicators */}
                <View style={styles.indicatorContainer}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                index === activeIndex ? [styles.activeIndicator, { backgroundColor: theme.colors.primary }] : null
                            ]}
                        />
                    ))}
                </View>

                {/* Next Button */}
                <Pressable
                    style={[styles.nextButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>
                        {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    <MaterialIcons name="chevron-right" size={24} color={theme.colors.white} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    brandText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111718',
        fontFamily: theme.typography.fontFamily.bold,
    },
    skipText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semibold,
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    illustrationContainer: {
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 48,
    },
    illustrationCircle: {
        width: 192,
        height: 192,
        borderRadius: 96,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 8,
        borderColor: '#F8F7F7',
    },
    innerCircle: {
        width: 144,
        height: 144,
        borderRadius: 72,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111718',
        textAlign: 'center',
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    description: {
        fontSize: 18,
        fontWeight: '500',
        color: '#4B5563', // gray-600
        textAlign: 'center',
        lineHeight: 28,
        fontFamily: theme.typography.fontFamily.medium,
    },
    footer: {
        padding: 32,
        gap: 32,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    indicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#D1D5DB', // gray-300
    },
    activeIndicator: {
        width: 32,
    },
    nextButton: {
        height: 64,
        borderRadius: 32,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
