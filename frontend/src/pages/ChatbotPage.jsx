import { useMemo, useState } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const SUGGESTIONS = [
  { label: '🌾 Best crop for my soil?', text: 'What crop is best for black soil with moderate rainfall?' },
  { label: '🍃 Leaf disease help', text: 'My plant leaves have yellow spots. What should I do?' },
  { label: '💧 Fertilizer dosage', text: 'How much NPK fertilizer should I use for rice per acre?' },
  { label: '🌦️ Season advice', text: 'What should I plant during the kharif season in Karnataka?' },
];

const ChatbotPage = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const context = useMemo(() => messages.slice(-4).map((item) => item.text), [messages]);

  const historyPayload = useMemo(
    () =>
      messages.slice(-14).map((item) => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }]
      })),
    [messages]
  );

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return;

    const userText = text.trim();
    const userMessage = { sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setMessage('');

    try {
      const { data } = await api.post('/chatbot/query', {
        prompt: userText,
        message: userText,
        history: historyPayload,
        context,
        language: user?.language || 'en',
        region: user?.region || 'India'
      });

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.answer }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I couldn\'t process that right now. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendMessage(message);

  const handleEnterSend = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = user?.language === 'hi' ? 'hi-IN' : user?.language === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setMessage(text);
    };
    recognition.start();
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-5">
        <p className="section-label">Farm Assistant</p>
        <h1 className="section-title mt-1">Ask anything about farming</h1>
        <p className="section-subtitle">Get crop guidance, disease help, fertilizer dosage, and seasonal tips.</p>
      </div>

      <div className="card overflow-hidden">
        {/* Messages area */}
        <div className="h-[26rem] overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-brand-50 p-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">How can I help today?</p>
              <p className="mt-1 text-xs text-slate-400">Pick a topic below or type your own question.</p>

              {/* Suggestion chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="rounded-full border border-surface-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 hover:shadow-md hover:-translate-y-px"
                    onClick={() => sendMessage(s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((item, idx) => (
            <div
              key={`${item.sender}-${idx}`}
              className={`my-2.5 max-w-[80%] ${item.sender === 'user' ? 'ml-auto' : ''}`}
            >
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-brand-500 text-white'
                    : 'border border-surface-200 bg-surface-50 text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{item.text}</p>
              </div>
            </div>
          ))}

          {loading ? (
            <div className="my-2.5 max-w-[80%]">
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Input bar */}
        <div className="border-t border-surface-200 bg-surface-50 p-4">
          <div className="flex gap-2">
            <textarea
              className="input min-h-[44px] max-h-28 resize-none flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleEnterSend}
              placeholder="Ask a farming question…"
              rows={1}
            />
            <button className="btn-secondary shrink-0 px-3" onClick={startVoiceInput} type="button" title="Voice input">
              <MicIcon />
            </button>
            <button className="btn-primary shrink-0 px-3" onClick={send} type="button" disabled={loading || !message.trim()} title="Send message">
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
