import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Image, Smile, Paperclip, ArrowLeft, FileText } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  type: 'text' | 'image' | 'emoji';
}

export default function FirstBestForeverChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to First, Best, Forever! Share your eternal gaming memories! 1️⃣⭐♾️',
      sender: 'other',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat logs from localStorage
  const loadChatLogs = () => {
    const logs = localStorage.getItem('firstbestforever_chat_logs');
    return logs ? JSON.parse(logs) : [];
  };

  // Save chat logs to localStorage
  const saveChatLogs = (logs: any[]) => {
    localStorage.setItem('firstbestforever_chat_logs', JSON.stringify(logs));
  };

  // Save current conversation when leaving chat
  const saveCurrentConversation = () => {
    if (messages.length > 1) { // Only save if there are actual messages beyond welcome
      const logs = loadChatLogs();
      const conversation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        messages: messages,
        summary: `First, Best, Forever session with ${messages.length - 1} messages`
      };

      logs.unshift(conversation); // Add to beginning
      // Keep only last 10 conversations
      if (logs.length > 10) {
        logs.splice(10);
      }
      saveChatLogs(logs);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate response after a delay
      setTimeout(() => {
        const responses = [
          "That's such a classic! I remember playing that too! 🎮",
          "Your first game story is amazing! 📖",
          "Best game ever! That one changed gaming for me! ⭐",
          "Forever memories! That game will never be forgotten! ♾️",
          "Such a legendary choice! 👑",
          "I feel that! That game shaped who I am today! 💫"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'other',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text: emoji,
      sender: 'user',
      timestamp: new Date(),
      type: 'emoji'
    };
    setMessages(prev => [...prev, message]);
  };

  const handleBackToGames = () => {
    saveCurrentConversation();
    navigate("/games");
  };

  const handleViewLogs = () => {
    setShowLogs(!showLogs);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-indigo-50 transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToGames}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">1️⃣⭐♾️</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">First, Best, Forever</h1>
                <p className="text-sm opacity-90">Gaming memories!</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleViewLogs}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            title="View Chat Logs"
          >
            <FileText size={20} />
          </button>
        </div>
      </div>

      {/* Messages or Logs */}
      {showLogs ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={handleViewLogs}
              className="text-violet-500 hover:text-violet-700 font-medium flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Chat
            </button>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Chat Logs</h2>

          {loadChatLogs().length === 0 ? (
            <p className="text-gray-500">No chat logs yet. Start a conversation!</p>
          ) : (
            <div className="space-y-4">
              {loadChatLogs().map((log: any) => (
                <div key={log.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{log.summary}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {log.messages.slice(0, 5).map((msg: Message) => (
                      <div key={msg.id} className={`text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-2 py-1 rounded ${
                          msg.sender === 'user'
                            ? 'bg-violet-100 text-violet-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.text.length > 50 ? `${msg.text.substring(0, 50)}...` : msg.text}
                        </span>
                      </div>
                    ))}
                    {log.messages.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        ... and {log.messages.length - 5} more messages
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-gray-900 rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Quick Emojis */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
          {['1️⃣', '⭐', '♾️', '🎮', '🎯', '🏆', '💎', '🌟', '✨', '🎖️', '👑', '💫', '📖', '🎪', '🎨'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="flex-shrink-0 w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-lg">{emoji}</span>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Paperclip size={20} />
          </button>

          <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Image size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your gaming memories..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            <button className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Smile size={18} />
            </button>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-all duration-200 ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}