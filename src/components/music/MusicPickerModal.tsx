import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Play, Pause, Music, Check, Volume2, Globe, Loader2, Sparkles } from 'lucide-react';
import { SongTrack } from '../../types';
import { CURATED_SONGS } from './curatedTracks';

export { CURATED_SONGS };
export const POPULAR_TRACKS = CURATED_SONGS;

interface MusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: SongTrack) => void;
  currentSelectedId?: string;
  selectedSongId?: string;
}

const GENRES = [
  { id: 'All', label: 'All', icon: '✨' },
  { id: 'Hindi', label: 'Hindi / Bollywood', icon: '🇮🇳' },
  { id: 'Punjabi', label: 'Punjabi / Desi', icon: '🌾' },
  { id: 'English', label: 'Global English', icon: '🌍' },
  { id: 'Spanish', label: 'Spanish / Latin', icon: '💃' },
  { id: 'K-Pop', label: 'K-Pop & Asian', icon: '🌸' },
  { id: 'Lo-Fi', label: 'Lo-Fi & Chill', icon: '🎧' },
];

const POPULAR_ARTISTS = [
  { name: 'Arijit Singh', flag: '🇮🇳' },
  { name: 'Diljit Dosanjh', flag: '🌾' },
  { name: 'AP Dhillon', flag: '🔥' },
  { name: 'Sidhu Moosewala', flag: '👑' },
  { name: 'Shreya Ghoshal', flag: '🎤' },
  { name: 'Atif Aslam', flag: '✨' },
  { name: 'Anirudh', flag: '⚡' },
  { name: 'Taylor Swift', flag: '⭐' },
  { name: 'The Weeknd', flag: '🌙' },
  { name: 'Drake', flag: '🦉' },
  { name: 'Bad Bunny', flag: '🐰' },
  { name: 'BTS', flag: '💜' },
];

export const MusicPickerModal: React.FC<MusicPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  currentSelectedId,
  selectedSongId,
}) => {
  const effectiveSelectedId = currentSelectedId || selectedSongId;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SongTrack[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Debounced online iTunes API search for ANY artist/song in ANY language
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const query = searchQuery.trim();
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=25`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const mapped: SongTrack[] = data.results.map((item: any) => ({
            id: `itunes_${item.trackId}`,
            title: item.trackName || 'Unknown Title',
            artist: item.artistName || 'Unknown Artist',
            coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '300x300bb') ||
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
            audioUrl: item.previewUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            duration: Math.round((item.trackTimeMillis || 30000) / 1000),
            genre: item.primaryGenreName || 'Music'
          }));
          setSearchResults(mapped);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.warn('Online music search fallback:', err);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  // Filter curated songs based on active genre and search query
  const localFiltered = CURATED_SONGS.filter((song) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeGenre === 'All' || song.genre === activeGenre;
    return matchesQuery && matchesGenre;
  });

  // Combine results: if user searched online, show local matches first then online live results
  let displayedSongs: SongTrack[] = [];
  if (searchQuery.trim()) {
    const existingIds = new Set(localFiltered.map(s => s.title.toLowerCase() + s.artist.toLowerCase()));
    const uniqueOnline = searchResults.filter(s => !existingIds.has(s.title.toLowerCase() + s.artist.toLowerCase()));
    displayedSongs = [...localFiltered, ...uniqueOnline];
  } else {
    displayedSongs = localFiltered;
  }

  const togglePreview = (e: React.MouseEvent, song: SongTrack) => {
    e.stopPropagation();
    if (playingSongId === song.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(song.audioUrl);
      audio.volume = 0.6;
      audio.play().catch(() => {
        playSyntheticChime();
      });
      audio.onended = () => setPlayingSongId(null);
      audioRef.current = audio;
      setPlayingSongId(song.id);
    }
  };

  const playSyntheticChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  const handleSelect = (song: SongTrack) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingSongId(null);
    onSelectSong(song);
    onClose();
  };

  const handleModalClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingSongId(null);
    onClose();
  };

  return (
    <div
      onClick={handleModalClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0b0b14] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-cosmic p-[1.5px] flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <div className="w-full h-full bg-black/80 rounded-2xl flex items-center justify-center">
                <Music className="w-5 h-5 text-pink-400" />
              </div>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight flex items-center gap-1.5">
                Music Universe
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-zinc-400">Hindi, Punjabi, Global Pop, Latin & Worldwide Hits</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3.5 border-b border-white/10 bg-white/[0.01] space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Hindi, Arijit, Punjabi, AP Dhillon, Taylor Swift, Anime..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
            {isSearchingOnline && (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          {/* Genre / Language Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map((g) => {
              const active = activeGenre === g.id && !searchQuery.trim();
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGenre(g.id);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    active
                      ? 'bg-gradient-cosmic text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] scale-[1.02]'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Popular Artists Search Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 whitespace-nowrap mr-1">Trending:</span>
            {POPULAR_ARTISTS.map((artist) => (
              <button
                key={artist.name}
                onClick={() => setSearchQuery(artist.name)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap transition-all ${
                  searchQuery.toLowerCase() === artist.name.toLowerCase()
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{artist.flag}</span>
                <span>{artist.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {displayedSongs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-zinc-500">
              <Globe className="w-8 h-8 opacity-40 animate-pulse text-pink-400" />
              <p className="text-xs font-semibold text-zinc-400">No tracks found</p>
              <p className="text-[10px] text-zinc-500 max-w-xs">
                Try searching for any artist, movie or song name (e.g. Arijit Singh, Diljit, The Weeknd, BTS)
              </p>
            </div>
          ) : (
            displayedSongs.map((song) => {
              const isSelected = effectiveSelectedId === song.id;
              const isPlaying = playingSongId === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => handleSelect(song)}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group border ${
                    isSelected
                      ? 'bg-pink-500/10 border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {/* Album Art with Floating Play Toggle */}
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 border border-white/10 group-hover:shadow-[0_0_12px_rgba(236,72,153,0.3)] transition-all">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => togglePreview(e, song)}
                        className={`absolute inset-0 flex items-center justify-center transition-all ${
                          isPlaying
                            ? 'bg-black/60 opacity-100'
                            : 'bg-black/40 opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isPlaying ? (
                          <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg animate-pulse">
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Song Info */}
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate transition-colors ${
                        isPlaying ? 'text-pink-400' : 'text-white'
                      }`}>
                        {song.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5">
                        <span>{song.artist}</span>
                        {song.genre && (
                          <>
                            <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                            <span className="text-[9px] text-zinc-400 uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {song.genre}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Animated Equalizer when playing */}
                    {isPlaying && (
                      <div className="flex items-center gap-0.5 h-4 px-2 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                        <span className="w-0.5 h-3 bg-pink-400 rounded-full animate-pulse"></span>
                        <span className="w-0.5 h-4 bg-pink-400 rounded-full animate-bounce"></span>
                        <span className="w-0.5 h-2 bg-pink-400 rounded-full animate-pulse"></span>
                      </div>
                    )}

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-gradient-cosmic flex items-center justify-center text-white shadow-[0_0_10px_rgba(236,72,153,0.6)]">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold text-zinc-500 group-hover:text-pink-400 transition-colors px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                        Select
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            Tap album art to preview audio
          </span>
          <span className="text-zinc-500">Global & Hindi Music Hub</span>
        </div>
      </div>
    </div>
  );
};
