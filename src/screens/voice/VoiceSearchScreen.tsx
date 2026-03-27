import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert, Platform, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { processVoiceCommand } from '../../services/aiService';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../services/supabase';
import * as Speech from 'expo-speech';

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

    const speakAndSetStatus = (text: string) => {
        setStatusText(text);
        Speech.speak(text, { language: 'en-US', rate: 1.0 });
    };

    const handleVoiceCommand = async (command: any) => {
        try {
            switch (command.intent) {
                case 'search':
                    if (command.params?.query) {
                        speakAndSetStatus(`Searching for "${command.params.query}"...`);
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
                        speakAndSetStatus(`Opening ${command.params.category}...`);
                        setTimeout(() => {
                            navigation.navigate('Category', {
                                category: command.params.category
                            });
                        }, 500);
                    } else if (command.params?.screen) {
                        speakAndSetStatus(`Opening ${command.params.screen}...`);
                        setTimeout(() => {
                            navigation.navigate(command.params.screen);
                        }, 500);
                    }
                    break;

                case 'cart':
                    speakAndSetStatus('Opening your cart...');
                    setTimeout(() => {
                        navigation.navigate('Cart');
                    }, 500);
                    break;

                case 'orders':
                    speakAndSetStatus('Opening your orders...');
                    setTimeout(() => {
                        navigation.navigate('OrderHistory');
                    }, 500);
                    break;

                case 'profile':
                    speakAndSetStatus('Opening your profile...');
                    setTimeout(() => {
                        navigation.navigate('Profile');
                    }, 500);
                    break;

                case 'add_to_cart':
                    if (command.items && command.items.length > 0) {
                        try {
                            const { data: userData } = await supabase.auth.getUser();
                            if (userData.user) {
                                let addedCount = 0;
                                let notFoundNames: string[] = [];

                                for (const item of command.items) {
                                    if (item.products && item.products.length > 0) {
                                        const product = item.products[0];
                                        await supabase.from('cart_items').upsert({
                                            user_id: userData.user.id,
                                            product_id: product.id,
                                            quantity: item.quantity || 1
                                        }, { onConflict: 'user_id,product_id' });
                                        addedCount++;
                                    } else {
                                        notFoundNames.push(item.product);
                                    }
                                }

                                if (addedCount > 0) {
                                    if (notFoundNames.length > 0) {
                                        const omitted = notFoundNames.join(' and ');
                                        toast.showSuccess(`Added ${addedCount} item(s). Couldn't find: ${omitted}`);
                                        speakAndSetStatus(`Added some items to your cart, but I couldn't find ${omitted}.`);
                                    } else {
                                        toast.showSuccess(`Added ${addedCount} item(s) to cart.`);
                                        speakAndSetStatus(command.response || `Added everything to your cart.`);
                                    }
                                    setTimeout(() => {
                                        navigation.navigate('Cart');
                                    }, 1500);
                                } else {
                                    toast.showWarning(`Could not find those products.`);
                                    speakAndSetStatus(`I couldn't find those items. Here are some alternatives.`);
                                    setTimeout(() => {
                                        navigation.navigate('SearchResults', { query: command.items[0].product, category: 'all' });
                                    }, 1500);
                                }
                            }
                        } catch (err) {
                            console.error('Cart add error', err);
                            toast.showError('Failed to add to cart');
                            speakAndSetStatus('Sorry, I failed to add that to your cart.');
                        }
                    }
                    break;

                case 'remove_from_cart':
                    if (command.items && command.items.length > 0) {
                        try {
                            const { data: userData } = await supabase.auth.getUser();
                            if (userData.user) {
                                let removedCount = 0;
                                for (const item of command.items) {
                                    if (item.products && item.products.length > 0) {
                                        const product = item.products[0];
                                        await supabase.from('cart_items').delete()
                                            .eq('user_id', userData.user.id)
                                            .eq('product_id', product.id);
                                        removedCount++;
                                    }
                                }

                                if (removedCount > 0) {
                                    toast.showSuccess(`Removed ${removedCount} item(s) from cart.`);
                                    speakAndSetStatus(`Done. I've removed it from your cart.`);
                                } else {
                                    toast.showWarning(`Could not find those products in your cart.`);
                                    speakAndSetStatus(`I couldn't find those to remove.`);
                                }
                                setTimeout(() => {
                                    navigation.navigate('Cart');
                                }, 1500);
                            }
                        } catch (err) {
                            console.error('Cart remove error', err);
                            speakAndSetStatus('Sorry, I failed to remove that.');
                        }
                    }
                    break;

                case 'checkout':
                    speakAndSetStatus('Opening checkout...');
                    setTimeout(() => {
                        navigation.navigate('CheckoutAddress');
                    }, 500);
                    break;
                    
                case 'support':
                    speakAndSetStatus('Opening help and support...');
                    setTimeout(() => {
                        navigation.navigate('Support');
                    }, 500);
                    break;
                    
                case 'call_contact':
                    if (command.contactName) {
                        try {
                            const { data: userData } = await supabase.auth.getUser();
                            if (userData.user) {
                                speakAndSetStatus(`Looking up ${command.contactName}...`);
                                const { data: contacts } = await supabase
                                    .from('trusted_contacts')
                                    .select('*')
                                    .eq('user_id', userData.user.id)
                                    .ilike('full_name', `%${command.contactName}%`);
                                    
                                if (contacts && contacts.length > 0) {
                                    speakAndSetStatus(`Calling ${contacts[0].full_name}...`);
                                    setTimeout(() => {
                                        Linking.openURL(`tel:${contacts[0].phone_number}`).catch(() => {
                                            toast.showError('Unable to open phone dialer');
                                        });
                                    }, 1000);
                                } else {
                                    speakAndSetStatus(`I could not find ${command.contactName} in your Trusted Contacts.`);
                                    toast.showWarning(`Contact "${command.contactName}" not found.`);
                                }
                            }
                        } catch (err) {
                            console.error('Contact search error', err);
                            speakAndSetStatus('Sorry, I failed to look up your contacts.');
                        }
                    } else {
                        speakAndSetStatus('Who would you like to call? Please try again in your Trusted Contacts list.');
                        setTimeout(() => {
                            navigation.navigate('Profile');
                        }, 1500);
                    }
                    break;

                default:
                    toast.showInfo('Try saying "search for milk" or "show my cart"');
                    speakAndSetStatus('I did not understand that. Try saying search for milk.');
            }
        } catch (err) {
            console.error('Navigation error:', err);
            toast.showError('Failed to navigate. Please try again.');
            speakAndSetStatus('Failed to navigate. Please try again.');
        }
    };

    const [showHelp, setShowHelp] = useState(false);

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
                    <Animated.View
                        style={[
                            styles.micRing,
                            {
                                transform: [{ scale: pulseAnim }],
                                opacity: isListening || isProcessing ? 0.3 : 0,
                                backgroundColor: isProcessing ? theme.colors.primary : undefined
                            }
                        ]}
                    />
                    <Pressable
                        style={[
                            styles.micButton,
                            (isListening || isProcessing) && styles.micButtonActive
                        ]}
                        onPress={isProcessing ? undefined : handleMicPress}
                        hitSlop={8}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="large" color={theme.colors.white} />
                        ) : (
                            <MaterialIcons
                                name={isListening ? 'mic' : 'mic-none'}
                                size={64}
                                color={theme.colors.white}
                            />
                        )}
                    </Pressable>
                </View>

                {/* Toggleable Help Section */}
                <Pressable
                    style={styles.helpToggleButton}
                    onPress={() => {
                        // Navigate to our new dedicated Help screen
                        navigation.navigate('VoiceCommandsHelp');
                    }}
                >
                    <MaterialIcons name="info-outline" size={24} color={theme.colors.white} />
                    <Text style={styles.helpToggleText}>What can I say?</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.white} />
                </Pressable>
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
        marginBottom: 30,
        minHeight: 80,
        fontFamily: theme.typography.fontFamily.bold,
    },
    micContainer: {
        position: 'relative',
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
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
    helpToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        marginBottom: 16,
        gap: 8,
    },
    helpToggleText: {
        color: theme.colors.white,
        fontSize: 16,
        fontFamily: theme.typography.fontFamily.bold,
    },
    fullHintsContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 24,
        borderRadius: 16,
        maxHeight: 250,
    },
    categoryTitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        fontFamily: theme.typography.fontFamily.bold,
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
        fontSize: 16,
        color: theme.colors.white,
        fontFamily: theme.typography.fontFamily.medium,
        marginBottom: 4,
    },
});
