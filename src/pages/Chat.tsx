import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Send, Image, Smile, Paperclip, ArrowLeft, FileText } from "lucide-react";
import { generateGamePrompt, generateGameResponse, generatePersonalityResponse } from "@/api/gemini";
import { getFriends, getCurrentUserId } from "@/lib/friends";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  type: 'text' | 'image' | 'emoji';
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const friendId = params.friendId || location.state?.friendId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [friend, setFriend] = useState<any>(null);
  const [isFriendChat, setIsFriendChat] = useState(false);

  const [response, setResponse] = useState('');

  const loadFriendData = async () => {
    if (!friendId) return;

    try {
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        const friendsData = await getFriends(currentUserId);
        const friendData = friendsData.find(f => f.id === friendId);
        if (friendData) {
          setFriend(friendData);
          // Initialize with a welcome message
          setMessages([{
            id: '1',
            text: `Hey! Let's chat!`,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading friend data:', error);
    }
  };

  useEffect(() => {
    if (friendId) {
      setIsFriendChat(true);
      loadFriendData();
    } else {
      setIsFriendChat(false);
      // Game mode initialization
      const getGamePrompt = async () => {
        try {
          const prompt = await generateGamePrompt('hot_takes');

          // Update the first message with the AI prompt
          setMessages([{
            id: '1',
            text: prompt,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          }]);
        } catch (error) {
          console.error('Error generating game prompt:', error);

          // Update with error message
          setMessages([{
            id: '1',
            text: 'Sorry, I had trouble loading the game. Please try again!',
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          }]);
        }
      }
      getGamePrompt();
    }
  }, [friendId]);
  const [newMessage, setNewMessage] = useState('');
  const [sentMessages, setSentMessages] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat logs from localStorage
  const loadChatLogs = () => {
    const logs = localStorage.getItem('hottakes_chat_logs');
    return logs ? JSON.parse(logs) : [];
  };

  // Save chat logs to localStorage
  const saveChatLogs = (logs: any[]) => {
    localStorage.setItem('hottakes_chat_logs', JSON.stringify(logs));
  };

  const getGameResponse = async () => {
    try {
      setResponse(await generateGameResponse(messages[0].text, 'brash and indignant'));
    } catch (error) {
      console.error('Error generating game response:', error);
    }
  }

  // Save current conversation when leaving chat
  const saveCurrentConversation = () => {
    if (messages.length > 1) { // Only save if there are actual messages beyond welcome
      const logs = loadChatLogs();
      const conversation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        messages: messages,
        summary: `Hot Takes session with ${messages.length - 1} messages`
      };

      logs.unshift(conversation); // Add to beginning
      // Keep only last 10 conversations
      if (logs.length > 10) {
        logs.splice(10);
      }
      saveChatLogs(logs);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setIsVisible(true);
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      if (!isFriendChat) {
        // Game mode logic
        setSentMessages(prevMessages => prevMessages + 1);

        // Store the current message text before clearing
        const currentMessageText = newMessage;

        if (sentMessages == 0) {
          const responseMessage: Message = {
            id: Date.now().toString(),
            text: `Alright, the results are in! Here's what you said: "${currentMessageText}"\nJust type /continue and I'll reveal other user's hot take, and discuss!`,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, responseMessage]);
          getGameResponse();
        }
        if (sentMessages == 1) {
          const otherMessage: Message = {
            id: Date.now().toString(),
            text: response,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          };
          setMessages(prev => [...prev, otherMessage]);
        }
        // Simulate response after a delay
        if (sentMessages > 1) {
            setTimeout(() => {
            const responses = [
              "That's a bold take! 🔥",
              "I respectfully disagree 😅",
              "Wait, explain your reasoning!",
              "This is getting heated! 🌶️",
              "New phone, who dis? 📱",
              "That's actually kinda based 💀"
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
      } else {
        // Friend chat mode - use personality-based AI response
        if (friend) {
          // Build conversation history for context
          const conversationHistory = messages.map(msg => ({
            sender: msg.sender,
            text: msg.text
          }));

          generatePersonalityResponse(
            friend.username,
            friend.personality || "friendly and conversational",
            friend.interests || [],
            conversationHistory,
            newMessage
          ).then(response => {
            const responseMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response,
              sender: 'other',
              timestamp: new Date(),
              type: 'text'
            };
            setMessages(prev => [...prev, responseMessage]);
          }).catch(error => {
            console.error('Error generating personality response:', error);
            // Fallback to generic response
            const fallbackResponses = [
              "That sounds awesome! 😊",
              "I totally agree!",
              "Tell me more about that!",
              "That's interesting!",
              "Haha, that's funny!",
              "I feel the same way!"
            ];
            const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            const responseMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: randomResponse,
              sender: 'other',
              timestamp: new Date(),
              type: 'text'
            };
            setMessages(prev => [...prev, responseMessage]);
          });
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleBackToGames = () => {
    if (!isFriendChat) {
      saveCurrentConversation();
      navigate("/games");
    } else {
      navigate("/friends");
    }
  };

  const handleViewLogs = () => {
    setShowLogs(!showLogs);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b from-red-50 to-orange-50 transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      {/* Header */}
      <div className={`text-white p-4 shadow-lg ${isFriendChat ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}>
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
                <span className="text-lg">{isFriendChat ? '👥' : '🔥'}</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">
                  {isFriendChat ? (friend ? `Chat with ${friend.username}` : 'Friend Chat') : 'Hot Takes Debate'}
                </h1>
                <p className="text-sm opacity-90">
                  {isFriendChat ? 'Have a great conversation!' : 'Share your controversial opinions!'}
                </p>
              </div>
            </div>
          </div>

          {!isFriendChat && (
            <button
              onClick={handleViewLogs}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="View Chat Logs"
            >
              <FileText size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages or Logs */}
      {!isFriendChat && showLogs ? (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <button
              onClick={handleViewLogs}
              className="text-red-500 hover:text-red-700 font-medium flex items-center gap-2"
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
                            ? 'bg-red-100 text-red-800'
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
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
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
          {(isFriendChat ? ['😊', '😂', '❤️', '👍', '👋', '🤔', '😢', '🎉', '🙌', '💯'] : ['🔥', '😅', '💀', '🌶️', '📱', '🤔', '😤', '🤡', '👀', '💯']).map((emoji) => (
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
         <input
           type="file"
           accept="*/*"
           onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               // Handle file upload - for now just show filename
               setNewMessage(prev => prev + `[File: ${file.name}]`);
             }
           }}
           className="hidden"
           id="file-input"
         />
         <label htmlFor="file-input" className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
           <Paperclip size={20} />
         </label>

         <input
           type="file"
           accept="image/*"
           onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
               // Handle image upload - for now just show filename
               setNewMessage(prev => prev + `[Image: ${file.name}]`);
             }
           }}
           className="hidden"
           id="image-input"
         />
         <label htmlFor="image-input" className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
           <Image size={20} />
         </label>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isFriendChat ? "Type a message..." : "Share your hot take..."}
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
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
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
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