import { User, Post, Group, Event, Sermon, Conversation, DailyVerse, BibleVerse } from '../types';

export const CURRENT_USER: User = {
  id: 'user_tex_admin',
  name: 'Tex',
  email: 'lightsouttattootex@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  coverImage: 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=1200',
  bio: 'Administrator & Owner of Living on a Prayer. Walking in faith, leading and managing our Christian prayer community.',
  favoriteVerse: 'Philippians 4:13 - "I can do all things through Christ which strengtheneth me."',
  joinedDate: 'August 2026',
  role: 'Administrator & App Owner',
  followersCount: 142,
  followingCount: 38,
  followingIds: ['user_2', 'user_3'],
  followerIds: ['user_2', 'user_3', 'user_4'],
  pushNotificationsEnabled: true,
  followRequests: [
    {
      id: 'req_1',
      fromUserId: 'user_5',
      fromUserName: 'Sister Rebecca',
      fromUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      timestamp: '10 mins ago',
      status: 'pending'
    },
    {
      id: 'req_2',
      fromUserId: 'user_4',
      fromUserName: 'Brother John Miller',
      fromUserAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      timestamp: '1 hour ago',
      status: 'pending'
    }
  ],
  notifications: [
    {
      id: 'notif_1',
      title: 'New Follow Request',
      message: 'Sister Rebecca sent you a follow request to connect on Living on a Prayer.',
      timestamp: '10 mins ago',
      isRead: false,
      type: 'follow_request',
      fromUserId: 'user_5',
      fromUserName: 'Sister Rebecca',
      fromUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'notif_2',
      title: 'Follower Connected',
      message: 'Pastor David accepted your follow request! You are now following each other.',
      timestamp: '2 hours ago',
      isRead: false,
      type: 'follow_accepted',
      fromUserId: 'user_3',
      fromUserName: 'Pastor David'
    }
  ]
};

