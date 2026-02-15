import { useMemo, useState } from 'react';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

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

  const send = async () => {
    if (!message.trim() || loading) return;

    const userText = message.trim();
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

      const modelInfo = data.modelVersion ? `, model: ${data.modelVersion}` : '';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer,
          meta: `source: ${data.source}${modelInfo}`
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to process query right now. Please try again.',
          meta: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="card p-5 animate-fadeIn">
      <p className="text-[10px] font-black uppercase tracking-[0.23em] text-emerald-700">Conversational AI</p>
      <h2 className="font-display text-2xl font-bold text-slate-900">AI Chatbot for Farmers</h2>
      <p className="text-sm text-slate-600">Context-aware assistant for crop, disease, fertilizer, and seasonal guidance.</p>

      <div className="mt-4 h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {messages.length === 0 ? <p className="text-sm text-slate-500">Start with a farming question.</p> : null}
        {messages.map((item, idx) => (
          <div
            key={`${item.sender}-${idx}`}
            className={`my-2 max-w-[85%] rounded-2xl px-3 py-2 text-sm ${item.sender === 'user' ? 'ml-auto bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}
          >
            <p className="whitespace-pre-wrap">{item.text}</p>
            {item.meta ? <p className="mt-1 text-[10px] opacity-75">{item.meta}</p> : null}
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <textarea
          className="input min-h-12 resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleEnterSend}
          placeholder="Type your question... (Press Enter to send)"
        />
        <button className="btn-secondary" onClick={startVoiceInput} type="button">Voice</button>
        <button className="btn-primary" onClick={send} type="button" disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
      </div>
    </div>
  );
};

export default ChatbotPage;
