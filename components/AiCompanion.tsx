
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Book, ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { SendIcon, SpeakerIcon, StopIcon, LoaderIcon } from './Icons';

interface AiCompanionProps {
  book: Book;
}

const AiCompanion: React.FC<AiCompanionProps> = ({ book }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isSpeaking, speak, cancel } = useTextToSpeech();
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Reset chat when book changes
  useEffect(() => {
    setMessages([]);
    cancel();
    setSpeakingMessageId(null);
  }, [book, cancel]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    cancel(); // Stop any current speech

    try {
      const aiResponseText = await generateChatResponse(book, userMessage.text);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
        const errorMessage: ChatMessage = {
            id: `err-${Date.now()}`,
            sender: 'ai',
            text: "Sorry, I couldn't connect to my knowledge base. Please check your connection or API key and try again."
        }
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  }, [userInput, isLoading, book, cancel]);
  
  const handleToggleSpeech = (message: ChatMessage) => {
    if (isSpeaking && speakingMessageId === message.id) {
        cancel();
        setSpeakingMessageId(null);
    } else {
        speak(message.text);
        setSpeakingMessageId(message.id);
    }
  }

  return (
    <div className="bg-primary flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
        <div className="text-center text-text-secondary text-sm">
          <p>You are chatting with BookWyrm AI about</p>
          <p className="font-bold text-text-primary">{book.title}</p>
          <p>All responses are based on your progress up to page {book.currentPage}.</p>
        </div>
        {messages.map(message => (
          <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg lg:max-w-xl p-3 rounded-lg ${message.sender === 'user' ? 'bg-accent text-white rounded-br-none' : 'bg-secondary text-text-primary rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
            {message.sender === 'ai' && (
                <button 
                    onClick={() => handleToggleSpeech(message)} 
                    className="p-2 rounded-full bg-secondary hover:bg-border-color transition-colors"
                    aria-label={isSpeaking && speakingMessageId === message.id ? 'Stop speaking' : 'Speak message'}
                >
                    {isSpeaking && speakingMessageId === message.id ? <StopIcon className="w-5 h-5 text-accent"/> : <SpeakerIcon className="w-5 h-5 text-text-secondary"/>}
                </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex items-center space-x-2 bg-secondary p-3 rounded-lg rounded-bl-none">
                <LoaderIcon className="w-5 h-5 text-accent" />
                <span className="text-text-secondary italic">BookWyrm is thinking...</span>
             </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-secondary border-t border-border-color">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Ask about characters, plot, themes..."
            className="flex-1 bg-primary border border-border-color rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="bg-accent text-white rounded-full p-2.5 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiCompanion;
