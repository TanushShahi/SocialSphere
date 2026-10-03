import React, { useState } from 'react';
import { Globe, Users, Plus, Check, Search, Sparkles, Compass, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WorldItem {
  id: string;
  name: string;
  category: string;
  members: string;
  image: string;
  description: string;
  tags: string[];
}

const INITIAL_WORLDS: WorldItem[] = [
  {
    id: 'w_travel',
    name: 'Travel Lovers',
    category: 'Travel',
    members: '128K members',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    description: 'Wanderers, roadtrippers & globetrotters sharing hidden gems and breathtaking journeys.',
    tags: ['Nature', 'Adventures', 'Photography']
  },
  {
    id: 'w_tech',
    name: 'Tech Hub',
    category: 'Technology',
    members: '95K members',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description: 'AI, engineers, builders & spatial computing pioneers shaping tomorrow.',
    tags: ['Coding', 'AI', 'Startups']
  },
  {
    id: 'w_anime',
    name: 'Anime World',
    category: 'Entertainment',
    members: '76K members',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    description: 'Fan art, seasonal anime discussions, manga chapters & character showcases.',
    tags: ['Manga', 'Art', 'Culture']
  },
  {
    id: 'w_photo',
    name: 'Photography',
    category: 'Creatives',
    members: '110K members',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80',
    description: 'Shutterbugs mastering natural lighting, color grading and visual storytelling.',
    tags: ['Cinematic', 'Lenses', 'Portraits']
  },
  {
    id: 'w_music',
    name: 'Music Makers',
    category: 'Audio',
    members: '84K members',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    description: 'Producers, vocalists & audiophiles sharing raw stems, lo-fi beats & vinyl tracks.',
    tags: ['Soundtracks', 'Beats', 'Studio']
  },
  {
    id: 'w_fitness',
    name: 'Fitness & Motion',
    category: 'Health',
    members: '62K members',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    description: 'Calisthenics, gym PRs, healthy recipes & relentless daily discipline.',
    tags: ['Workout', 'Diet', 'Athletes']
  }
];

export const WorldsView: React.FC = () => {
  const { theme } = useApp();
  const [filterTab, setFilterTab] = useState<'for_you' | 'trending' | 'my_worlds'>('for_you');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinedWorlds, setJoinedWorlds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sphere_joined_worlds');
      return saved ? JSON.parse(saved) : ['w_travel'];
    } catch {
      return ['w_travel'];
    }
  });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleJoin = (worldId: string, worldName: string) => {
    setJoinedWorlds(prev => {
      let updated: string[];
      if (prev.includes(worldId)) {
        updated = prev.filter(id => id !== worldId);
        showToast(`Left ${worldName}`);
      } else {
        updated = [...prev, worldId];
        showToast(`Joined ${worldName}! 🪐`);
      }
      localStorage.setItem('sphere_joined_worlds', JSON.stringify(updated));
      return updated;
    });
  };

  const filteredWorlds = INITIAL_WORLDS.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterTab === 'my_worlds') return joinedWorlds.includes(w.id);
    return true;
  });

  return (
    <div className="max-w-[960px] mx-auto py-3 sm:py-6 px-3 sm:px-6 select-none animate-fade-in text-white pb-24 md:pb-8">
      {/* Toast message */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-cosmic text-white text-xs font-bold rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-pink-500" />
            Worlds
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Communities beyond limits</p>
        </div>

        <button
          onClick={() => showToast('World creation portal opening soon! ✨')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-cosmic text-white text-xs font-bold shadow-md shadow-pink-500/20 hover:opacity-95 transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Create World</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search worlds, topics, communities..."
          className="w-full bg-zinc-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/50 backdrop-blur-md transition-colors"
        />
      </div>

      {/* Filter Tabs matching mockup: [ For You ] [ Trending ] [ My Worlds ] */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterTab('for_you')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTab === 'for_you'
              ? 'bg-gradient-cosmic text-white shadow-lg shadow-pink-500/25 scale-105'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>For You</span>
        </button>

        <button
          onClick={() => setFilterTab('trending')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTab === 'trending'
              ? 'bg-gradient-cosmic text-white shadow-lg shadow-pink-500/25 scale-105'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Trending</span>
        </button>

        <button
          onClick={() => setFilterTab('my_worlds')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTab === 'my_worlds'
              ? 'bg-gradient-cosmic text-white shadow-lg shadow-pink-500/25 scale-105'
              : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>My Worlds ({joinedWorlds.length})</span>
        </button>
      </div>

      {/* Worlds 2-Column Card Grid matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredWorlds.map((world) => {
          const isJoined = joinedWorlds.includes(world.id);
          return (
            <div 
              key={world.id}
              className="aerogel-card rounded-3xl overflow-hidden border border-white/10 hover:border-pink-500/30 transition-all group flex flex-col justify-between bg-zinc-950/80 backdrop-blur-xl shadow-xl"
            >
              {/* Card Banner Image */}
              <div className="relative h-36 w-full overflow-hidden">
                <img 
                  src={world.image} 
                  alt={world.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                
                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-pink-300">
                  {world.category}
                </div>

                {/* Member Count Badge */}
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 drop-shadow">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{world.members}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight mb-1 group-hover:text-pink-400 transition-colors">
                    {world.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {world.description}
                  </p>
                </div>

                {/* Tags and Join Button */}
                <div className="pt-4 flex items-center justify-between border-t border-white/5 mt-3">
                  <div className="flex items-center gap-1.5">
                    {world.tags.map((t, i) => (
                      <span key={i} className="text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/5">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleJoin(world.id, world.name)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                      isJoined
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-white/10'
                        : 'bg-gradient-cosmic text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95'
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
