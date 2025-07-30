'use client';

import { useState, useRef, useEffect } from 'react';
import ChatBubble from '@/components/ChatBubble';
import { Send, Bot } from 'lucide-react';
import { useAutoFocus, useMessageSound } from '@/hooks/useChatEffects';

export default function Home() {
  // Configuration for typing speed (milliseconds between characters)
  const TYPING_DELAY = 30; // Adjust this value: lower = faster, higher = slower
  
  const [messages, setMessages] = useState([
    {
      id: 1,
     text: "Hey there! I'm CareerGURU, your friendly guide to all things career and engineering! 🎓💡\n\nNot sure which branch to choose? Curious about job roles, colleges, or what to do after 12th? I’ve got you covered! 🚀\n\nJust tell me what you're exploring – and I’ll help you figure it out, step by step. What would you like to know today? 😊",
     sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Custom hooks for enhanced UX
  const { playSound } = useMessageSound();
  useAutoFocus(inputRef, [isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    
    // Play send sound
    try {
      playSound('send');
    } catch (e) {
      // Audio might not be supported, ignore
    }

    // Create a bot message with empty text that will be updated with streaming content
    const botMessageId = Date.now() + 1;
    setStreamingMessageId(botMessageId);
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMessage]);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsLoading(false);
              setStreamingMessageId(null);
              // Play receive sound when message is complete
              try {
                playSound('receive');
              } catch (e) {
                // Audio might not be supported, ignore
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                // Split content into characters for slower streaming effect
                const contentChars = parsed.content.split('');
                
                for (let i = 0; i < contentChars.length; i++) {
                  accumulatedText += contentChars[i];
                  
                  // Update the bot message with accumulated text
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMessageId 
                      ? { ...msg, text: accumulatedText }
                      : msg
                  ));
                  
                  // Add delay between characters (adjust TYPING_DELAY to control speed)
                  if (i < contentChars.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, TYPING_DELAY));
                  }
                }
              } else if (parsed.error) {
                // Handle error in stream
                setMessages(prev => prev.map(msg => 
                  msg.id === botMessageId 
                    ? { ...msg, text: parsed.content || "Sorry, I'm having trouble right now. Please try again! �" }
                    : msg
                ));
                setIsLoading(false);
                setStreamingMessageId(null);
                return;
              }
            } catch (e) {
              // Skip invalid JSON
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "Oops! Something went wrong. Let me try again! 🔄" }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-xl border-b border-green-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">CareerGURU</h1>
              <p className="text-sm text-green-100 font-medium">Your personal Career Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-200 font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-transparent">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`transform transition-all duration-500 ${
              index === messages.length - 1 ? 'animate-in slide-in-from-bottom-4' : ''
            }`}
          >
            <ChatBubble
              message={message.text}
              sender={message.sender}
              timestamp={message.timestamp}
              isStreaming={isLoading && message.sender === 'bot' && message.id === streamingMessageId}
            />
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white/80 backdrop-blur-sm p-6 border-t border-gray-200/50 shadow-2xl">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here... 💬"
                className="w-full pl-6 pr-16 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 text-gray-800 placeholder-gray-500 shadow-inner"
                disabled={isLoading}
              />
              {inputMessage.trim() && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="absolute -top-12 left-0 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="font-medium">Bino is thinking...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}