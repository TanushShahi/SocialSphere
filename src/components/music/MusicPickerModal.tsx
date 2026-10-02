import React, { useState, useRef } from 'react';
import { X, Search, Play, Pause, Music, Check, Volume2 } from 'lucide-react';
import { SongTrack } from '../../types';

export const CURATED_SONGS: SongTrack[] = [
  {
    id: 'song_1',
    title: 'Tokyo Rain Lofi',
    artist: 'Sphere Chill Beats',
    coverUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 30,
    genre: 'Lo-Fi'
  },
  {
    id: 'song_2',
    title: 'Golden Hour Acoustic',
    artist: 'Summer Echoes',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 30,
    genre: 'Acoustic'
  },
  {
    id: 'song_3',
    title: 'Midnight Synthwave',
    artist: 'Neon Boulevard',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 30,
    genre: 'Synthwave'
  },
  {
    id: 'song_4',
    title: 'Morning Matcha Vibes',
    artist: 'Kyoto Sun',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 30,
    genre: 'Chill'
  },
  {
    id: 'song_5',
    title: 'Starlight Dreamer',
    artist: 'Aura Minimalist',
    coverUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 30,
    genre: 'Ambient'
  },
  {
    id: 'song_6',
    title: 'Urban Sunset Groove',
    artist: 'Solaris Rhythm',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 30,
    genre: 'Pop'
  }
];

export const POPULAR_TRACKS = CURATED_SONGS;

interface MusicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (song: SongTrack) => void;
  currentSelectedId?: string;
  selectedSongId?: string;
}

export const MusicPickerModal: React.FC<MusicPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSong,
  currentSelectedId,
  selectedSongId
}) => {
  const effectiveSelectedId = currentSelectedId || selectedSongId;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const genres = ['All', 'Lo-Fi', 'Acoustic', 'Synthwave', 'Chill', 'Ambient', 'Pop'];

  const filteredSongs = CURATED_SONGS.filter(song => {
    const matchesQuery =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeGenre === 'All' || song.genre === activeGenre;
    return matchesQuery && matchesGenre;
  });

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
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: Web Audio synth beep melody if external audio cannot play
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-white"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Add Music</h3>
              <p className="text-[11px] text-zinc-400">Attach a song to your Story or Post</p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full bg-zinc-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800/70">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search music, artists, genres..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Genre Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeGenre === g
                    ? 'bg-white text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => {
              const isSelected = song.id === effectiveSelectedId;
              const isPlaying = song.id === playingSongId;

              return (
                <div
                  key={song.id}
                  onClick={() => handleSelect(song)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-zinc-900 border border-zinc-700' : 'hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Album Art with Play/Pause button */}
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 group">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => togglePreview(e, song)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        title={isPlaying ? 'Pause preview' : 'Play preview'}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate">{song.title}</span>
                        {isPlaying && (
                          <span className="flex items-center gap-0.5">
                            <span className="w-1 h-3 bg-pink-500 rounded-full animate-pulse"></span>
                            <span className="w-1 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></span>
                            <span className="w-1 h-3.5 bg-pink-500 rounded-full animate-pulse delay-150"></span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {song.artist} � <span className="text-zinc-500">{song.genre}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(song);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No songs found matching &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
