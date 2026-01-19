import React, { useState, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

const TutorInterface = ({ activeMaterial }) => {
    const { isListening, transcript, isSpeaking, startListening, stopListening, speak } = useVoice();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI English Tutor. I'm ready to help you practice Speaking and Listening. What should we talk about today?" }
    ]);
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [inputText, setInputText] = useState('');
    const [abortController, setAbortController] = useState(null);

    useEffect(() => {
        if (isListening) setStatus('listening');
        else if (isSpeaking) setStatus('speaking');
        else if (status !== 'processing') setStatus('idle');
    }, [isListening, isSpeaking]);

    const handleStop = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setStatus('idle');
        }
    };

    const handleTranslate = async (index) => {
        const msg = messages[index];
        if (!msg || msg.role !== 'assistant') return;

        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',
                    messages: [
                        { role: 'system', content: "You are a translator. Translate the following English text to Korean. Output ONLY the Korean translation." },
                        { role: 'user', content: msg.content }
                    ]
                })
            });
            const data = await res.json();
            const translation = data.message?.content || data.response;

            const newMessages = [...messages];
            newMessages[index] = { ...msg, translation };
            setMessages(newMessages);
        } catch (e) {
            console.error("Translation failed", e);
            alert("Translation failed");
        }
    };

    const handleTextSubmit = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        await handleSend(text);
    };

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
            // 1. Fetch relevant context (active material or all expressions)
            let contextInstruction = "";

            if (activeMaterial) {
                contextInstruction = `\n\nThe user is currently focusing on this learning material:\nTitle: ${activeMaterial.title}\nContent: ${activeMaterial.content}\n\nPlease help the user practice this specific content. Ask questions about it or help them recite it.`;
            } else {
                // Fetch expressions if no specific material is selected
                try {
                    const res = await fetch('http://localhost:8000/expressions');
                    const expressions = await res.json();
                    if (expressions.length > 0) {
                        const exprList = expressions.map(e => `- ${e.expression} (${e.meaning})`).join('\n');
                        contextInstruction = `\n\nThe user has saved the following expressions to practice:\n${exprList}\n\nIf the user asks to practice their expressions, use this list. Pick one at a time to practice.`;
                    }
                } catch (e) {
                    console.error("Failed to fetch expressions for context", e);
                }
            }

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',
                    messages: [
                        { role: 'system', content: `You are a helpful English speaking tutor. Your goal is to help the user practice speaking. Keep your responses VERY concise (1-2 sentences maximum) so the conversation flows quickly. Do not give long explanations unless asked.${contextInstruction}` },
                        ...newMessages.map(m => ({
                            role: m.role,
                            content: m.content
                        }))
                    ]
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
                            {msg.role === 'assistant' && (
                                <div className="mt-2 pt-2 border-t border-gray-600">
                                    {msg.translation ? (
                                        <p className="text-sm text-yellow-300 mb-1">
                                            {msg.translation}
                                        </p>
                                    ) : (
                                        <button
                                            onClick={() => handleTranslate(idx)}
                                            className="text-xs text-blue-300 hover:text-blue-100 underline"
                                        >
                                            번역 (Translate)
                                        </button>
                                    )}
                                </div>
                            )}
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
                    {status === 'processing' && (
                        <div className="flex items-center gap-2">
                            <span>🤔 Thinking...</span>
                            <button
                                onClick={handleStop}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs text-white"
                            >
                                Stop
                            </button>
                        </div>
                    )}
                    {isSpeaking && <span>🔊 Speaking...</span>}
                    {status === 'idle' && !isListening && <span>Click the button below to start speaking</span>}
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    {/* Text Input Area */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleTextSubmit();
                                }
                            }}
                            placeholder="Type your message here..."
                            style={{
                                flex: 1,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.5rem',
                                padding: '0.5rem',
                                color: 'white',
                                resize: 'none',
                                height: '50px'
                            }}
                        />
                        <button
                            onClick={handleTextSubmit}
                            className="btn btn-primary"
                            disabled={!inputText.trim() || status === 'processing' || isSpeaking}
                            style={{ width: '60px' }}
                        >
                            ➤
                        </button>
                    </div>

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
        </div>
    );
};

export default TutorInterface;
