import { User, Post, Story, Reel, NotificationItem, Conversation, FilterType } from '../types';

export const CURRENT_USER: User = {
  id: 'user_current',
  username: 'alexandra.sphere',
  name: 'Alexandra Rivers',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio: 'Visual Storyteller & Minimalist ✨\nCapturing moments through pixels & frames 📸\nFounder of @sphere_creatives 🚀',
  website: 'https://socialsphere.design',
  followersCount: 14820,
  followingCount: 524,
  postsCount: 42,
  isVerified: true,
  isFollowing: false,
};

export const MOCK_USERS: Record<string, User> = {
  elena: {
    id: 'user_elena',
    username: 'elena_designs',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Product Designer @ Tokyo 📐 Minimal interfaces & modern aesthetics',
    followersCount: 29400,
    followingCount: 412,
    postsCount: 118,
    isVerified: true,
    isFollowing: true,
  },
  marcus: {
    id: 'user_marcus',
    username: 'marcus.lens',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Street & Cyberpunk photographer 🌆 Sony A7IV • Chasing shadows & neon',
    followersCount: 88500,
    followingCount: 680,
    postsCount: 245,
    isVerified: true,
    isFollowing: true,
  },
  sophia: {
    id: 'user_sophia',
    username: 'sophia.travels',
    name: 'Sophia Chen',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    bio: 'Exploring 42 countries and counting ✈️ Next stop: Iceland 🇮🇸',
    followersCount: 51200,
    followingCount: 389,
    postsCount: 184,
    isVerified: true,
    isFollowing: true,
  },
  kai: {
    id: 'user_kai',
    username: 'kai_synth',
    name: 'Kai Tanaka',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    bio: 'Audio visualizer & 3D motion artist 🎛️ Synthwave nights in Osaka',
    followersCount: 19400,
    followingCount: 490,
    postsCount: 67,
    isVerified: false,
    isFollowing: false,
  },
  mateo: {
    id: 'user_mateo',
    username: 'chef_mateo',
    name: 'Mateo Rossi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Culinary adventures & Artisan sourdough 🥖 Florence, Italy 🍷',
    followersCount: 36700,
    followingCount: 290,
    postsCount: 142,
    isVerified: false,
    isFollowing: false,
  },
  maya: {
    id: 'user_maya',
    username: 'maya_mindful',
    name: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Mindfulness, botany & slow living 🌿 California sunsets',
    followersCount: 12100,
    followingCount: 310,
    postsCount: 88,
    isVerified: false,
    isFollowing: true,
  }
};

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story_current',
    user: CURRENT_USER,
    hasUnseen: false,
    slides: [
      {
        id: 'slide_curr_1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Morning paradise at the Pacific 🌊',
        duration: 5,
        createdAt: '1h ago'
      },
      {
        id: 'slide_curr_2',
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'First coffee of the day ☕',
        duration: 5,
        createdAt: '35m ago'
      }
    ]
  },
  {
    id: 'story_elena',
    user: MOCK_USERS.elena,
    hasUnseen: true,
    slides: [
      {
        id: 'slide_el_1',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Minimalist studio vibes today ✨',
        duration: 5,
        createdAt: '2h ago'
      },
      {
        id: 'slide_el_2',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'New design system components ready!',
        duration: 5,
        createdAt: '1h ago'
      }
    ]
  },
  {
    id: 'story_marcus',
    user: MOCK_USERS.marcus,
    hasUnseen: true,
    slides: [
      {
        id: 'slide_mar_1',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Tokyo rain and reflections 🌧️',
        duration: 5,
        createdAt: '4h ago'
      },
      {
        id: 'slide_mar_2',
        url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Shibuya crossing at midnight 🌙',
        duration: 5,
        createdAt: '3h ago'
      }
    ]
  },
  {
    id: 'story_sophia',
    user: MOCK_USERS.sophia,
    hasUnseen: true,
    slides: [
      {
        id: 'slide_sop_1',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Sunset in Santorini, Greece 🇬🇷',
        duration: 5,
        createdAt: '5h ago'
      }
    ]
  },
  {
    id: 'story_kai',
    user: MOCK_USERS.kai,
    hasUnseen: true,
    slides: [
      {
        id: 'slide_kai_1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Soundcheck in progress 🎵',
        duration: 5,
        createdAt: '6h ago'
      }
    ]
  },
  {
    id: 'story_mateo',
    user: MOCK_USERS.mateo,
    hasUnseen: true,
    slides: [
      {
        id: 'slide_mat_1',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Wood-fired sourdough out of the oven! 🥖',
        duration: 5,
        createdAt: '8h ago'
      }
    ]
  },
  {
    id: 'story_maya',
    user: MOCK_USERS.maya,
    hasUnseen: false,
    slides: [
      {
        id: 'slide_may_1',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
        type: 'image',
        caption: 'Breathe in the redwood morning mist 🌲',
        duration: 5,
        createdAt: '12h ago'
      }
    ]
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    user: MOCK_USERS.elena,
    media: [
      {
        id: 'media_1_1',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-clarendon'
      },
      {
        id: 'media_1_2',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-normal'
      }
    ],
    caption: 'Golden hour architectural symphony in Barcelona. Notice how the cast shadows create a geometric rhythm across the facades 🏛️✨ #Architecture #Design #Minimal #Barcelona',
    location: 'Barcelona, Spain',
    likesCount: 2489,
    isLiked: true,
    isSaved: false,
    createdAt: '3 hours ago',
    tags: ['Architecture', 'Design', 'Minimal', 'Barcelona'],
    comments: [
      {
        id: 'comm_1',
        postId: 'post_1',
        user: MOCK_USERS.marcus,
        text: 'The contrast and composition on that second shot is pure perfection! 🔥',
        createdAt: '2h ago',
        likesCount: 18,
        isLiked: true
      },
      {
        id: 'comm_2',
        postId: 'post_1',
        user: CURRENT_USER,
        text: 'Incredible lighting! What lens did you shoot this with?',
        createdAt: '1h ago',
        likesCount: 6,
        isLiked: false
      },
      {
        id: 'comm_3',
        postId: 'post_1',
        user: MOCK_USERS.sophia,
        text: 'Adding this neighborhood to my travel bucket list immediately! ✈️',
        createdAt: '45m ago',
        likesCount: 4,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_2',
    user: MOCK_USERS.marcus,
    media: [
      {
        id: 'media_2_1',
        url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-noir'
      }
    ],
    caption: 'Midnight wanderer in Shinjuku. Tokyo hits differently when the asphalt turns into a mirror after a sudden summer downpour. 🌧️ Neon never sleeps.\n\n#StreetPhotography #Tokyo #NightVision #Cyberpunk',
    location: 'Shinjuku, Tokyo',
    likesCount: 7842,
    isLiked: false,
    isSaved: true,
    createdAt: '7 hours ago',
    tags: ['StreetPhotography', 'Tokyo', 'NightVision', 'Cyberpunk'],
    comments: [
      {
        id: 'comm_4',
        postId: 'post_2',
        user: MOCK_USERS.kai,
        text: 'Looks like a still straight out of Blade Runner 2049! 🛸',
        createdAt: '6h ago',
        likesCount: 34,
        isLiked: true
      },
      {
        id: 'comm_5',
        postId: 'post_2',
        user: MOCK_USERS.elena,
        text: 'The color grading here is out of this world Marcus 🖤',
        createdAt: '5h ago',
        likesCount: 12,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_3',
    user: MOCK_USERS.sophia,
    media: [
      {
        id: 'media_3_1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-valencia'
      },
      {
        id: 'media_3_2',
        url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-warm'
      }
    ],
    caption: 'Waking up above the clouds along the volcanic cliffs of Madeira. Some places leave you completely speechless 🌊⛰️ #Wanderlust #ExploreTheWorld #OceanViews',
    location: 'Madeira Islands, Portugal',
    likesCount: 4310,
    isLiked: false,
    isSaved: false,
    createdAt: '14 hours ago',
    tags: ['Wanderlust', 'ExploreTheWorld', 'OceanViews'],
    comments: [
      {
        id: 'comm_6',
        postId: 'post_3',
        user: MOCK_USERS.maya,
        text: 'The ocean color is unbelievable. Such serenity 💙',
        createdAt: '10h ago',
        likesCount: 7,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_4',
    user: CURRENT_USER,
    media: [
      {
        id: 'media_4_1',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-juno'
      }
    ],
    caption: 'Workspace reset for the week ahead. Clean desk, hot matcha, and building the future on Social Sphere! What projects are you creating this week? 💻⚡ #Workspace #CreativeCoding #UIUX #MinimalSetup',
    location: 'San Francisco, California',
    likesCount: 1890,
    isLiked: true,
    isSaved: true,
    createdAt: '1 day ago',
    tags: ['Workspace', 'CreativeCoding', 'UIUX', 'MinimalSetup'],
    comments: [
      {
        id: 'comm_7',
        postId: 'post_4',
        user: MOCK_USERS.elena,
        text: 'That ambient backlighting is so clean! Loving this setup ✨',
        createdAt: '22h ago',
        likesCount: 15,
        isLiked: true
      },
      {
        id: 'comm_8',
        postId: 'post_4',
        user: MOCK_USERS.mateo,
        text: 'You need an espresso next to that keyboard Alexandra! ☕',
        createdAt: '20h ago',
        likesCount: 8,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_5',
    user: MOCK_USERS.mateo,
    media: [
      {
        id: 'media_5_1',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-warm'
      }
    ],
    caption: 'Handmade tagliatelle with shaved black summer truffles and 24-month Parmigiano Reggiano. True Italian soul food. 🍝 Simplicity done right.',
    location: 'Florence, Tuscany',
    likesCount: 3120,
    isLiked: false,
    isSaved: false,
    createdAt: '2 days ago',
    tags: ['Foodie', 'PastaLover', 'ItalianCuisine', 'Florence'],
    comments: [
      {
        id: 'comm_9',
        postId: 'post_5',
        user: CURRENT_USER,
        text: 'I can literally smell this through the screen! Bellissimo 🤌',
        createdAt: '1d ago',
        likesCount: 9,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_6',
    user: MOCK_USERS.kai,
    media: [
      {
        id: 'media_6_1',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80',
        type: 'image',
        filter: 'filter-cyber'
      }
    ],
    caption: 'Visualizing analog synthesis waves through dynamic laser projections. Testing the new stage installation for Saturday night. 🎛️⚡ #VisualArt #Synthwave #ElectronicMusic #Lasers',
    location: 'Neo Tokyo Art Center',
    likesCount: 5214,
    isLiked: true,
    isSaved: false,
    createdAt: '2 days ago',
    tags: ['VisualArt', 'Synthwave', 'ElectronicMusic', 'Lasers'],
    comments: [
      {
        id: 'comm_10',
        postId: 'post_6',
        user: MOCK_USERS.marcus,
        text: 'Those cyan and magenta waves are insane Kai! 🔥',
        createdAt: '1d ago',
        likesCount: 14,
        isLiked: true
      }
    ]
  }
];

export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel_1',
    user: MOCK_USERS.marcus,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    caption: 'Tokyo night walk in 4K. Listening to lo-fi beats in the pouring rain 🌧️🎧 #tokyo #reels #cinematic',
    audioTitle: 'Marcus Vance • Shibuya Rain Tape Vol. 1',
    likesCount: 42100,
    commentsCount: 890,
    sharesCount: 3400,
    isLiked: true,
    isSaved: false
  },
  {
    id: 'reel_2',
    user: MOCK_USERS.sophia,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    caption: 'Hidden waterfalls in Iceland you must visit once in your life 🌊🇮🇸 Save this for your trip!',
    audioTitle: 'Sophia Chen • Wandering Hearts (Acoustic)',
    likesCount: 65400,
    commentsCount: 1420,
    sharesCount: 12800,
    isLiked: false,
    isSaved: true
  },
  {
    id: 'reel_3',
    user: MOCK_USERS.elena,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    caption: 'Designing a micro-interaction in 60 seconds. Fluid button press mechanics 🎨⚡ #ui #design #figma',
    audioTitle: 'Elena Rostova • Ambient Coding Chill',
    likesCount: 28900,
    commentsCount: 460,
    sharesCount: 2150,
    isLiked: false,
    isSaved: false
  },
  {
    id: 'reel_4',
    user: MOCK_USERS.mateo,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    caption: 'The crunch of 72-hour cold fermented pizza crust 🍕 Turn your volume UP! 🔊 #pizza #foodasmr',
    audioTitle: 'Chef Mateo • ASMR Kitchen Vibes',
    likesCount: 91300,
    commentsCount: 2800,
    sharesCount: 18900,
    isLiked: true,
    isSaved: true
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_elena',
    participant: MOCK_USERS.elena,
    unreadCount: 1,
    messages: [
      {
        id: 'msg_el_1',
        senderId: 'user_elena',
        receiverId: 'user_current',
        text: 'Hey Alexandra! Have you had a chance to test the new design mockups for Social Sphere?',
        createdAt: '10:30 AM',
        isRead: true
      },
      {
        id: 'msg_el_2',
        senderId: 'user_current',
        receiverId: 'user_elena',
        text: 'Hey Elena! Yes, absolutely loving the subtle gradients and story transitions!',
        createdAt: '10:34 AM',
        isRead: true
      },
      {
        id: 'msg_el_3',
        senderId: 'user_elena',
        receiverId: 'user_current',
        text: 'Awesome! Let me know when you publish your next photography batch, would love to feature it 🎉',
        createdAt: '10:36 AM',
        isRead: false
      }
    ]
  },
  {
    id: 'conv_marcus',
    participant: MOCK_USERS.marcus,
    unreadCount: 0,
    messages: [
      {
        id: 'msg_mar_1',
        senderId: 'user_marcus',
        receiverId: 'user_current',
        text: 'Did you see that rainy shot I posted from Shinjuku?',
        createdAt: 'Yesterday',
        isRead: true
      },
      {
        id: 'msg_mar_2',
        senderId: 'user_current',
        receiverId: 'user_marcus',
        text: 'Yes! The reflection and noir tones were phenomenal!',
        createdAt: 'Yesterday',
        isRead: true
      }
    ]
  },
  {
    id: 'conv_sophia',
    participant: MOCK_USERS.sophia,
    unreadCount: 0,
    messages: [
      {
        id: 'msg_sop_1',
        senderId: 'user_sophia',
        receiverId: 'user_current',
        text: 'Hey! Planning an expedition to Patagonia in October, let me know if you want to join!',
        createdAt: '2 days ago',
        isRead: true
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'like',
    user: MOCK_USERS.elena,
    postImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&auto=format&fit=crop&q=80',
    createdAt: '15m ago',
    isRead: false
  },
  {
    id: 'notif_2',
    type: 'comment',
    user: MOCK_USERS.marcus,
    commentText: 'The contrast and composition on that second shot is pure perfection! 🔥',
    postImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&auto=format&fit=crop&q=80',
    createdAt: '1h ago',
    isRead: false
  },
  {
    id: 'notif_3',
    type: 'follow',
    user: MOCK_USERS.kai,
    createdAt: '3h ago',
    isRead: true
  },
  {
    id: 'notif_4',
    type: 'like',
    user: MOCK_USERS.sophia,
    postImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    createdAt: '5h ago',
    isRead: true
  },
  {
    id: 'notif_5',
    type: 'comment',
    user: MOCK_USERS.mateo,
    commentText: 'You need an espresso next to that keyboard Alexandra! ☕',
    postImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&auto=format&fit=crop&q=80',
    createdAt: '1d ago',
    isRead: true
  }
];

export const FILTER_OPTIONS: { id: FilterType; label: string; className: string }[] = [
  { id: 'normal', label: 'Normal', className: 'filter-normal' },
  { id: 'clarendon', label: 'Clarendon', className: 'filter-clarendon' },
  { id: 'gingham', label: 'Gingham', className: 'filter-gingham' },
  { id: 'juno', label: 'Juno', className: 'filter-juno' },
  { id: 'lark', label: 'Lark', className: 'filter-lark' },
  { id: 'moon', label: 'Moon', className: 'filter-moon' },
  { id: 'valencia', label: 'Valencia', className: 'filter-valencia' },
  { id: 'vintage', label: 'Vintage', className: 'filter-vintage' },
  { id: 'noir', label: 'Noir', className: 'filter-noir' },
  { id: 'warm', label: 'Warm', className: 'filter-warm' },
  { id: 'cyber', label: 'Cyber', className: 'filter-cyber' },
];

export const SAMPLE_POST_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop&q=80',
];

export const EXPLORE_CATEGORIES = [
  'For You',
  'Architecture',
  'Photography',
  'Travel',
  'Aesthetic',
  'Technology',
  'Food & Dining',
  'Nature'
];

export const EXPLORE_GRID_ITEMS = [
  { id: 'exp_1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 1420, comments: 84, isLarge: true },
  { id: 'exp_2', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 890, comments: 32 },
  { id: 'exp_3', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 2310, comments: 110 },
  { id: 'exp_4', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 5400, comments: 340 },
  { id: 'exp_5', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 3100, comments: 95 },
  { id: 'exp_6', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 4890, comments: 215, isLarge: true },
  { id: 'exp_7', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 1650, comments: 62 },
  { id: 'exp_8', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 7800, comments: 420 },
  { id: 'exp_9', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 9200, comments: 640 },
  { id: 'exp_10', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 3410, comments: 180 },
  { id: 'exp_11', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 2100, comments: 75 },
  { id: 'exp_12', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80', type: 'image', likes: 4300, comments: 205 }
];
