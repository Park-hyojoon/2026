import React, { useState, useEffect } from 'react';
import { useVoice } from '../hooks/useVoice';

const TutorInterface = ({ activeMaterial }) => {
    const { isListening, transcript, isSpeaking, startListening, stopListening, speak } = useVoice();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI English Tutor. Ready to practice?" }
    ]);
    const [status, setStatus] = useState('idle');
    const [inputText, setInputText] = useState('');
    const [abortController, setAbortController] = useState(null);
    const [completedMissions, setCompletedMissions] = useState([]);

    useEffect(() => {
        if (isListening) setStatus('listening');
        else if (isSpeaking) setStatus('speaking');
        else if (status !== 'processing') setStatus('idle');
    }, [isListening, isSpeaking]);

    useEffect(() => {
        if (!activeMaterial || !activeMaterial.target_phrases) return;
        const normalize = (text) => text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();

        if (isListening && transcript) checkMissions(transcript);
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === 'user') checkMissions(lastMsg.content);

        function checkMissions(text) {
            const normalizedText = normalize(text);
            activeMaterial.target_phrases.forEach(phrase => {
                if (completedMissions.includes(phrase)) return;
                const normalizedPhrase = normalize(phrase);
                if (normalizedText.includes(normalizedPhrase)) {
                    setCompletedMissions(prev => [...prev, phrase]);
                }
            });
        }
    }, [transcript, messages, activeMaterial, isListening]);

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
                        { role: 'system', content: "Translate to Korean. Output ONLY Korean." },
                        { role: 'user', content: msg.content }
                    ]
                })
            });
            const data = await res.json();
            const translation = data.message?.content || data.response;
            const newMessages = [...messages];
            newMessages[index] = { ...msg, translation };
            setMessages(newMessages);
        } catch (e) { alert("Translation failed"); }
    };

    const handleTextSubmit = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        await handleSend(text);
    };

    const handleMicClick = async () => {
        if (isListening) {
            const finalText = stopListening();
            if (finalText.trim()) await handleSend(finalText.trim());
        } else {
            startListening();
        }
    };

    const handleSend = async (text) => {
        if (!text.trim()) return;
        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setStatus('processing');
        const controller = new AbortController();
        setAbortController(controller);

        try {
            let systemPrompt = "You are a helpful English speaking tutor.";
            if (activeMaterial) {
                const remaining = activeMaterial.target_phrases.filter(p => !completedMissions.includes(p));
                const missionText = remaining.length > 0
                    ? `\n\n[USER MISSIONS]: The user must say these phrases: ${JSON.stringify(remaining)}.\nGuide the conversation so they say them.`
                    : "\n\n[MISSIONS CLEARED]: Congratulate the user!";
                systemPrompt = `Role: ${activeMaterial.ai_role}. User Role: ${activeMaterial.user_role}. Context: ${activeMaterial.content}. ${missionText}. Keep responses concise.`;
            }

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    model: 'llama3',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        userMessage
                    ]
                })
            });
            if (!response.ok) throw new Error("Backend error");
            const data = await response.json();
            const aiText = data.message?.content || data.response;
            setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
            setStatus('speaking');
            speak(aiText, () => setStatus('idle'));
        } catch (error) {
            if (error.name !== 'AbortError') {
                setMessages(prev => [...prev, { role: 'system', content: "Error connecting to AI." }]);
                setStatus('idle');
            }
        } finally { setAbortController(null); }
    };

    return (
        <div className="h-full flex gap-0 divide-x divide-gray-100">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Chat Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                            🤖
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">AI Tutor</h3>
                            <p className="text-xs text-gray-400">{status === 'processing' ? 'Thinking...' : 'Online'}</p>
                        </div>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] p-4 rounded-2xl relative shadow-sm
                                ${msg.role === 'user'
                                    ? 'bg-yellow-400 text-gray-900 rounded-tr-sm'
                                    : msg.role === 'system'
                                        ? 'bg-red-50 text-red-500'
                                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                }
                            `}>
                                <div className="leading-relaxed">{msg.content}</div>
                                {msg.role === 'assistant' && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        {msg.translation ? (
                                            <p className="text-sm text-gray-600 font-medium bg-white p-2 rounded">
                                                {msg.translation}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={() => handleTranslate(idx)}
                                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                🌐 Translate
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-50 m-4 rounded-3xl border border-gray-100 flex gap-2 items-center">
                    <button
                        onClick={handleMicClick}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${isListening
                                ? 'bg-red-500 text-white recording-pulse'
                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                            }`}
                        disabled={status === 'processing' || isSpeaking}
                    >
                        <span className="text-xl">{isListening ? '⏹' : '🎤'}</span>
                    </button>

                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                        placeholder={isListening ? "Listening..." : "Type your message..."}
                        className="flex-1 bg-transparent border-none shadow-none focus:ring-0 p-2"
                        disabled={status === 'processing'}
                    />

                    <button
                        onClick={handleTextSubmit}
                        disabled={!inputText.trim()}
                        className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:hover:bg-yellow-400"
                    >
                        ➤
                    </button>
                </div>
            </div>

            {/* Mission Sidebar (Right Panel Style) */}
            {activeMaterial?.target_phrases?.length > 0 && (
                <div className="w-72 bg-gray-50 flex flex-col border-l border-gray-100">
                    <div className="p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>🎯 Missions</span>
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                                {completedMissions.length} / {activeMaterial.target_phrases.length}
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {activeMaterial.target_phrases.map((phrase, idx) => {
                                const isCompleted = completedMissions.includes(phrase);
                                return (
                                    <div
                                        key={idx}
                                        className={`p-4 rounded-2xl transition-all ${isCompleted
                                                ? 'bg-green-100 text-green-800 border-l-4 border-green-500'
                                                : 'bg-white border border-gray-100 text-gray-500'
                                            }`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200'
                                                }`}>
                                                {isCompleted ? '✓' : idx + 1}
                                            </div>
                                            <p className={`text-sm font-medium ${isCompleted ? 'line-through' : ''}`}>
                                                {phrase}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorInterface;
