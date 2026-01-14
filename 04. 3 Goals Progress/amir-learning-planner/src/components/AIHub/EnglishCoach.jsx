import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Zap, Mic, MicOff, Send, Quote, Volume2, VolumeX } from 'lucide-react';

export default function EnglishCoach({ data, onSavePhrase }) {
    const [view, setView] = useState('dashboard'); // dashboard, chat
    const [targetPhrases, setTargetPhrases] = useState([]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [newPhraseInput, setNewPhraseInput] = useState("");

    // 음성 기능 상태
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const recognitionRef = useRef(null);

    // 저장된 phrases 불러오기
    const savedPhrases = data?.english?.targetPhrases || [];

    // 음성 인식 초기화
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => {
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    // 음성 합성 (TTS)
    const speakText = (text) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    // 음성 인식 토글
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('음성 인식이 지원되지 않는 브라우저입니다.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const startSession = (phrases) => {
        setTargetPhrases(phrases);
        setView('chat');
        const greeting = `Hi! Let's practice using: "${phrases.join(', ')}". I'll ask questions to help you use them naturally. Ready?`;
        setMessages([{ role: 'ai', text: greeting }]);
        speakText(greeting);
    };

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput("");

        // AI 응답 로직 - "집착적 유도"
        setTimeout(() => {
            let aiResponse;
            const usedPhrase = targetPhrases.find(p => userMsg.toLowerCase().includes(p.toLowerCase()));

            if (usedPhrase) {
                aiResponse = `Excellent! You used "${usedPhrase}" perfectly! Can you use it one more time in a different context?`;
            } else {
                // 집착적으로 target phrase 사용 유도
                const elicitationPrompts = [
                    `Interesting! By the way, how would you "${targetPhrases[0]}" in your work?`,
                    `I see. Can you tell me about a time when you had to "${targetPhrases[0]}"?`,
                    `That's good! Now, try to use "${targetPhrases[0]}" in your next sentence.`,
                    `Nice! But I really want to hear you say "${targetPhrases[0]}". Give it a try!`,
                    `Hmm, you haven't used "${targetPhrases[0]}" yet. Can you include it in your response?`
                ];
                aiResponse = elicitationPrompts[Math.floor(Math.random() * elicitationPrompts.length)];
            }

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            speakText(aiResponse);
        }, 1000);
    };

    const handleSavePhrase = () => {
        if (!newPhraseInput.trim()) return;
        if (onSavePhrase) {
            onSavePhrase(newPhraseInput.trim());
        }
        startSession([newPhraseInput.trim()]);
        setNewPhraseInput("");
    };

    // --- Chat View ---
    if (view === 'chat') {
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm h-full flex flex-col">
                <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl ${isSpeaking ? 'bg-emerald-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Volume2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Live Practice</h3>
                            <p className="text-xs text-emerald-600 font-bold">Target: {targetPhrases.join(', ')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`p-2 rounded-lg ${voiceEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                            title={voiceEnabled ? '음성 끄기' : '음성 켜기'}
                        >
                            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        <button onClick={() => setView('dashboard')} className="text-xs font-bold text-gray-400 hover:text-gray-600">Exit</button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 custom-scrollbar">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.role === 'user'
                                    ? 'bg-emerald-500 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all ${isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
                        }`}
                        title={isListening ? '듣는 중... 클릭하여 중지' : '음성으로 말하기'}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm h-full flex flex-col">
            <header className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">AI English Coach</h3>
                    <p className="text-sm font-medium text-gray-400">Target Expression Training</p>
                </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto">
                {/* Input Target Phrases */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                        <Quote size={18} />
                        <h4 className="font-black text-sm uppercase tracking-wider">Golden Phrases</h4>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">연습하고 싶은 핵심 표현을 입력하세요.</p>

                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newPhraseInput}
                            onChange={(e) => setNewPhraseInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePhrase()}
                            placeholder="e.g., kick off, catch up"
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            onClick={handleSavePhrase}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                        >
                            Start
                        </button>
                    </div>
                </div>

                {/* Saved Phrases */}
                {savedPhrases.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                            <Quote size={16} className="text-emerald-500" />
                            My Saved Phrases
                        </h4>
                        <div className="space-y-2">
                            {savedPhrases.slice(-5).reverse().map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => startSession([item.phrase])}
                                    className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all group"
                                >
                                    <span className="font-bold text-emerald-700">{item.phrase}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-emerald-500">{item.practiceCount || 0}회 연습</span>
                                        <Mic size={16} className="text-emerald-400 group-hover:text-emerald-600" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Suggestions */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-black text-gray-400 uppercase tracking-widest mb-4 px-1">
                        <Zap size={16} className="text-yellow-500" />
                        Today's Suggestions
                    </h4>
                    <div className="space-y-3">
                        {['kick off', 'touch base', 'look into'].map((phrase, idx) => (
                            <button
                                key={idx}
                                onClick={() => startSession([phrase])}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group"
                            >
                                <span className="font-bold text-gray-700 group-hover:text-emerald-600">{phrase}</span>
                                <Mic size={18} className="text-gray-300 group-hover:text-emerald-500" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
