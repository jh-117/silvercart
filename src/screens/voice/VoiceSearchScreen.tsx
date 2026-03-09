import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { processVoiceCommand } from '../../services/aiService';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../services/supabase';

export default function VoiceSearchScreen() {
    const navigation = useNavigation<any>();
    const toast = useToast();
    const {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        isAvailable
    } = useVoiceRecognition();

    const [pulseAnim] = useState(new Animated.Value(1));
    const [statusText, setStatusText] = useState('Tap the microphone to speak');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Some Android devices (especially chinese ROMs) return 'isAvailable = false'
        // even when the SpeechRecognizer is present but not set as default.
        // We will just let the user try starting it; if it fails, Voice.onSpeechError will catch it.
        if (isAvailable === false && Platform.OS === 'ios') {
            toast.showError('Voice recognition is not available on this device');
        }
    }, [isAvailable]);

    useEffect(() => {
        if (isListening) {
            setStatusText("I'm listening...");
            // Start pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            setStatusText('Tap the microphone to speak');
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isListening]);

    useEffect(() => {
        if (error) {
            toast.showError(error);
            setStatusText('Tap the microphone to try again');
        }
    }, [error]);

    useEffect(() => {
        if (transcript && transcript.length > 0 && !isListening) {
            handleProcessTranscript(transcript);
        }
    }, [transcript, isListening]);

    const handleProcessTranscript = async (text: string) => {
        setIsProcessing(true);
        setStatusText("Thinking...");

        try {
            const command = await processVoiceCommand(text);

            if (command.response) {
                setStatusText(command.response);
            }

            if (command.confidence && command.confidence > 0.4 || command.intent !== 'unknown') {
                setTimeout(() => handleVoiceCommand(command), 1000); // 1 sec delay to read the response
            } else {
                toast.showWarning('Sorry, I didn\'t understand that. Please try again.');
                setStatusText('Tap the microphone to try again');
            }
        } catch (err) {
            console.error('AI Processing error:', err);
            toast.showError('Trouble understanding. Please try again.');
            setStatusText('Tap the microphone to try again');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVoiceCommand = async (command: any) => {
        try {
            switch (command.intent) {
                case 'search':
                    if (command.params?.query) {
                        setStatusText(`Searching for "${command.params.query}"...`);
                        setTimeout(() => {
                            navigation.navigate('SearchResults', {
                                query: command.params.query,
                                category: 'all'
                            });
                        }, 500);
                    }
                    break;

                case 'navigate':
                    if (command.params?.category) {
                        setStatusText(`Opening ${command.params.category}...`);
                        setTimeout(() => {
                            navigation.navigate('Category', {
                                category: command.params.category
                            });
                        }, 500);
                    }
                    break;

                case 'cart':
                    setStatusText('Opening your cart...');
                    setTimeout(() => {
                        navigation.navigate('Cart');
                    }, 500);
                    break;

                case 'orders':
                    setStatusText('Opening your orders...');
                    setTimeout(() => {
                        navigation.navigate('Orders');
                    }, 500);
                    break;

                case 'profile':
                    setStatusText('Opening your profile...');
                    setTimeout(() => {
                        navigation.navigate('Profile');
                    }, 500);
                    break;

                case 'add_to_cart':
                    if (command.product) {
                        try {
                            const { data: userData } = await supabase.auth.getUser();
                            if (userData.user && command.products && command.products.length > 0) {
                                // Add first match to cart
                                const product = command.products[0];
                                await supabase.from('cart_items').upsert({
                                    user_id: userData.user.id,
                                    product_id: product.id,
                                    quantity: command.quantity || 1
                                }, { onConflict: 'user_id,product_id' });

                                toast.showSuccess(`Added ${product.name} to cart.`);
                                setTimeout(() => {
                                    navigation.navigate('Cart');
                                }, 1000);
                            } else {
                                toast.showWarning(`Could not find product: ${command.product}`);
                                setTimeout(() => {
                                    navigation.navigate('SearchResults', { query: command.product, category: 'all' });
                                }, 500);
                            }
                        } catch (err) {
                            console.error('Cart add error', err);
                            toast.showError('Failed to add to cart');
                        }
                    }
                    break;

                case 'checkout':
                    setStatusText('Opening checkout...');
                    setTimeout(() => {
                        navigation.navigate('Checkout');
                    }, 500);
                    break;

                default:
                    toast.showInfo('Try saying "search for milk" or "show my cart"');
                    setStatusText('Tap the microphone to try again');
            }
        } catch (err) {
            console.error('Navigation error:', err);
            toast.showError('Failed to navigate. Please try again.');
        }
    };

    const handleMicPress = async () => {
        if (isListening) {
            await stopListening();
        } else {
            await startListening();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Pressable
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
                hitSlop={8}
            >
                <MaterialIcons name="close" size={32} color={theme.colors.white} />
            </Pressable>

            <View style={styles.content}>
                <Text style={styles.statusText}>
                    {statusText}
                </Text>

                <Text style={styles.transcript}>
                    {transcript || (isListening ? 'Listening...' : '')}
                </Text>

                <View style={styles.micContainer}>
                    {isProcessing ? (
                        <View style={styles.processingContainer}>
                            <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }], opacity: 0.5, backgroundColor: theme.colors.primary }]} />
                        </View>
                    ) : (
                        <>
                            <Animated.View
                                style={[
                                    styles.micRing,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                        opacity: isListening ? 0.3 : 0
                                    }
                                ]}
                            />
                            <Pressable
                                style={[
                                    styles.micButton,
                                    isListening && styles.micButtonActive
                                ]}
                                onPress={handleMicPress}
                                hitSlop={8}
                            >
                                <MaterialIcons
                                    name={isListening ? 'mic' : 'mic-none'}
                                    size={64}
                                    color={theme.colors.white}
                                />
                            </Pressable>
                        </>
                    )}
                </View>

                <View style={styles.hintsContainer}>
                    <Text style={styles.hintsTitle}>Try saying:</Text>
                    <View style={styles.hintItem}>
                        <MaterialIcons name="search" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.hintText}>"Search for milk"</Text>
                    </View>
                    <View style={styles.hintItem}>
                        <MaterialIcons name="local-pharmacy" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.hintText}>"Show me pharmacy"</Text>
                    </View>
                    <View style={styles.hintItem}>
                        <MaterialIcons name="shopping-cart" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.hintText}>"Show my cart"</Text>
                    </View>
                    <View style={styles.hintItem}>
                        <MaterialIcons name="history" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.hintText}>"Where are my orders?"</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 122, 106, 0.95)', // Primary color with opacity
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        zIndex: 10,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    transcript: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.white,
        textAlign: 'center',
        marginBottom: 60,
        minHeight: 80,
        fontFamily: theme.typography.fontFamily.bold,
    },
    micContainer: {
        position: 'relative',
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 60,
    },
    processingContainer: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    micRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: theme.colors.white,
    },
    micButton: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        borderWidth: 4,
        borderColor: theme.colors.white,
    },
    micButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    hintsContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 24,
        borderRadius: 16,
    },
    hintsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    hintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    hintText: {
        fontSize: 18,
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.medium,
    },
});
