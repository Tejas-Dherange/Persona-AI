import { User, Bot } from 'lucide-react';

export default function ChatBubble({ message, sender, timestamp, isStreaming = false }) {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-200' 
            : 'bg-gradient-to-br from-green-500 to-green-600 ring-2 ring-green-200'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Message Bubble */}
        <div className={`relative group/bubble transition-all duration-300 hover:scale-[1.02] ${
          isUser ? 'animate-in slide-in-from-right-2' : 'animate-in slide-in-from-left-2'
        }`}>
          <div className={`px-5 py-3 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-300/30 rounded-br-md' 
              : 'bg-white/95 text-gray-800 border-gray-200/50 rounded-bl-md hover:shadow-xl'
          }`}>
            {/* Message Text */}
            <div className="relative">
              <p className={`text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                isUser ? 'text-white' : 'text-gray-800'
              }`}>
                {message || (isStreaming && !isUser ? (
                  <span className="flex items-center space-x-2 text-gray-600">
                    <span className="font-medium">Bino is typing</span>
                    <span className="flex space-x-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce delay-150"></span>
                    </span>
                  </span>
                ) : message)}
                {isStreaming && !isUser && message && (
                  <span className="inline-block w-0.5 h-4 bg-green-600 ml-1 animate-pulse rounded-full"></span>
                )}
              </p>
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`mt-2 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <p className={`text-xs transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              isUser ? 'text-blue-600' : 'text-gray-500'
            } font-medium`}>
              {timestamp}
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className={`absolute -z-10 inset-0 rounded-2xl transition-all duration-500 ${
            isUser 
              ? 'bg-gradient-to-br from-blue-400/20 to-blue-600/20 group-hover/bubble:scale-110' 
              : 'bg-gradient-to-br from-green-400/10 to-green-600/10 group-hover/bubble:scale-110'
          } blur-xl`}></div>
        </div>
      </div>
    </div>
  );
}