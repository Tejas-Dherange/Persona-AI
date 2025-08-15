import { User, Bot } from 'lucide-react';
import Image from 'next/image';
import MessageFormatter from './MessageFormatter';

export default function ChatBubble({ message, mentor, sender, timestamp, isStreaming = false, isSearching = false }) {
  const isUser = sender === 'user';
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
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md xl:max-w-screen-xl ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
          isUser 
            ? `bg-gradient-to-br from-${mentorConfig[mentor]?.accentColor}-500 to-${mentorConfig[mentor]?.accentColor}-600 ring-2 ring-${mentorConfig[mentor]?.accentColor}-200` 
            : 'bg-gradient-to-br from-gray-700 to-gray-800 ring-2 ring-gray-600'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Image
              src={mentorConfig[mentor]?.avatar}
              width={40}
              height={40}
              alt="Bot Avatar"
              className="rounded-full object-cover"
            />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative  group/bubble transition-all duration-300 hover:scale-[1.02] ${
          isUser ? 'animate-in slide-in-from-right-2' : 'animate-in slide-in-from-left-2'
        }`}>
          <div className={`px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
            isUser 
              ? `bg-gradient-to-br from-${mentorConfig[mentor]?.accentColor}-500 to-${mentorConfig[mentor]?.accentColor}-600 text-white border-${mentorConfig[mentor]?.accentColor}-300/30 rounded-br-md` 
              : `bg-gray-800/95 text-white border-gray-700/50 rounded-bl-md hover:shadow-xl`
          }`}>
            {/* Message Text */}
            <div className="relative ">
              {message || (isStreaming && !isUser) ? (
                message ? (
                  <div className={`text-md leading-relaxed font-medium ${
                    isUser ? 'text-white' : 'text-white'
                  }`}>
                    <MessageFormatter message={message} isUser={isUser} />
                  </div>
                ) : (
                  <span className="flex items-center space-x-2 text-gray-400">
                    <span className="font-medium">
                      {isSearching ? "Searching the web..." : "Sir is typing"}
                    </span>
                    <span className="flex space-x-1">
                      {isSearching ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping delay-100"></span>
                          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping delay-200"></span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-150"></span>
                        </>
                      )}
                    </span>
                  </span>
                )
              ) : null}
              {isStreaming && !isUser && message && (
                <span className="inline-block w-0.5 h-4 bg-orange-600 ml-1 animate-pulse rounded-full"></span>
              )}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`mt-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <p className={`text-xs transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              isUser ? 'text-orange-300' : 'text-gray-400'
            } font-medium`}>
              {timestamp}
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className={`absolute -z-10 inset-0 rounded-2xl transition-all duration-500 ${
            isUser 
              ? 'bg-gradient-to-br from-orange-400/20 to-orange-600/20 group-hover/bubble:scale-110' 
              : 'bg-gradient-to-br from-gray-600/10 to-gray-800/10 group-hover/bubble:scale-110'
          } blur-xl`}></div>
        </div>
      </div>
    </div>
  );
}