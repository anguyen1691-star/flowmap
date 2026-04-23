import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { sendChatMessage } from '../utils/api';

export default function AIPanel({
  currentDiagram,
  conversationHistory,
  onDiagramUpdate,
  onConversationUpdate,
}) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const { isListening, transcript, startListening, stopListening } =
    useSpeechRecognition({
      // Auto-submit once speech finishes
      onFinalTranscript: (text) => {
        setInput(text);
        handleSendText(text);
      },
    });

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, isLoading]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput('');
      startListening();
    }
  };

  const handleSendText = async (text) => {
    const message = (text || input).trim();
    if (!message || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    try {
      const response = await sendChatMessage(message, currentDiagram, conversationHistory);

      if (response.diagram) {
        onDiagramUpdate(response.diagram);
      }

      onConversationUpdate([
        ...newHistory,
        { role: 'assistant', content: response.reply || response.message || '' },
      ]);
    } catch (err) {
      setError('Could not reach the AI server. Make sure the backend is running on port 3001.');
      onConversationUpdate(newHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const displayMessages = conversationHistory.filter((m) => m.role !== 'system');

  return (
    <div
      className="flex flex-col shrink-0 border-t border-brand-teal"
      style={{ maxHeight: '40vh', background: '#051821' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2 shrink-0 border-b border-brand-teal">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium">Designed by</span>
          <span className="font-bold text-sm tracking-wide text-brand-amber">Anh</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wider bg-brand-teal text-white">
            AI
          </span>
          {isListening && (
            <span className="text-xs font-medium animate-pulse text-brand-orange">● Listening…</span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-400 transition-colors hover:text-brand-teal"
        >
          {isExpanded ? '▼ close' : '▲ open AI assistant'}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Chat history */}
          {displayMessages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 min-h-0">
              {displayMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[75%] px-3 py-2 rounded-xl text-sm leading-snug"
                    style={msg.role === 'user'
                      ? { background: '#F58800', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: '#1A4645', color: '#e2e8f0', border: '1px solid #266867', borderBottomLeftRadius: 4 }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2.5 rounded-xl flex gap-1.5 items-center"
                    style={{ background: '#1A4645', border: '1px solid #266867' }}>
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ background: '#F58800', animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input row */}
          <div className="px-5 py-3 shrink-0 space-y-1.5">
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={isListening ? transcript : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening…' : 'Describe your workflow or ask Claude to modify it…'}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: '#1A4645',
                  border: '1px solid #266867',
                  color: '#e2e8f0',
                }}
                disabled={isLoading || isListening}
              />

              {/* Mic button */}
              <button
                onClick={handleMicClick}
                disabled={isLoading}
                title={isListening ? 'Stop recording' : 'Speak'}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0"
                style={isListening
                  ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.6)', color: '#fca5a5', transform: 'scale(1.05)' }
                  : { background: '#1A4645', border: '1px solid #266867', color: '#9EB3C2' }
                }
              >
                {isListening ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                    <line x1="8" y1="22" x2="16" y2="22"/>
                  </svg>
                )}
              </button>

              {/* Send button */}
              <button
                onClick={() => handleSendText()}
                disabled={isLoading || !input.trim()}
                title="Send (Enter)"
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: '#F58800', color: 'white' }}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
