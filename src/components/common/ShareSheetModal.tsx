import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Check, 
  Copy, 
  Share2, 
  Search, 
  PlusCircle, 
  MessageCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ShareSheetModal: React.FC = () => {
  const { 
    shareItem, 
    closeShareModal, 
    conversations, 
    sendMessage, 
    addNewStory, 
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});
  const [storyAdded, setStoryAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!shareItem) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this ${shareItem.type === 'reel' ? 'Reel' : 'post'} by @${shareItem.author.username} on Social Sphere!`;

  const handleSendToChat = async (convId: string, participantName: string) => {
    try {
      const messageText = `Shared a ${shareItem.type}: "${shareItem.caption || shareItem.title || ''}"`;
      await sendMessage(convId, messageText, shareItem.mediaUrl);
      setSentMap(prev => ({ ...prev, [convId]: true }));
      showToast(`Sent to ${participantName} 🚀`);
    } catch (e) {
      console.error(e);
      showToast('Failed to send message');
    }
  };

  const handleAddToStory = async () => {
    if (storyAdded) return;
    try {
      await addNewStory(
        shareItem.mediaUrl,
        shareItem.caption || `Shared @${shareItem.author.username}'s ${shareItem.type}`
      );
      setStoryAdded(true);
      showToast('Added to your story! ✨');
      setTimeout(() => {
        closeShareModal();
      }, 1000);
    } catch (e) {
      console.error(e);
      showToast('Failed to add to story');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied to clipboard! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareItem.title || 'Social Sphere',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleInstagram = () => {
    handleCopyLink();
    showToast('Link copied! Open Instagram to share in DM or Story 📸');
    setTimeout(() => {
      window.open('https://www.instagram.com', '_blank');
    }, 800);
  };

  // Filter conversations by search
  const filteredConvs = conversations.filter(c => 
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-all duration-200 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={closeShareModal} />

      {/* Modal / Sheet Content */}
      <div 
        className="relative z-10 w-full sm:max-w-md max-h-[88vh] flex flex-col bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl shadow-2xl text-white overflow-hidden animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Handle on Mobile */}
        <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-base tracking-wide">Share</h3>
          </div>
          <button 
            onClick={closeShareModal}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shared Item Preview Pill */}
        <div className="p-4 mx-4 my-2 bg-zinc-800/50 border border-zinc-700/40 rounded-2xl flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-700/50">
            {shareItem.type === 'reel' ? (
              <video 
                src={shareItem.mediaUrl} 
                className="w-full h-full object-cover" 
                muted 
                playsInline
              />
            ) : (
              <img 
                src={shareItem.mediaUrl} 
                alt="Share preview" 
                className="w-full h-full object-cover"
              />
            )}
            <span className="absolute bottom-1 right-1 text-[9px] uppercase font-bold px-1 py-0.5 rounded bg-black/75 text-pink-400">
              {shareItem.type}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <img 
                src={shareItem.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                alt={shareItem.author.username}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-xs font-semibold text-zinc-300 truncate">
                @{shareItem.author.username}
              </span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
              {shareItem.caption || shareItem.title || 'Social Sphere media'}
            </p>
          </div>
        </div>

        {/* Action Row: Add to Your Story */}
        <div className="px-4 pb-2">
          <button
            onClick={handleAddToStory}
            disabled={storyAdded}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border transition-all ${
              storyAdded 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-pink-500/30 hover:border-pink-500/60 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
                <img 
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                  alt="Your story" 
                  className="w-8 h-8 rounded-full object-cover border border-black"
                />
                <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 text-white">
                  <PlusCircle className="w-3 h-3" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">
                  {storyAdded ? 'Added to Your Story' : 'Add to Your Story'}
                </p>
                <p className="text-[11px] text-zinc-400">Share with all your followers</p>
              </div>
            </div>

            {storyAdded ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <Check className="w-4 h-4" /> Added
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-500 text-white shadow-md hover:bg-pink-600">
                Share
              </span>
            )}
          </button>
        </div>

        {/* Direct Messages Section */}
        <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[160px] max-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Send in Direct Message
            </span>
          </div>

          {/* Quick Search */}
          {conversations.length > 2 && (
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search direct chats..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
              />
            </div>
          )}

          {/* Conversations List */}
          {filteredConvs.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-xs">
              <MessageCircle className="w-7 h-7 mx-auto mb-2 text-zinc-600" />
              {conversations.length === 0 
                ? 'No active chats yet. Connect with people in Explore!' 
                : 'No contacts match your search'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConvs.map(conv => {
                const isSent = sentMap[conv.id];
                return (
                  <div 
                    key={conv.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={conv.participant.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'} 
                        alt={conv.participant.username} 
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {conv.participant.name || conv.participant.username}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate">
                          @{conv.participant.username}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendToChat(conv.id, conv.participant.name || conv.participant.username)}
                      disabled={isSent}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-pink-500 text-white hover:bg-pink-600 shadow-md active:scale-95'
                      }`}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Sent
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Send
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* External Social Channels Row */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2.5">
            Share to Other Apps
          </p>

          <div className="grid grid-cols-5 gap-2 text-center">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <span className="text-lg">💬</span>
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">WhatsApp</span>
            </button>

            {/* Instagram */}
            <button
              onClick={handleInstagram}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                <span className="text-lg">📸</span>
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">Instagram</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebook}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <span className="text-lg">👥</span>
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">Facebook</span>
            </button>

            {/* X / Twitter */}
            <button
              onClick={handleTwitter}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                <span className="text-sm font-black">𝕏</span>
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">X (Twitter)</span>
            </button>

            {/* Copy Link / Native Share */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </div>
              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-200">
                {copied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