export const DAILY_VERSES: DailyVerse[] = [
  {
    date: '2026-08-03',
    verse: {
      book: 'Philippians',
      chapter: 4,
      verse: 6,
      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.'
    },
    devotional: 'Do not carry the burden of anxiety today. Bring every single need, small or great, to God in prayer with a thankful heart.'
  },
  {
    date: '2026-08-04',
    verse: {
      book: 'Jeremiah',
      chapter: 29,
      verse: 11,
      text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.'
    },
    devotional: 'God has a purposeful plan for your life filled with hope, peace, and divine promise.'
  },
  {
    date: '2026-08-05',
    verse: {
      book: 'Psalm',
      chapter: 23,
      verse: 1,
      text: 'The LORD is my shepherd; I shall not want.'
    },
    devotional: 'Rest in the loving care of the Good Shepherd who provides everything you truly need.'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    userId: 'user_2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    title: 'Urgent Prayer Request for My Mother in Surgery',
    category: 'Urgent Prayer',
    content: 'Please lift my mother Hannah in prayer today as she undergoes heart bypass surgery at 10 AM. We trust in the divine healing power of Jehovah Rapha!',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
    createdAt: '2 hours ago',
    likesCount: 34,
    commentsCount: 12,
    sharesCount: 5,
    isLiked: true,
    comments: [
      {
        id: 'c1',
        postId: 'post_1',
        userId: 'user_3',
        userName: 'Pastor David',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        content: 'Standing in agreement with you Sarah! Isaiah 53:5 - By His stripes she is healed.',
        createdAt: '1 hour ago',
        likes: 8
      },
      {
        id: 'c2',
        postId: 'post_1',
        userId: 'user_1',
        userName: 'Brother Christian',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        content: 'Praying peace over the surgical room and wisdom for the surgeons. Amen!',
        createdAt: '45 mins ago',
        likes: 4
      }
    ]
  },
  {
    id: 'post_2',
    userId: 'user_3',
    userName: 'Pastor David',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: 'Praise God! Breakthrough in Youth Ministry Outreach',
    category: 'Praise Report',
    content: 'Over 40 youth accepted Jesus as their personal Lord and Savior at last night’s park worship revival! All glory to God for transformed lives.',
    imageUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
    createdAt: '5 hours ago',
    likesCount: 89,
    commentsCount: 19,
    sharesCount: 14,
    comments: [
      {
        id: 'c3',
        postId: 'post_2',
        userId: 'user_4',
        userName: 'Mary Magdalene',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        content: 'Hallelujah! The angels in heaven are rejoicing!',
        createdAt: '3 hours ago',
        likes: 11
      }
    ]
  },
  {
    id: 'post_3',
    userId: 'user_4',
    userName: 'Brother John Miller',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    title: 'Morning Scripture Meditation: Psalm 91 Safety',
    category: 'Bible Study',
    content: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty. Let us rest under His divine wings today.',
    imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://www.youtube.com/watch?v=2g811Eo7K8U',
    createdAt: 'Yesterday',
    likesCount: 52,
    commentsCount: 7,
    sharesCount: 8,
    comments: []
  },
  {
    id: 'post_4',
    userId: 'user_5',
    userName: 'Sister Rebecca',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    title: 'Testimony: Provided a New Job After 6 Months',
    category: 'Testimony',
    content: 'God answered our family prayers! Just signed my offer letter today after months of waiting on the Lord. Never stop trusting His perfect timing.',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800',
    createdAt: '2 days ago',
    likesCount: 112,
    commentsCount: 24,
    sharesCount: 18,
    comments: []
  },
  {
    id: 'post_5',
    userId: 'user_1',
    userName: 'Brother Christian',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    title: 'Evening Reflection on Grace and Forgiveness',
    category: 'General Thought',
    content: 'When we realize how much Jesus forgave us on the Cross, forgiving others becomes an outpouring of gratitude rather than a heavy chore.',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800',
    createdAt: '3 days ago',
    likesCount: 45,
    commentsCount: 6,
    sharesCount: 3,
    comments: []
  }
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'grp_1',
    name: 'Daily Intercessory Prayer Warriors',
    description: 'A global band of believers gathering daily to intercede for families, nations, healings, and spiritual awakening.',
    coverImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1000',
    avatarImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=200',
    creatorId: 'user_3',
    creatorName: 'Pastor David',
    category: 'Prayer & Intercession',
    membersCount: 1240,
    isMember: true,
    createdAt: 'Jan 2026',
    rules: [
      'Keep prayers respectful and Christ-centered',
      'Maintain confidentiality regarding personal prayer requests',
      'No self-promotion or non-biblical debates'
    ]
  },
  {
    id: 'grp_2',
    name: 'Proverbs 31 Women of Faith',
    description: 'Encouraging Christian sisters in holy living, motherhood, marriage, devotionals, and virtuous leadership.',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1000',
    avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    creatorId: 'user_2',
    creatorName: 'Sarah Jenkins',
    category: 'Women Fellowship',
    membersCount: 850,
    isMember: false,
    createdAt: 'Feb 2026',
    rules: ['Encourage one another in biblical truth', 'Support sisters through prayer']
  },
  {
    id: 'grp_3',
    name: 'Iron Sharpens Iron - Men’s Fellowship',
    description: 'Men standing firm in faith, accountability, family priesthood, and servant leadership based on Proverbs 27:17.',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1000',
    avatarImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    creatorId: 'user_4',
    creatorName: 'Brother John Miller',
    category: 'Men Fellowship',
    membersCount: 620,
    isMember: true,
    createdAt: 'Mar 2026',
    rules: ['Brotherly accountability', 'Honesty in humility']
  },
  {
    id: 'grp_4',
    name: 'Kingdom Worship Musicians & Vocalists',
    description: 'Worship leaders, songwriters, instrumentalists, and psalmists sharing song arrangements and worship devotionals.',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1000',
    avatarImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200',
    creatorId: 'user_1',
    creatorName: 'Brother Christian',
    category: 'Worship Arts',
    membersCount: 410,
    isMember: true,
    createdAt: 'Apr 2026',
    rules: ['Glorify Jesus Christ through music', 'Share uplifting resources']
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt_1',
    title: 'Wednesday Night Global Prayer & Fasting Vigil',
    description: 'Join us online and in person for an hour of focused prayer for revival, divine protection, and spiritual warfare victory.',
    date: '2026-08-05',
    time: '7:30 PM CST',
    location: 'Grace Community Sanctuary & Online Live Stream',
    category: 'Prayer Meeting',
    coverImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800',
    creatorName: 'Pastor David',
    attendeesCount: 156,
    isAttending: 'Going'
  },
  {
    id: 'evt_2',
    title: 'Friday Night Night of Praise & Worship',
    description: 'An acoustic candlelit evening of acoustic worship, spontaneous praise, communion, and personal prayer ministry.',
    date: '2026-08-07',
    time: '8:00 PM CST',
    location: 'Living Water Chapel, Main Auditorium',
    category: 'Worship Night',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
    creatorName: 'Kingdom Worship Group',
    attendeesCount: 230,
    isAttending: 'Going'
  },
  {
    id: 'evt_3',
    title: 'Saturday Morning Community Food Pantry Outreach',
    description: 'Packing and serving free hot meals and grocery boxes for 200 local families in need, sharing the Gospel message.',
    date: '2026-08-08',
    time: '9:00 AM CST',
    location: 'Hope Center Fellowship Hall',
    category: 'Outreach',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    creatorName: 'Outreach Team',
    attendeesCount: 88,
    isAttending: 'Interested'
  },
  {
    id: 'evt_4',
    title: 'Book of Romans Verse-by-Verse Deep Dive',
    description: 'An interactive Bible study session examining the righteousness of God through faith in Christ.',
    date: '2026-08-11',
    time: '6:30 PM CST',
    location: 'Zoom Conference Link / Living Room B',
    category: 'Bible Study',
    coverImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    creatorName: 'Brother John Miller',
    attendeesCount: 94,
    isAttending: 'Going'
  }
];

