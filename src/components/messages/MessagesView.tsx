import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Smile, 
  Heart, 
  ChevronLeft, 
  Info, 
  CheckCheck,
  Phone,
  Video,
  SquarePen,
  X,
  UserPlus,
  Radio,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { getSocket } from '../../services/socket';
import { User } from '../../types';

export const MessagesView: React.FC = () => {
  const { 
    conversations, 
    currentUser, 
    sendMessage, 
    initiateCall, 
    onlineUserIds, 
    startConversationWithUser 
  } = useApp();
  
  const [selectedConvId, setSelectedConvId] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return '';
    }
    return conversations[0]?.id || '';
  });
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);

  const typingTimeoutRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  if (!currentUser) return null;

  const activeConv = selectedConvId 
    ? conversations.find(c => c.id === selectedConvId) 
    : (typeof window !== 'undefined' && window.innerWidth >= 768 ? conversations[0] : null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Listen to typing events for current conversation
  useEffect(() => {
    if (!activeConv) return;
    const socket = getSocket();

    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConv.id && data.userId === activeConv.participant.id) {
        setIsPartnerTyping(true);
      }
    };

    const handleUserStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === activeConv.id && data.userId === activeConv.participant.id) {
        setIsPartnerTyping(false);
      }
    };

    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleUserStopTyping);

    return () => {
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleUserStopTyping);
    };
  }, [activeConv?.id, activeConv?.participant.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (activeConv) {
      const socket = getSocket();
      socket.emit('typing', {
        conversationId: activeConv.id,
        senderId: currentUser.id,
        receiverId: activeConv.participant.id
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(() => {
        socket.emit('stop-typing', {
          conversationId: activeConv.id,
          senderId: currentUser.id,
          receiverId: activeConv.participant.id
        });
      }, 1200);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    sendMessage(activeConv.id, inputText.trim());
    setInputText('');

    const socket = getSocket();
    socket.emit('stop-typing', {
      conversationId: activeConv.id,
      senderId: currentUser.id,
      receiverId: activeConv.participant.id
    });
  };

  const handleSendHeart = () => {
    if (!activeConv) return;
    sendMessage(activeConv.id, '❤️');
  };

  // Search users for new chat
  useEffect(() => {
    if (!isNewChatOpen) return;
    if (!userSearchQuery.trim()) {
      api.users.suggested()
        .then(res => setSearchedUsers(res.users))
        .catch(console.error);
    } else {
      api.users.search(userSearchQuery)
        .then(res => setSearchedUsers(res.users))
        .catch(console.error);
    }
  }, [userSearchQuery, isNewChatOpen]);

  const handleStartChatWith = async (user: User) => {
    const convId = await startConversationWithUser(user);
    if (convId) {
      setSelectedConvId(convId);
      setIsNewChatOpen(false);
      setUserSearchQuery('');
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.participant.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.participant.username.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const isParticipantOnline = activeConv && onlineUserIds.includes(activeConv.participant.id);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-50px)] aerogel-card rounded-3xl overflow-hidden shadow-2xl flex my-3 text-white animate-fade-in relative border border-white/10 select-none">
      {/* 1. Conversations List (Left Pane) */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-zinc-950/60 ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {/* User Handle Header with New Chat Button */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="truncate">{currentUser.username}</span>
          </div>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            title="Start new orbit transmission"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* Search inbox */}
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-zinc-900/80 border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* List of threads */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === (selectedConvId || activeConv?.id);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isOnline = onlineUserIds.includes(conv.participant.id);

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.participant.avatar}
                      alt={conv.participant.username}
                      className="w-11 h-11 rounded-full object-cover border border-white/10"
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.9)]"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-white">
                        {conv.participant.username}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {lastMsg?.createdAt || ''}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {lastMsg?.text || 'Started a conversation'}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs space-y-2">
              <p>No active transmissions.</p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="text-pink-400 hover:text-pink-300 font-semibold"
              >
                Start a new chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Chat Pane (Right Pane) */}
      <div className={`flex-1 flex flex-col bg-zinc-950/40 ${!selectedConvId && !activeConv ? 'hidden md:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Chat Header with Audio & Video Call buttons */}
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvId('')}
                  className="md:hidden p-1 text-zinc-400 hover:text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="relative">
                  <img
                    src={activeConv.participant.avatar}
                    alt={activeConv.participant.username}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  {isParticipantOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-black"></div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-white">{activeConv.participant.name}</h3>
                  <p className="text-[10px] text-zinc-400">
                    {isParticipantOnline ? (
                      <span className="text-emerald-400 font-medium">In orbit now</span>
                    ) : (
                      'Away'
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Call, Video Call */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => initiateCall(activeConv.participant, 'audio')}
                  className="p-2 text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors"
                  title="Spatial Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => initiateCall(activeConv.participant, 'video')}
                  className="p-2 text-zinc-300 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-full transition-colors"
                  title="Spatial Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Scroll Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {/* Profile Intro */}
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gradient-cosmic p-[1.5px] shadow-lg shadow-pink-500/20">
                  <img
                    src={activeConv.participant.avatar}
                    alt={activeConv.participant.username}
                    className="w-full h-full rounded-full object-cover border border-black"
                  />
                </div>
                <h4 className="font-bold text-xs text-white">{activeConv.participant.name}</h4>
                <p className="text-[11px] text-zinc-400 max-w-xs">{activeConv.participant.bio || `@${activeConv.participant.username}`}</p>
              </div>

              {/* Messages list */}
              {activeConv.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-cosmic text-white shadow-md shadow-pink-500/20 rounded-tr-sm'
                          : 'bg-white/10 text-zinc-100 border border-white/5 rounded-tl-sm backdrop-blur-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-500 px-1">
                      <span>{msg.createdAt}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                    </div>
                  </div>
                );
              })}

              {/* Real-time Typing Indicator */}
              {isPartnerTyping && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs px-2 py-1 italic animate-fade-in">
                  <span>{activeConv.participant.username} is transmitting</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce delay-150"></span>
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-zinc-950/80 flex items-center gap-2.5">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Message ${activeConv.participant.username}...`}
                className="flex-1 bg-zinc-900/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2.5 bg-gradient-cosmic rounded-2xl text-white hover:opacity-95 shadow-md shadow-pink-500/20 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSendHeart}
                  className="p-2.5 text-rose-500 hover:scale-110 active:scale-90 transition-transform"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shadow-xl shadow-pink-500/10">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">Your Transmissions</h3>
            <p className="text-xs text-zinc-400 max-w-sm">
              Send direct messages or start audio/video calls with creators anywhere in the world.
            </p>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="px-5 py-2.5 bg-gradient-cosmic text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/25 hover:opacity-95"
            >
              Start New Message
            </button>
          </div>
        )}
      </div>

      {/* New Message User Search Modal */}
      {isNewChatOpen && (
        <div 
          onClick={() => setIsNewChatOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="text-xs font-bold text-white">New Transmission</h3>
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user..."
                  autoFocus
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {searchedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChatWith(user)}
                  className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{user.username}</p>
                      <p className="text-[11px] text-zinc-400">{user.name}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-pink-400">Chat</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};