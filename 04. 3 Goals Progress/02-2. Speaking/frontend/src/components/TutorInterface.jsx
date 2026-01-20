import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../hooks/useVoice';

const TutorInterface = ({ activeMaterial }) => {
    const { isListening, transcript, isSpeaking, startListening, stopListening, speak } = useVoice();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your AI English Tutor. I've prepared a great session for you. Ready to start?" }
    ]);
    const [status, setStatus] = useState('idle');
    const [inputText, setInputText] = useState('');
    const [abortController, setAbortController] = useState(null);
    const [completedMissions, setCompletedMissions] = useState([]);

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isListening) setStatus('listening');
        else if (isSpeaking) setStatus('speaking');
        else if (status !== 'processing') setStatus('idle');
    }, [isListening, isSpeaking]);

    useEffect(() => {
        if (!activeMaterial?.target_phrases) return;
        const normalize = (text) => text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();

        if (isListening && transcript) checkMissions(transcript);
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.role === 'user') checkMissions(lastMsg.content);

        function checkMissions(text) {
            const normalizedText = normalize(text);
            activeMaterial.target_phrases.forEach(phrase => {
                if (completedMissions.includes(phrase)) return;
                if (normalizedText.includes(normalize(phrase))) {
                    setCompletedMissions(prev => [...prev, phrase]);
                }
            });
        }
    }, [transcript, messages, activeMaterial, isListening]);

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
            let systemPrompt = "You are a helpful English speaking tutor. Keep responses concise (1-2 sentences).";

            if (activeMaterial) {
                // Scenario/Role-play 모드
                const remaining = activeMaterial.target_phrases.filter(p => !completedMissions.includes(p));
                const missionText = remaining.length > 0
                    ? `\n\n[USER MISSIONS - CRITICAL]: The user MUST practice these exact phrases: ${JSON.stringify(remaining)}.
                       Your job is to PERSISTENTLY guide the conversation so the user naturally says these phrases.
                       - Create situations where they need to use these expressions
                       - If they struggle, give hints or rephrase the scenario
                       - Don't give up until they say each phrase!`
                    : "\n\n[ALL MISSIONS COMPLETE]: Congratulate them enthusiastically! Suggest practicing again or trying new expressions.";
                systemPrompt = `You are playing the role of: ${activeMaterial.ai_role}
The user is playing: ${activeMaterial.user_role}
Scenario: ${activeMaterial.content}
${missionText}
Stay in character. Be conversational and concise (1-2 sentences max).`;
            } else {
                // Expression Bank 학습 모드 - 저장된 표현 가져오기
                try {
                    const res = await fetch('http://localhost:8000/expressions');
                    const expressions = await res.json();
                    if (expressions.length > 0) {
                        const exprList = expressions.map(e => `• "${e.expression}" - ${e.meaning}`).join('\n');
                        systemPrompt = `You are a PERSISTENT English tutor. Your mission is to help the user MASTER these saved expressions:

${exprList}

TEACHING METHOD:
1. Pick ONE expression the user hasn't practiced yet
2. Create a realistic conversation scenario where they MUST use it
3. If they use it correctly: praise them, then move to the next expression
4. If they struggle: give hints, break it down, but DON'T give up!
5. Keep drilling until they can use each expression naturally

Be encouraging but RELENTLESS. Keep responses short (1-2 sentences).`;
                    }
                } catch (e) {
                    console.error("Failed to fetch expressions for context", e);
                }
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
                setMessages(prev => [...prev, { role: 'system', content: "Connection lost. Try again." }]);
                setStatus('idle');
            }
        } finally { setAbortController(null); }
    };

    const handleTranslate = async (index) => {
        const msg = messages[index];
        try {
            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'llama3',
                    messages: [{ role: 'system', content: "Translate to Korean. ONLY Korean." }, { role: 'user', content: msg.content }]
                })
            });
            const data = await res.json();
            const newMessages = [...messages];
            newMessages[index] = { ...msg, translation: data.message?.content || data.response };
            setMessages(newMessages);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="h-full flex flex-col pt-4 animate-fade-in relative">
            {/* Header Info */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gray-100 shadow-inner">🤖</div>
                    <div>
                        <h4 className="font-bold text-gray-800">AI Tutor</h4>
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active Voice Sync</p>
                    </div>
                </div>
                {activeMaterial && (
                    <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 flex items-center gap-3">
                        <span className="text-xs font-bold text-yellow-800">Mission: {completedMissions.length}/{activeMaterial.target_phrases.length}</span>
                        <div className="w-20 bg-yellow-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${(completedMissions.length / activeMaterial.target_phrases.length) * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-8 chat-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
                            {msg.content}
                        </div>
                        {msg.role === 'assistant' && (
                            <div className="mt-3 flex items-center gap-4 px-2">
                                {msg.translation ? (
                                    <p className="text-xs font-medium text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        " {msg.translation} "
                                    </p>
                                ) : (
                                    <button onClick={() => handleTranslate(idx)} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-600 transition">
                                        🌐 Translation
                                    </button>
                                )}
                                <button onClick={() => speak(msg.content)} className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-gray-500 transition">
                                    🔊 Replay
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Float Input Action */}
            <div className="sticky bottom-4 left-0 right-0 bg-white/80 backdrop-blur-md p-2 rounded-[2.5rem] border border-gray-100 shadow-2xl flex items-center gap-4 max-w-3xl mx-auto w-full">
                <button
                    onClick={handleMicClick}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 scale-110 shadow-lg shadow-red-200' : 'bg-gray-900 text-white hover:bg-black'
                        }`}
                >
                    <span className="text-2xl">{isListening ? '⏹' : '🎤'}</span>
                </button>

                <input
                    className="flex-1 bg-transparent border-none outline-none font-medium text-gray-800 px-2"
                    placeholder={isListening ? "Listening to your voice..." : "Type your message and press enter..."}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (setInputText(''), handleSend(inputText))}
                    disabled={status === 'processing'}
                />

                <button
                    onClick={() => (setInputText(''), handleSend(inputText))}
                    disabled={!inputText.trim()}
                    className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-gray-900 hover:bg-yellow-500 transition disabled:opacity-30"
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default TutorInterface;