export const INITIAL_SERMONS: Sermon[] = [
  {
    id: 'sermon_1',
    title: 'Don’t Give Up in the Dark',
    speaker: 'Steven Furtick • Elevation Church',
    date: 'August 2026',
    duration: '48 mins',
    category: 'Faith & Perseverance',
    thumbnailUrl: 'https://img.youtube.com/vi/gRxRFYUs6gY/hqdefault.jpg',
    youtubeId: 'gRxRFYUs6gY',
    videoUrl: 'https://www.youtube.com/watch?v=gRxRFYUs6gY',
    description: 'Anointed sermon by Steven Furtick from Elevation Church on trusting God when you can’t see the outcome and holding onto His promises.',
    scriptureRef: '2 Corinthians 5:7, Psalm 23:4'
  },
  {
    id: 'sermon_2',
    title: 'Praise & Anointed Worship Experience',
    speaker: 'Elevation Worship • Elevation Church',
    date: 'August 2026',
    duration: '52 mins',
    category: 'Praise & Worship',
    thumbnailUrl: 'https://img.youtube.com/vi/bV8M0pz80Sg/hqdefault.jpg',
    youtubeId: 'bV8M0pz80Sg',
    videoUrl: 'https://www.youtube.com/watch?v=bV8M0pz80Sg',
    description: 'Anointed praise & worship experience led by Elevation Worship in Christ Jesus.',
    scriptureRef: 'Psalm 150:1-6, Isaiah 61:3'
  },
  {
    id: 'sermon_3',
    title: 'Overcoming Your Obstacles Through Kingdom Authority',
    speaker: 'Dr. Tony Evans • Oak Cliff Bible Fellowship',
    date: 'August 2026',
    duration: '42 mins',
    category: 'Kingdom Authority',
    thumbnailUrl: 'https://img.youtube.com/vi/Rd0wx_zfMO0/hqdefault.jpg',
    youtubeId: 'Rd0wx_zfMO0',
    videoUrl: 'https://www.youtube.com/watch?v=Rd0wx_zfMO0',
    description: 'Dr. Tony Evans teaches on unleashing God’s kingdom authority in your personal life, marriage, and spiritual battles.',
    scriptureRef: 'Matthew 16:19, 1 John 4:4'
  },
  {
    id: 'sermon_4',
    title: 'The Character of God & Divine Generosity',
    speaker: 'Bible Project & Our Daily Bread',
    date: 'August 2026',
    duration: '30 mins',
    category: 'Expository Bible Study',
    thumbnailUrl: 'https://img.youtube.com/vi/kmCz4t1Sg9k/hqdefault.jpg',
    youtubeId: 'kmCz4t1Sg9k',
    videoUrl: 'https://www.youtube.com/watch?v=kmCz4t1Sg9k',
    description: 'Deep dive into the character of God and His divine grace throughout Holy Scripture.',
    scriptureRef: 'Exodus 34:6-7, Psalm 103:8-12'
  },
  {
    id: 'sermon_5',
    title: 'You Are Still Being Shaped for Purpose',
    speaker: 'Pastor Steven Furtick • 2819 Church',
    date: 'August 2026',
    duration: '40 mins',
    category: 'Purpose & Growth',
    thumbnailUrl: 'https://img.youtube.com/vi/T7EhKX3ThSA/hqdefault.jpg',
    youtubeId: 'T7EhKX3ThSA',
    videoUrl: 'https://www.youtube.com/watch?v=T7EhKX3ThSA',
    description: 'Inspiring message from 2819 Church on allowing God the Master Potter to shape your life.',
    scriptureRef: 'Jeremiah 18:1-6, Ephesians 2:10'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'pastor_david',
    participantName: 'Pastor David Evans',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    participantStatus: 'online',
    lastMessage: 'Grace and peace brother! How can I pray for you or study God\'s Word today?',
    lastMessageTime: '10:15 AM',
    unreadCount: 1,
    messages: [
      {
        id: 'm1',
        senderId: 'pastor_david',
        receiverId: 'user_1',
        content: 'Grace and peace be unto you! I am Pastor David Evans, Senior Pastor at Lights Out Baptist Church. How can I pray for you, study God\'s Word with you, or offer biblical guidance today?',
        timestamp: '10:15 AM',
        isRead: false
      }
    ]
  },
  {
    id: 'pastor_thomas',
    participantName: 'Pastor Thomas Wright',
    participantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    participantStatus: 'praying',
    lastMessage: 'Praise the Lord! Let us take your burdens to the Lord in prayer.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      {
        id: 'm2',
        senderId: 'pastor_thomas',
        receiverId: 'user_1',
        content: 'Praise the Lord! Pastor Thomas Wright here, Associate Pastor on duty for our Afternoon Prayer Watch. Whatever heavy burden or request is on your heart today, let us take it to the Lord Jesus Christ together in prayer.',
        timestamp: 'Yesterday 4:30 PM',
        isRead: true
      }
    ]
  },
  {
    id: 'pastor_mark',
    participantName: 'Pastor Mark Stevenson',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    participantStatus: 'online',
    lastMessage: 'God bless you tonight. Seeking peace or wisdom from God\'s Word?',
    lastMessageTime: '8:00 AM',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        senderId: 'pastor_mark',
        receiverId: 'user_1',
        content: 'God bless you tonight. I am Pastor Mark Stevenson, Discipleship Pastor on duty for the Night Shift watch. If you are seeking late-night spiritual peace, wisdom from God\'s Word, or earnest prayer before rest, I am right here with you.',
        timestamp: '8:00 AM',
        isRead: true
      }
    ]
  }
];

