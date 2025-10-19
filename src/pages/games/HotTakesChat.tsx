import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowLeft, FileText, UserPlus, X } from "lucide-react";
import { generateGamePrompt, generatePersonalityHotTake, generatePersonalityResponse } from "@/api/gemini";
import { User, getLocalStorageUsers } from "@/lib/supabase";
import { getCurrentUserId, addFriend, areFriends } from "@/lib/friends";
import { completeHotTakesGame } from "@/lib/leaderboard";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other' | 'system';
  timestamp: Date;
  type: 'text' | 'emoji';
}

export default function HotTakesChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Finding you a match...',
      sender: 'system',
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [gamePhase, setGamePhase] = useState<'loading' | 'user-response' | 'revealing' | 'conversation'>('loading');
  const [partnerHotTake, setPartnerHotTake] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{ sender: string; text: string }>>([]);
  const [isFriend, setIsFriend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPartnerReady, setIsPartnerReady] = useState(false);

  // Randomly select a user on mount
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Get all users and pick a random one
        const allUsers = getLocalStorageUsers();
        const currentUserId = getCurrentUserId();
        const availableUsers = allUsers.filter(u => u.id !== currentUserId);

        if (availableUsers.length === 0) {
          setMessages([{
            id: '1',
            text: 'No users available to match with. Please try again later!',
            sender: 'system',
            timestamp: new Date(),
            type: 'text'
          }]);
          return;
        }

        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        setMatchedUser(randomUser);

        // Check if already friends
        if (currentUserId) {
          const friendStatus = await areFriends(currentUserId, randomUser.id);
          setIsFriend(friendStatus);
        }

        // Generate game prompt
        const prompt = await generateGamePrompt('hot_takes');

        // Generate partner's hot take in the background
        if (randomUser.personality) {
          try {
            const hotTake = await generatePersonalityHotTake(
              prompt,
              randomUser.personality,
              randomUser.username,
              randomUser.interests
            );
            console.log('Generated partner hot take:', hotTake);
            setPartnerHotTake(hotTake);
            setIsPartnerReady(true);
          } catch (error) {
            console.error('Error generating partner hot take:', error);
            setPartnerHotTake("I'm honestly not sure what to think about that!");
            setIsPartnerReady(true);
          }
        } else {
          setPartnerHotTake("I'm honestly not sure what to think about that!");
          setIsPartnerReady(true);
        }

        // Update messages with the game prompt
        setMessages([
          {
            id: '1',
            text: `You've been matched with ${randomUser.username}!`,
            sender: 'system',
            timestamp: new Date(),
            type: 'text'
          },
          {
            id: '2',
            text: prompt,
            sender: 'system',
            timestamp: new Date(),
            type: 'text'
          }
        ]);

        setGamePhase('user-response');
      } catch (error) {
        console.error('Error initializing game:', error);
        setMessages([{
          id: '1',
          text: 'Sorry, I had trouble loading the game. Please try again!',
          sender: 'system',
          timestamp: new Date(),
          type: 'text'
        }]);
      }
    };

    initializeGame();
  }, []);

  // Load chat logs from localStorage
  const loadChatLogs = () => {
    const logs = localStorage.getItem('hottakes_chat_logs');
    return logs ? JSON.parse(logs) : [];
  };

  // Save chat logs to localStorage
  const saveChatLogs = (logs: any[]) => {
    localStorage.setItem('hottakes_chat_logs', JSON.stringify(logs));
  };

  // Save current conversation when leaving chat
  const saveCurrentConversation = () => {
    if (messages.length > 2 && matchedUser) {
      const logs = loadChatLogs();
      const conversation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        messages: messages,
        partner: matchedUser.username,
        summary: `Hot Takes with ${matchedUser.username} - ${messages.length - 2} messages`
      };

      logs.unshift(conversation);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchedUser) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = newMessage;
    setNewMessage('');

    if (gamePhase === 'user-response') {
      // User submitted their hot take

      // Show "revealing" phase
      setGamePhase('revealing');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Great! Here's what ${matchedUser.username} said about this:`,
          sender: 'system',
          timestamp: new Date(),
          type: 'text'
        }]);

        setTimeout(() => {
          // Make sure we have the partner's hot take - use stored value
          const hotTakeToShow = partnerHotTake || "I have some thoughts on this too!";
          console.log('Displaying partner hot take:', hotTakeToShow);
          console.log('Partner hot take state value:', partnerHotTake);

          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: hotTakeToShow,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          }]);

          // Start conversation mode
          setGamePhase('conversation');
          setConversationHistory([
            { sender: 'user', text: messageText },
            { sender: 'other', text: hotTakeToShow }
          ]);

          // Generate initial conversation starter from the matched user
          setTimeout(async () => {
            try {
              const response = await generatePersonalityResponse(
                matchedUser.username,
                matchedUser.personality || '',
                matchedUser.interests,
                [
                  { sender: 'user', text: messageText },
                  { sender: 'other', text: hotTakeToShow }
                ],
                messageText
              );

              const aiMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: response,
                sender: 'other',
                timestamp: new Date(),
                type: 'text'
              };

              setMessages(prev => [...prev, aiMessage]);
              setConversationHistory(prev => [...prev, { sender: 'other', text: response }]);
            } catch (error) {
              console.error('Error generating conversation starter:', error);
            }
          }, 1500);
        }, 1000);
      }, 500);

    } else if (gamePhase === 'conversation') {
      // Conversation mode - generate AI response
      const updatedHistory = [...conversationHistory, { sender: 'user', text: messageText }];
      setConversationHistory(updatedHistory);

      try {
        const response = await generatePersonalityResponse(
          matchedUser.username,
          matchedUser.personality || '',
          matchedUser.interests,
          updatedHistory,
          messageText
        );

        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: response,
            sender: 'other',
            timestamp: new Date(),
            type: 'text'
          };

          setMessages(prev => [...prev, aiMessage]);
          setConversationHistory(prev => [...prev, { sender: 'other', text: response }]);
        }, 800 + Math.random() * 1200);
      } catch (error) {
        console.error('Error generating AI response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Hmm, I'm having trouble responding right now. Can you say that again?",
          sender: 'other',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

    if (gamePhase === 'conversation' && matchedUser) {
      // Generate response to emoji
      const emojiResponses = [
        "Haha, I'll take that as agreement! 😄",
        "Interesting reaction! Tell me more about what you think.",
        "I see what you mean! 👀",
        "That's one way to respond! 😅"
      ];

      setTimeout(() => {
        const response = emojiResponses[Math.floor(Math.random() * emojiResponses.length)];
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'other',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const handleBackToGames = () => {
    saveCurrentConversation();

    // Award points for completing the game (only if conversation started)
    if (gamePhase === 'conversation' && messages.length > 4) {
      // Base score of 100 points, plus 10 points per message exchanged
      const messageBonus = Math.max(0, messages.length - 4) * 10;
      const totalScore = 100 + messageBonus;
      completeHotTakesGame(true, totalScore);
    }

    navigate("/games");
  };

  const handleViewLogs = () => {
    setShowLogs(!showLogs);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleAddFriend = async () => {
    if (!matchedUser) return;

    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    const success = await addFriend(currentUserId, matchedUser.id);
    if (success) {
      setIsFriend(true);
      alert(`You're now friends with ${matchedUser.username}!`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatar = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-b from-red-50 to-orange-50 transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToGames}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              {matchedUser ? (
                <button
                  onClick={handleProfileClick}
                  className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold hover:scale-105 transition-transform cursor-pointer"
                >
                  {getAvatar(matchedUser.username)}
                </button>
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🔥</span>
                </div>
              )}
              <div>
                <h1 className="font-bold text-lg">
                  {matchedUser ? `Chat with ${matchedUser.username}` : 'Hot Takes Debate'}
                </h1>
                <p className="text-sm opacity-90">Share your controversial opinions!</p>
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

      {/* Profile Modal */}
      {showProfileModal && matchedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{matchedUser.username}</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                {getAvatar(matchedUser.username)}
              </div>
            </div>

            {matchedUser.personality && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Personality</h3>
                <p className="text-gray-600 text-sm">{matchedUser.personality}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {matchedUser.interests.map((interest, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddFriend}
              disabled={isFriend}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isFriend
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg'
              }`}
            >
              <UserPlus size={18} />
              {isFriend ? 'Already Friends' : 'Add Friend'}
            </button>
          </div>
        </div>
      )}

      {/* Messages or Logs */}
      {showLogs ? (
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
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {/* Show avatar for 'other' messages */}
              {message.sender === 'other' && matchedUser && (
                <button
                  onClick={handleProfileClick}
                  className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
                >
                  {getAvatar(matchedUser.username)}
                </button>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-sm'
                    : message.sender === 'system'
                    ? 'bg-gray-100 text-gray-700 rounded-lg border border-gray-200'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
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
      {!showLogs && (
        <div className="bg-white border-t border-gray-200 p-4">
          {/* Quick Emojis */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {['🔥', '😅', '💀', '🌶️', '📱', '🤔', '😤', '🤡', '👀', '💯'].map((emoji) => (
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
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  gamePhase === 'user-response'
                    ? "Share your hot take..."
                    : gamePhase === 'conversation'
                    ? "Reply to the conversation..."
                    : "Loading..."
                }
                disabled={gamePhase === 'loading' || gamePhase === 'revealing' || (gamePhase === 'user-response' && !isPartnerReady)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || gamePhase === 'loading' || gamePhase === 'revealing'}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim() && gamePhase !== 'loading' && gamePhase !== 'revealing'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
