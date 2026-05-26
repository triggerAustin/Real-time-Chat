import { useEffect, useRef, useState, FormEvent } from 'react';
import { Message } from '../hooks/useSupabaseChat'; 

interface MessagePaneProps {
  activeRoom: string;
  messages: Message[];
  username: string;
  typingStatus: string;
  isConnected: boolean;
  isLoadingHistory: boolean;
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessagePane({ activeRoom, messages, username, typingStatus, isConnected, isLoadingHistory, onSendMessage, onTyping }: MessagePaneProps) {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (force = false) => {
    const container = chatContainerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 200;
    if (force || isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: force ? 'auto' : 'smooth' });
  };

  useEffect(() => { scrollToBottom(true); }, [messages, isLoadingHistory]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const formatMessageTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLocalDateString = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900/40 relative">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm z-10">
        <div>
          <h2 className="font-extrabold text-base text-slate-100 flex items-center gap-1.5">
            <span className="text-slate-500">#</span> {activeRoom}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-1.5 rounded-full border border-slate-800/80">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-rose-500 animate-pulse'}`} />
          <span className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">{isConnected ? 'Online' : 'Connecting...'}</span>
        </div>
      </header>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {isLoadingHistory ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`flex gap-3 ${n % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-slate-800" />
                <div className="space-y-2 max-w-sm w-full">
                  <div className="h-3 bg-slate-800 rounded w-1/4" />
                  <div className="h-10 bg-slate-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-xl text-slate-400">👋</div>
            <p className="text-sm font-semibold text-slate-400">Welcome to #{activeRoom}!</p>
            <p className="text-xs text-slate-600">This is the absolute beginning of your message thread index.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSelf = msg.user === username;
            const prevMsg = messages[idx - 1];
            const isConsecutive = prevMsg && prevMsg.user === msg.user && 
              (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 120000);
            
            const isNewDay = !prevMsg || getLocalDateString(prevMsg.timestamp) !== getLocalDateString(msg.timestamp);

            return (
              <div key={idx} className="space-y-2">
                {isNewDay && (
                  <div className="flex items-center justify-center my-6">
                    <div className="h-[1px] bg-slate-800 flex-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 bg-transparent">
                      {getLocalDateString(msg.timestamp)}
                    </span>
                    <div className="h-[1px] bg-slate-800 flex-1" />
                  </div>
                )}

                <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} ${isConsecutive ? '-mt-2' : 'mt-2'}`}>
                  {!isConsecutive && (
                    <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-400">{isSelf ? 'You' : msg.user}</span>
                      <span className="text-[9px] text-slate-600 font-medium">{formatMessageTimestamp(msg.timestamp)}</span>
                    </div>
                  )}
                  
                  <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm break-words transition-all duration-200 animate-fade-in-up ${
                    isSelf 
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-slate-100 rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/40'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 h-6 flex items-center gap-2 text-xs text-cyan-400/90 font-medium select-none">
        {typingStatus && (
          <>
            <span>{typingStatus}</span>
            <div className="flex items-center gap-1 h-full pt-1.5">
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s]" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
            </div>
          </>
        )}
      </div>

      <footer className="p-4 bg-slate-900/60 border-t border-slate-800 backdrop-blur-sm">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => { 
              const value = e.target.value;
              setInput(value); 
              onTyping(value.trim().length > 0); 
            }} 
            placeholder={`Message #${activeRoom}`} 
            className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/80 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500/10 transition-all" 
          />
          <button type="submit" disabled={!input.trim()} className="bg-cyan-500 text-slate-950 px-5 py-3 rounded-xl font-bold disabled:opacity-30 hover:bg-cyan-400 active:scale-95 transition-all shadow-md shadow-cyan-500/10 shrink-0">
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}