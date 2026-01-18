import React, { useState, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

const TutorInterface = () => {
    const { isListening, transcript, isSpeaking, startListening, stopListening, speak } = useVoice();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI English Tutor. I'm ready to help you practice Speaking and Listening. What should we talk about today?" }
    ]);
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking

    useEffect(() => {
        if (isListening) setStatus('listening');
        else if (isSpeaking) setStatus('speaking');
        else if (status !== 'processing') setStatus('idle');
    }, [isListening, isSpeaking]);

    const handleMicClick = async () => {
        if (isListening) {
            // Stop listening and get the final transcript
            const finalText = stopListening();
            if (finalText.trim()) {
                await handleSend(finalText.trim());
            }
        } else {
            startListening();
        }
    };

    const handleSend = async (text) => {
        if (!text.trim()) return;

        const userMessage = { role: 'user', content: text };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setStatus('processing');

        try {
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'gpt-oss:120b-cloud',
                    messages: newMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) throw new Error("Backend error");

            const data = await response.json();
            const aiText = data.message?.content || data.response || "I couldn't generate a response.";

            setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
            setStatus('speaking');

            // Speak the response
            speak(aiText, () => {
                setStatus('idle');
            });

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'system', content: "Error connecting to AI. Make sure Ollama is running." }]);
            setStatus('idle');
        }
    };

    const handleTestVoice = () => {
        speak("Hello! This is a test of the text to speech system. Can you hear me?");
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '0.75rem'
                    }}>
                        <div style={{
                            maxWidth: '80%',
                            padding: '0.75rem 1rem',
                            borderRadius: '1rem',
                            backgroundColor: msg.role === 'user' ? '#3b82f6' :
                                msg.role === 'system' ? '#dc2626' : '#374151',
                            color: 'white'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Display */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1rem'
            }}>
                <div style={{
                    minHeight: '60px',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '0.5rem',
                    color: '#94a3b8'
                }}>
                    {isListening && (
                        <div>
                            <span style={{ color: '#ef4444' }}>🔴 Recording...</span>
                            <p style={{ marginTop: '0.5rem', color: 'white' }}>{transcript || "Speak now..."}</p>
                        </div>
                    )}
                    {status === 'processing' && <span>🤔 Thinking...</span>}
                    {isSpeaking && <span>🔊 Speaking...</span>}
                    {status === 'idle' && !isListening && <span>Click the button below to start speaking</span>}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleMicClick}
                        className={`btn w-full ${isListening ? 'btn-danger recording-pulse' : 'btn-primary'}`}
                        style={{ flex: 1, justifyContent: 'center' }}
                        disabled={status === 'processing' || isSpeaking}
                    >
                        {isListening ? "⏹️ Stop & Send" : "🎤 Tap to Speak"}
                    </button>
                    <button
                        onClick={handleTestVoice}
                        className="btn btn-secondary"
                        title="Test TTS"
                    >
                        🔊
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TutorInterface;
