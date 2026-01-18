import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoice = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voicesLoaded, setVoicesLoaded] = useState(false);
    const recognitionRef = useRef(null);
    const synthesisRef = useRef(window.speechSynthesis);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        // Load voices
        const loadVoices = () => {
            const voices = synthesisRef.current.getVoices();
            if (voices.length > 0) {
                setVoicesLoaded(true);
            }
        };

        loadVoices();
        synthesisRef.current.onvoiceschanged = loadVoices;

        // Setup Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true; // Keep listening until manually stopped
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = 0; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + ' ';
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                finalTranscriptRef.current = finalTranscript;
                setTranscript(finalTranscript + interimTranscript);
            };

            recognitionRef.current.onend = () => {
                // Only set isListening to false if we intentionally stopped
                // Otherwise, recognition might have auto-stopped due to silence
                if (isListening) {
                    // Restart if still supposed to be listening
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        setIsListening(false);
                    }
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                if (event.error !== 'no-speech') {
                    setIsListening(false);
                }
            };
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            setTranscript('');
            finalTranscriptRef.current = '';
            setIsListening(true);
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Already started", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
        return finalTranscriptRef.current || transcript;
    }, [transcript]);

    const speak = useCallback((text, onEnd) => {
        if (!text) {
            if (onEnd) onEnd();
            return;
        }

        // Cancel any previous speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Find a good English voice
        const voices = synthesisRef.current.getVoices();
        console.log("Available voices:", voices.map(v => v.name));

        const preferredVoice = voices.find(v =>
            v.lang.startsWith('en') && (
                v.name.includes('Google US English') ||
                v.name.includes('Microsoft David') ||
                v.name.includes('Microsoft Zira') ||
                v.name.includes('Samantha')
            )
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log("Using voice:", preferredVoice.name);
        }

        utterance.onstart = () => {
            console.log("TTS started");
            setIsSpeaking(true);
        };

        utterance.onend = () => {
            console.log("TTS ended");
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error("TTS Error", e);
            setIsSpeaking(false);
            if (onEnd) onEnd();
        };

        // Chrome bug workaround: speak may not work if called too quickly
        setTimeout(() => {
            synthesisRef.current.speak(utterance);
        }, 100);

    }, []);

    return {
        isListening,
        transcript,
        isSpeaking,
        voicesLoaded,
        startListening,
        stopListening,
        speak
    };
};
