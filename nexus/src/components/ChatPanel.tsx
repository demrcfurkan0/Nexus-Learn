import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import apiClient from '../services/apiClient';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

export type ChatContext = 
  | { type: 'roadmap', roadmapId: string, nodeId: string }
  | { type: 'challenge', challengeId: string };

interface ChatPanelProps {
  context: ChatContext;
  initialPrompt?: string;
  clearInitialPrompt?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ context, initialPrompt, clearInitialPrompt }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Sadece URL'leri tanımlıyoruz
  const historyUrl = context.type === 'roadmap'
    ? `/api/roadmaps/${context.roadmapId}/nodes/${context.nodeId}/chat`
    : `/api/challenges/${context.challengeId}/chat`;

  const postUrl = context.type === 'roadmap'
    ? `/api/roadmaps/${context.roadmapId}/nodes/${context.nodeId}/chat`
    : `/api/challenges/${context.challengeId}/chat`;

  // --- KESİN ÇÖZÜM: GEÇMİŞİ KOŞULLU OLARAK ÇEKME ---
  useEffect(() => {
    // SADECE context 'roadmap' ise sohbet geçmişini çekmeyi dene.
    // Challenge'ların geçmişi olmadığı için bu adımı atla.
    if (context.type === 'roadmap') {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get<ChatMessage[]>(historyUrl);
          setMessages(response.data);
        } catch (error) {
          console.error('Failed to fetch chat history:', error);
          setMessages([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else {
      // Eğer context 'challenge' ise, mesajları boş başlat.
      setMessages([]);
    }
  }, [context, historyUrl]); // context değiştiğinde bu effect'in yeniden çalışmasını sağla
  // ---------------------------------------------------

  useEffect(() => {
    if (initialPrompt && clearInitialPrompt) {
        setInput(initialPrompt);
        clearInitialPrompt();
    }
  }, [initialPrompt, clearInitialPrompt]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post<ChatMessage>(postUrl, { text: currentInput });
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: 'An error occurred while sending your message.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 my-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && <div className="p-2 bg-nexus-accent/20 rounded-full"><Bot className="w-6 h-6 text-nexus-accent" /></div>}
                    <div className={`max-w-xl p-4 rounded-2xl text-left ${msg.sender === 'user' ? 'bg-nexus-accent text-nexus-dark rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                        <div className="markdown-content">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                    </div>
                    {msg.sender === 'user' && <div className="p-2 bg-gray-600 rounded-full"><User className="w-6 h-6 text-gray-200" /></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3 my-4">
                    <div className="p-2 bg-nexus-accent/20 rounded-full animate-pulse"><Bot className="w-6 h-6 text-nexus-accent" /></div>
                    <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask the AI assistant..."
                className="w-full px-5 py-4 bg-nexus-dark/50 rounded-xl border-2 border-gray-600 focus:border-nexus-accent focus:outline-none text-gray-100 transition-colors"
                disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="p-4 rounded-xl bg-nexus-accent text-nexus-dark disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-nexus-accent/90 transition-all">
                <Send className="w-6 h-6"/>
            </button>
        </form>
    </div>
  );
};

export default ChatPanel;