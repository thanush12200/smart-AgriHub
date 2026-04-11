import { useMemo, useState, Suspense, lazy } from 'react';
import useDocTitle from '../hooks/useDocTitle';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

const ChatBubbleScene = lazy(() => import('../components/3d/ChatBubbleScene'));

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
  useDocTitle('AI Chatbot');
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
      <section
        className="relative overflow-hidden rounded-[32px] mb-5"
        style={{
          background: 'linear-gradient(160deg, #071510 0%, #0a1e14 60%, #0e2818 100%)',
          border: '1px solid rgba(41,160,100,0.2)',
          minHeight: 220,
        }}
      >
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ChatBubbleScene className="w-full h-full" />
          </Suspense>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-end p-6 md:p-8 min-h-[220px]">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 w-fit"
            style={{ background: 'rgba(41,160,100,0.15)', border: '1px solid rgba(41,160,100,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#7ad5a0' }}>
              Farm Assistant
            </span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Ask anything about farming
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Get crop guidance, disease help, fertilizer dosage, and seasonal tips through a production-ready AI assistant tuned to your region and language.
          </p>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="h-[26rem] overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-brand-50 p-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-900">How can I help today?</p>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">Pick a topic below or type your own question to get reliable farm guidance.</p>

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
                className={`rounded-[24px] px-4 py-3 text-sm leading-relaxed shadow-sm ${
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