export const GOSPEL_TRACT = {
  title: 'The Good News of Salvation in Jesus Christ',
  subtitle: 'For God so loved the world, that he gave his only begotten Son...',
  keyVerse: 'John 3:16 (KJV)',
  steps: [
    {
      number: '1',
      heading: 'God Loves You & Has a Divine Purpose',
      text: 'God created you in His image to know Him personally and experience eternal life, joy, and peace in His presence.'
    },
    {
      number: '2',
      heading: 'Sin Separates Us From God',
      text: 'Romans 3:23 declares, "For all have sinned, and come short of the glory of God." Our disobedience creates a barrier between us and a holy God.'
    },
    {
      number: '3',
      heading: 'Jesus Paid the Full Price on the Cross',
      text: 'Romans 5:8 says, "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." Jesus died for our sins and rose victorious on the third day!'
    },
    {
      number: '4',
      heading: 'Receive Jesus Today by Faith',
      text: 'Romans 10:9 states, "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved."'
    }
  ],
  sinnersPrayer: 'Lord Jesus, I come to You today acknowledging my need for You. I believe You died on the Cross for my sins and rose from the dead. Forgive me of my sins, come into my heart, and be my Lord and Savior. Lead my life from this day forward. Amen.'
};

export const SAMPLE_KJV_BIBLE: Record<string, { [chapter: number]: { verse: number; text: string }[] }> = {
  'Genesis': {
    1: [
      { verse: 1, text: 'In the beginning God created the heaven and the earth.' },
      { verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
      { verse: 3, text: 'And God said, Let there be light: and there was light.' },
      { verse: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
      { verse: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' }
    ]
  },
  'Psalms': {
    23: [
      { verse: 1, text: 'The LORD is my shepherd; I shall not want.' },
      { verse: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
      { verse: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake.' },
      { verse: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
      { verse: 5, text: 'Thou me preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
      { verse: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' }
    ],
    91: [
      { verse: 1, text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
      { verse: 2, text: 'I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.' },
      { verse: 3, text: 'Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence.' },
      { verse: 4, text: 'He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.' },
      { verse: 5, text: 'Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;' },
      { verse: 6, text: 'Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.' }
    ]
  },
  'Proverbs': {
    3: [
      { verse: 5, text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
      { verse: 6, text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
      { verse: 7, text: 'Be not wise in thine own eyes: fear the LORD, and depart from evil.' }
    ]
  },
  'John': {
    1: [
      { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { verse: 2, text: 'The same was in the beginning with God.' },
      { verse: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
      { verse: 4, text: 'In him was life; and the life was the light of men.' },
      { verse: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' }
    ],
    3: [
      { verse: 16, text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
      { verse: 17, text: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.' },
      { verse: 18, text: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.' }
    ],
    14: [
      { verse: 6, text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' }
    ]
  },
  'Romans': {
    8: [
      { verse: 28, text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
      { verse: 31, text: 'What shall we then say to these things? If God be for us, who can be against us?' },
      { verse: 38, text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,' },
      { verse: 39, text: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.' }
    ],
    10: [
      { verse: 9, text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.' },
      { verse: 10, text: 'For with the heart man believeth unto righteousness; and with the mouth confession is made unto salvation.' },
      { verse: 13, text: 'For whosoever shall call upon the name of the Lord shall be saved.' }
    ]
  },
  'Philippians': {
    4: [
      { verse: 6, text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
      { verse: 7, text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.' },
      { verse: 13, text: 'I can do all things through Christ which strengtheneth me.' },
      { verse: 19, text: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.' }
    ]
  }
};

export const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
  'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];
