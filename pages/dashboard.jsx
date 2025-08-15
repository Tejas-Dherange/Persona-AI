// Client-only dashboard page to avoid hydration mismatches from dynamic data (timestamps, streaming)
'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ChatBubble from '@/components/ChatBubble';
import { Send, Bot, ArrowLeft, User, Loader2 } from 'lucide-react';
import { useAutoFocus, useMessageSound } from '@/hooks/useChatEffects';

function Dashboard() {
  // Configuration for typing speed (milliseconds between characters)
  const TYPING_DELAY = 18; // Adjust this value: lower = faster, higher = slower
  
  const router = useRouter();
  const { mentor } = router.query;
  
  const [currentMentor, setCurrentMentor] = useState(mentor || 'hitesh');
  const [messages, setMessages] = useState([
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Custom hooks for enhanced UX
  const { playSound } = useMessageSound();
  useAutoFocus(inputRef, [isLoading]);

  // Mentor configurations
  const mentorConfig = {
    hitesh: {
      name: 'Hitesh Choudhary',
      title: 'Chai aur Code Creator',
      avatar: '/hitesh.png',
      bgGradient: 'from-orange-500 to-red-600',
      accentColor: 'orange'
    },
    piyush: {
      name: 'Piyush Garg',
      title: 'Tech Educator',
      avatar: '/piyush.png', 
      bgGradient: 'from-blue-500 to-purple-600',
      accentColor: 'blue'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update current mentor when route changes
    if (mentor && mentor !== currentMentor) {
      setCurrentMentor(mentor);
      // Clear messages when switching mentors and add welcome message
      const welcomeMessages = {
        hitesh: {
          id: Date.now(),
          text: `Haanji! Welcome to Chai aur Code! 🫖\n\nMain Hitesh Choudhary hun, aur main yahan hun tumhari JavaScript, React, Backend development, aur full-stack projects mein help karne ke liye.\n\nTum mujhse kuch bhi puch sakte ho - GitHub repos, YouTube series, coding doubts, career guidance, ya koi bhi tech-related query!\n\nBolo, kya seekhna hai aaj? 🚀`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        piyush: {
          id: Date.now(),
          text: `Hey there! Welcome! 👋\n\nI'm Piyush Garg, and I'm here to help you with system design, full-stack development, and practical programming solutions.\n\nI focus on real-world implementations, scalable architectures, and clean code practices. Whether you need help with Node.js, React, system design, or building production-ready applications - I'm here to guide you!\n\nWhat would you like to learn or build today? 🚀`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      
      setMessages([welcomeMessages[mentor] || welcomeMessages.hitesh]);
    }
  }, [mentor, currentMentor]);

  const switchMentor = (newMentor) => {
    if (newMentor !== currentMentor) {
      setCurrentMentor(newMentor);
      
      const welcomeMessages = {
        hitesh: {
          id: Date.now(),
          text: `Haanji! Main Hitesh Choudhary hun! 🫖\n\nChai aur Code ke saath tumhari JavaScript, React, Backend, aur full-stack journey mein help karunga.\n\nKoi bhi doubt, GitHub repos, YouTube series, ya career guidance chahiye - bas pucho!\n\nKya seekhna hai aaj? 🚀`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        piyush: {
          id: Date.now(),
          text: `Hey! I'm Piyush Garg! 👋\n\nI'll help you with system design, full-stack development, and building scalable applications.\n\nFocusing on practical implementations and real-world solutions. Ready to dive into some serious coding?\n\nWhat's your next project or learning goal? 💻`,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      };
      
      setMessages([welcomeMessages[newMentor] || welcomeMessages.hitesh]);
      router.push(`/dashboard?mentor=${newMentor}`, undefined, { shallow: true });
    }
  };

  const goBack = () => {
    router.push('/');
  };

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
    
    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    // Play send sound
    try {
      playSound('send');
    } catch (e) {
      // Audio might not be supported, ignore
    }

    // Create a bot message with empty text that will be updated with streaming content
    const botMessageId = Date.now() + 1;
    setStreamingMessageId(botMessageId);
    
    // Detect if web search might be needed
    const searchTriggers = [
      'latest', 'recent', 'current', 'news', 'today', 'this year', '2024', '2025',
      'what happened', 'recent updates', 'latest version', 'current price',
      'breaking news', 'recent developments', 'market trends', 'stock price',
      'weather', 'current events', 'recent changes', 'latest release'
    ];
    
    const needsWebSearch = searchTriggers.some(trigger => 
      currentMessage.toLowerCase().includes(trigger.toLowerCase())
    );
    
    if (needsWebSearch) {
      setIsSearching(true);
    }
    
    const botMessage = {
      id: botMessageId,
      text: '',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSearching: needsWebSearch
    };

    setMessages(prev => [...prev, botMessage]);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationHistory: messages, // Send all previous messages for context
          mentor: currentMentor // Send current mentor info
        }),
        signal: controller.signal
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
              setIsSearching(false);
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
      setIsSearching(false);
      setStreamingMessageId(null);
      setAbortController(null);
    }
  };

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setIsSearching(false);
      setStreamingMessageId(null);
      setAbortController(null);
    }
  };

  return (
    <div className="flex flex-col mx-auto h-screen p-4 bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <div className={`bg-gradient-to-r rounded-lg  ${mentorConfig[currentMentor]?.bgGradient || 'from-orange-600 to-orange-700'} text-white p-2 shadow-xl border-b border-orange-800/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={goBack}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                {mentorConfig[currentMentor]?.avatar ? (
                  <img 
                    src={mentorConfig[currentMentor].avatar} 
                    alt={mentorConfig[currentMentor].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Bot className="w-7 h-7 text-white" />
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-${mentorConfig[currentMentor]?.accentColor || 'orange'}-400 rounded-full border-2 border-white animate-pulse`}></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">{mentorConfig[currentMentor]?.name || 'Tech Guru'}</h1>
              <p className="text-sm text-white/80 font-medium">{mentorConfig[currentMentor]?.title || 'AI Assistant'}</p>
            </div>
          </div>
          
          {/* Mentor Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-black/20 rounded-lg p-1 border border-white/20">
              {Object.entries(mentorConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => switchMentor(key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    currentMentor === key 
                      ? 'bg-white text-gray-900' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {config.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-transparent">
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
              mentor={currentMentor}
              isStreaming={isLoading && message.sender === 'bot' && message.id === streamingMessageId}
              isSearching={isSearching && message.sender === 'bot' && message.id === streamingMessageId}
            />
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className={`bg-gray-800/90 m-2 rounded-lg backdrop-blur-sm p-2 border-t border-${mentorConfig[currentMentor]?.accentColor}-600/50 shadow-2xl`}>
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here... 💬"
                className={`w-full pl-6 pr-16 py-2 bg-gray-700 border-2 border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-${mentorConfig[currentMentor]?.accentColor}-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 shadow-inner`}
                disabled={isLoading}
              />
              {inputMessage.trim() && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  {/* Web search detection indicator */}
                  {(['latest', 'recent', 'current', 'news', 'today', '2024', '2025'].some(trigger => 
                    inputMessage.toLowerCase().includes(trigger.toLowerCase())
                  )) ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-400 font-medium">🌐</span>
                    </div>
                  ) : (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
                !inputMessage.trim() || isLoading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Feature indicators */}
         
          
          {/* Typing indicator */}
          {isLoading && (
            <div className="absolute -top-12 left-0 bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-orange-600/50">
              <div className="flex items-center space-x-2 text-sm text-orange-300">
                <div className="flex space-x-1">
                  <div className={`w-2 h-2 bg-${mentorConfig[mentor]?.accentColor}-500 rounded-full animate-bounce` }></div>
                  <div className={`w-2 h-2 bg-${mentorConfig[mentor]?.accentColor}-500 rounded-full animate-bounce delay-100`}></div>
                  <div className={`w-2 h-2 bg-${mentorConfig[mentor]?.accentColor}-500 rounded-full animate-bounce delay-200`}></div>
                </div>
                <span className="font-medium">Sir is typing...</span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Disable SSR to prevent hydration errors caused by time-based / client-only APIs
export default dynamic(() => Promise.resolve(Dashboard), { ssr: false });