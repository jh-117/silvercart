import { useState, useEffect, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// Safely import Voice — works in custom dev build / expo run:android (NOT in Expo Go)
let Voice: any = null;
try {
    Voice = require('@react-native-voice/voice').default;
} catch (e) {
    console.warn('[VoiceRecognition] Native module not available:', e);
}

export interface VoiceRecognitionHook {
    isListening: boolean;
    transcript: string;
    error: string | null;
    startListening: () => Promise<void>;
    stopListening: () => Promise<void>;
    resetTranscript: () => void;
    isAvailable: boolean;
}

async function requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
                title: 'Microphone Permission',
                message: 'SilverCart needs access to your microphone for voice search.',
                buttonPositive: 'Allow',
                buttonNegative: 'Deny',
            }
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.error('[VoiceRecognition] Permission request error:', err);
        return false;
    }
}

export function useVoiceRecognition(): VoiceRecognitionHook {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        if (!Voice) {
            setIsAvailable(false);
            return;
        }

        Voice.isAvailable().then((available: any) => {
            setIsAvailable(!!available);
        }).catch(() => {
            setIsAvailable(false);
        });

        Voice.onSpeechStart = () => {
            setIsListening(true);
            setError(null);
        };

        Voice.onSpeechEnd = () => {
            setIsListening(false);
        };

        Voice.onSpeechResults = (event: any) => {
            if (event.value && event.value.length > 0) {
                setTranscript(event.value[0]);
            }
        };

        Voice.onSpeechError = (event: any) => {
            setIsListening(false);

            if (event.error) {
                const code = event.error.code;

                // Code 7 is "No match" (Android Native SpeechRecognizer)
                // This happens frequently when user pauses or doesn't speak clearly.
                // We shouldn't show a scary red error for this, just silently fail or show a hint.
                if (code === '7' || code === 'ERROR_NO_MATCH') {
                    console.log('[VoiceRecognition] No speech detected (code 7).');
                    return; // Ignore the error to avoid nagging the user
                }

                console.error('[VoiceRecognition] Error:', event.error);
                let errorMessage = 'Speech recognition failed. Please try again.';

                if (code === '9' || code === 'ERROR_INSUFFICIENT_PERMISSIONS') {
                    errorMessage = 'Microphone permission denied. Please enable it in Settings.';
                } else if (code === '5' || code === 'ERROR_CLIENT') {
                    errorMessage = 'Please try again.';
                } else if (code === '8' || code === 'ERROR_RECOGNIZER_BUSY') {
                    errorMessage = 'Voice recognizer is busy. Please wait a moment.';
                }

                setError(errorMessage);
            }
        };

        return () => {
            if (Voice) {
                Voice.destroy().then(Voice.removeAllListeners).catch(() => { });
            }
        };
    }, []);

    const startListening = useCallback(async () => {
        if (!Voice) {
            setError('Voice recognition requires the native build. Shake device → Reload.');
            return;
        }
        // Detect broken native bridge (occurs when module loads but native side is null)
        try {
            const granted = await requestMicrophonePermission();
            if (!granted) {
                setError('Microphone permission denied. Please allow it in your device Settings.');
                return;
            }

            setError(null);
            setTranscript('');
            await Voice.start('en-US');
        } catch (err: any) {
            console.warn('[VoiceRecognition] Error starting:', err);
            if (err?.message?.includes('startSpeech') || err?.message?.includes('null')) {
                setError('Voice module not linked. Please fully close and reopen the app.');
            } else {
                setError('Failed to start voice recognition. Please try again.');
            }
        }
    }, []);

    const stopListening = useCallback(async () => {
        if (!Voice) return;
        try {
            await Voice.stop();
            setIsListening(false);
        } catch (err) {
            console.warn('[VoiceRecognition] Error stopping:', err);
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript,
        isAvailable,
    };
}
