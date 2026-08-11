import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Search, CheckCheck, UserPlus, Upload, Image as ImageIcon, 
  MessageSquare, Sparkles, Check, PhoneCall, Video, Users, FileText, Cross, ArrowLeft
} from 'lucide-react';
import { Conversation, User, DirectMessage } from '../types';
import { subscribeToAllUsers, subscribeToDirectMessages, sendDirectMessageToFirestore } from '../lib/firebase';

interface DMDrawerProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  initialTargetUserId?: string;
  initialPastorId?: string; // backwards compatibility
}

interface BelieverContact {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: 'online' | 'praying' | 'in fellowship' | 'offline';
  bio?: string;
  phone?: string;
  favoriteVerse?: string;
}

const DEFAULT_COMMUNITY_BELIEVERS: BelieverContact[] = [
  {
    id: 'user_david',
    name: 'Pastor David Evans',
    email: 'david.pastor@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'Senior Pastor',
    status: 'online',
    bio: 'Shepharding God’s flock at Lights Out Baptist Church. Here for prayer & counsel.'
  },
  {
    id: 'user_grace',
    name: 'Sister Grace Believer',
    email: 'light.believer@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'Worship Leader',
    status: 'online',
    bio: 'Singing praises to the King! Always down to pray and encourage.'
  },
  {
    id: 'user_john',
    name: 'Brother John Miller',
    email: 'john.miller@livingonaprayer.app',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    role: 'Bible Study Leader',
    status: 'praying',
    bio: 'Passionate about KJV Bible study and fellowship.'
  },
  {
    id: 'user_rebecca',
    name: 'Sister Rebecca Vance',
    email: 'rebecca.vance@livingonaprayer.app',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    role: 'Prayer Warrior',
    status: 'in fellowship',
    bio: 'Interceding for our community daily.'
  },
  {
    id: 'user_samuel',
    name: 'Deacon Samuel Vance',
    email: 'samuel.deacon@livingonaprayer.app',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    role: 'Deacon',
    status: 'online',
    bio: 'Serving the saints with joy and thanksgiving.'
  },
  {
    id: 'user_sarah',
    name: 'Evangelist Sarah Jenkins',
    email: 'sarah.jenkins@livingonaprayer.app',
    avatar: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
    role: 'Evangelist',
    status: 'online',
    bio: 'Sharing the Gospel of Jesus Christ everywhere.'
  }
];

export const DMDrawer: React.FC<DMDrawerProps> = ({ 
  isOpen, 
  user, 
  onClose, 
  initialTargetUserId,
  initialPastorId 
}) => {
  const targetIdToUse = initialTargetUserId || initialPastorId;

  // 1. Saved contacts map (stored locally + imported contacts)
  const [contacts, setContacts] = useState<BelieverContact[]>(() => {
    try {
      const saved = localStorage.getItem('lob_imported_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const ids = new Set(parsed.map(c => c.id));
          const combined = [...parsed];
          for (const d of DEFAULT_COMMUNITY_BELIEVERS) {
            if (!ids.has(d.id)) combined.push(d);
          }
          return combined;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COMMUNITY_BELIEVERS;
  });

  // 2. Persistent Conversations state
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('lob_community_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }

    // Default initial seed conversations with Pastor David & Sister Grace
    return [
      {
        id: 'user_david',
        participantName: 'Pastor David Evans',
        participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        participantStatus: 'online',
        lastMessage: 'Grace and peace brother! Glad to fellowship with you.',
        lastMessageTime: '10:15 AM',
        unreadCount: 0,
        messages: [
          {
            id: 'm_init_david',
            senderId: 'user_david',
            receiverId: user.id,
            content: 'Grace and peace be unto you! Welcome to our fellowship. How can I stand with you in prayer today?',
            timestamp: '10:15 AM',
            isRead: true
          }
        ]
      },
      {
        id: 'user_grace',
        participantName: 'Sister Grace Believer',
        participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        participantStatus: 'online',
        lastMessage: 'Amen! God is so good to us.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        messages: [
          {
            id: 'm_init_grace',
            senderId: 'user_grace',
            receiverId: user.id,
            content: 'Amen! God is so good to us. Let me know if you ever want to study scripture together or share a praise report!',
            timestamp: 'Yesterday',
            isRead: true
          }
        ]
      }
    ];
  });

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('lob_community_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  // Active chat state
  const [activeConvId, setActiveConvId] = useState<string>('user_david');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('chat');

  // Modals inside DM drawer
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [pastedContactsText, setPastedContactsText] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time Firestore users subscription
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((dbUsers) => {
      if (!dbUsers || dbUsers.length === 0) return;
      setContacts(prev => {
        const currentUserEmail = user.email?.trim().toLowerCase();
        const contactMap = new Map<string, BelieverContact>();

        // Add existing contacts first (filtering out current user's email)
        prev.forEach(c => {
          const cEmail = c.email?.trim().toLowerCase();
          if (!currentUserEmail || cEmail !== currentUserEmail) {
            contactMap.set(c.id, c);
          }
        });

        // Merge dbUsers
        dbUsers.forEach(u => {
          if (u.id && u.id !== user.id) {
            const uEmail = u.email?.trim().toLowerCase();

            // Exclude if email matches current user's email address
            if (currentUserEmail && uEmail && uEmail === currentUserEmail) {
              return;
            }

            // Deduplicate by email
            if (uEmail) {
              const existing = Array.from(contactMap.values()).find(
                c => c.email && c.email.trim().toLowerCase() === uEmail
              );
              if (existing) return;
            }

            contactMap.set(u.id, {
              id: u.id,
              name: u.name || 'Believer',
              email: u.email || '',
              avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
              role: u.role || 'Believer Member',
              status: 'online',
              bio: u.bio,
              favoriteVerse: u.favoriteVerse
            });
          }
        });
        return Array.from(contactMap.values());
      });
    });
    return () => unsubscribe();
  }, [user.id]);

  // Real-time Firestore Direct Messages subscription for active conversation
  useEffect(() => {
    if (!isOpen || !activeConvId || !user.id) return;

    const unsubscribe = subscribeToDirectMessages(user.id, activeConvId, (realtimeMsgs) => {
      if (!realtimeMsgs) return;

      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          // Merge real-time messages with local messages without duplicates
          const uniqueMsgs: DirectMessage[] = [];
          const seenKeys = new Set<string>();

          // Priority 1: Realtime messages from Firestore
          realtimeMsgs.forEach(m => {
            const key = `${m.senderId}_${m.receiverId}_${m.content.trim()}`;
            seenKeys.add(key);
            uniqueMsgs.push(m);
          });

          // Priority 2: Local optimistic messages not yet in Firestore snapshot
          (c.messages || []).forEach(m => {
            const key = `${m.senderId}_${m.receiverId}_${m.content.trim()}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueMsgs.push(m);
            }
          });

          const lastMsg = uniqueMsgs[uniqueMsgs.length - 1];

          return {
            ...c,
            lastMessage: lastMsg?.content || c.lastMessage,
            lastMessageTime: lastMsg?.timestamp || c.lastMessageTime,
            messages: uniqueMsgs
          };
        }
        return c;
      }));
    });

    return () => unsubscribe();
  }, [isOpen, activeConvId, user.id]);

  // Handle target user id passed in props
  useEffect(() => {
    if (isOpen && targetIdToUse) {
      startChatWithBeliever(targetIdToUse);
    }
  }, [isOpen, targetIdToUse]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeConvId, conversations]);

  // Function to select or start a chat with a specific contact/believer ID
  const startChatWithBeliever = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId) || {
      id: contactId,
      name: 'Fellow Believer',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'Believer',
      status: 'online' as const
    };

    // Check if conversation already exists
    const existing = conversations.find(c => c.id === contactId);
    if (!existing) {
      const newConv: Conversation = {
        id: contact.id,
        participantName: contact.name,
        participantAvatar: contact.avatar,
        participantStatus: (contact.status === 'praying' ? 'praying' : contact.status === 'offline' ? 'offline' : 'online'),
        lastMessage: `Connected in fellowship with ${contact.name}`,
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m_start_${Date.now()}`,
            senderId: contact.id,
            receiverId: user.id,
            content: `God bless you! Connected with ${contact.name}. Send a message to start fellowshipping!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: true
          }
        ]
      };
      setConversations(prev => [newConv, ...prev]);
    }

    setActiveConvId(contactId);
    setMobileView('chat');
    setShowNewChatModal(false);
  };

  // Active conversation object
  const activeConv: Conversation = conversations.find(c => c.id === activeConvId) || conversations[0] || {
    id: 'user_david',
    participantName: 'Pastor David Evans',
    participantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    participantStatus: 'online',
    lastMessage: '',
    lastMessageTime: 'Just now',
    unreadCount: 0,
    messages: []
  };

  const activeContact = contacts.find(c => c.id === activeConv.id);

  // Send Direct Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !activeConvId) return;

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let finalContent = inputText.trim();
    if (selectedImage) {
      finalContent = selectedImage + (inputText.trim() ? `\n\n${inputText.trim()}` : '');
    }

    const newMsg: DirectMessage = {
      id: `m_${Date.now()}`,
      senderId: user.id,
      receiverId: activeConv.id,
      content: finalContent,
      timestamp: timestampStr,
      isRead: true
    };

    // Save to Firestore real-time collection
    sendDirectMessageToFirestore(newMsg);

    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        const alreadyHas = (c.messages || []).some(m =>
          m.content === finalContent && m.senderId === user.id && m.receiverId === activeConv.id
        );
        if (alreadyHas) return c;

        return {
          ...c,
          lastMessage: selectedImage ? '📷 Attached Photo' : inputText.trim(),
          lastMessageTime: 'Just now',
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    }));

    setInputText('');
    setSelectedImage(null);
  };

  // Handle direct photo attachment upload from device
  const handleImageAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setSelectedImage(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle importing contacts (from CSV/VCF or pasted text)
  const handleImportContactsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedContactsText.trim()) return;

    // Parse lines or comma separated entries
    const lines = pastedContactsText.split(/[\n,;]+/);
    const newAdded: BelieverContact[] = [];

    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (!clean) return;

      let name = clean;
      let email = '';

      if (clean.includes('<') && clean.includes('>')) {
        name = clean.split('<')[0].trim();
        email = clean.split('<')[1].replace('>', '').trim();
      } else if (clean.includes('@')) {
        email = clean;
        name = clean.split('@')[0].replace(/[._]/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
      }

      const newContact: BelieverContact = {
        id: `contact_imp_${Date.now()}_${idx}`,
        name: name || `Believer ${idx + 1}`,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@fellowship.app`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        role: 'Community Member',
        status: idx % 2 === 0 ? 'online' : 'praying',
        bio: 'Newly imported community contact.'
      };

      newAdded.push(newContact);
    });

    if (newAdded.length > 0) {
      const updatedList = [...newAdded, ...contacts];
      setContacts(updatedList);
      try {
        localStorage.setItem('lob_imported_contacts', JSON.stringify(updatedList));
      } catch (err) {
        console.error(err);
      }

      setImportSuccessMsg(`Successfully imported ${newAdded.length} new believers!`);
      setPastedContactsText('');
      setTimeout(() => {
        setImportSuccessMsg('');
        setShowImportModal(false);
      }, 2000);
    }
  };

  // Filtered contacts by search query
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full md:max-w-3xl lg:max-w-4xl h-full h-[100dvh] max-h-screen bg-slate-900 border-l border-purple-500/30 text-slate-100 flex flex-col shadow-2xl relative overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif font-bold text-sm sm:text-base text-white flex items-center gap-2 truncate">
                  Believers Fellowship Chat
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                    Live
                  </span>
                </h2>
                <p className="text-[11px] text-purple-200/80 truncate">Direct messaging among community members</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* DM Body Layout: Left Contact Directory / Conversations & Right Active Chat */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
            
            {/* Directory Sidebar / Conversation Selector */}
            <div className={`w-full md:w-72 bg-slate-950/90 border-r border-purple-900/40 flex flex-col shrink-0 h-full min-h-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
              {/* Search & Actions Bar */}
              <div className="p-3 border-b border-purple-900/30 space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search believers..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center gap-1 shadow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Find Believer</span>
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                    title="Import Contacts"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 scrollbar-thin scrollbar-thumb-purple-900">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 px-2 py-1 flex items-center justify-between">
                  <span>Active Chats ({conversations.length})</span>
                  <Users className="w-3 h-3 text-purple-400" />
                </div>

                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  const contactInfo = contacts.find(c => c.id === conv.id);
                  const status = contactInfo?.status || 'online';

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setMobileView('chat');
                      }}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-950/90 to-slate-800 border border-amber-400/60 shadow-lg'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-amber-400/60"
                        />
                        {/* Status Badge */}
                        <span 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                            status === 'online'
                              ? 'bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse'
                              : status === 'praying'
                              ? 'bg-amber-400 ring-2 ring-amber-400/30'
                              : status === 'in fellowship'
                              ? 'bg-purple-400'
                              : 'bg-slate-500'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-white truncate">{conv.participantName}</span>
                          <span className="text-[9px] text-slate-400 shrink-0">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] text-purple-200/70 truncate">{conv.lastMessage}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Direct Messaging Main Panel */}
            <div className={`flex-1 flex flex-col bg-slate-900 h-full min-h-0 overflow-hidden ${mobileView === 'contacts' ? 'hidden md:flex' : 'flex'}`}>
              {/* Active Participant Header */}
              <div className="p-3 bg-slate-950 border-b border-purple-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mobile Back Button to Contacts List */}
                  <button
                    onClick={() => setMobileView('contacts')}
                    className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-purple-900/40 flex items-center gap-1 text-xs font-bold shrink-0 transition-colors"
                    title="Back to Contacts"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={activeConv.participantAvatar}
                      alt={activeConv.participantName}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-400"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-slate-950 ${
                        activeContact?.status === 'online' || activeConv.participantStatus === 'online'
                          ? 'bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse'
                          : activeContact?.status === 'praying'
                          ? 'bg-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-white truncate font-serif">{activeConv.participantName}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-300">
                      <span className="bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/40 font-semibold text-amber-300 truncate">
                        {activeContact?.role || 'Believer'}
                      </span>
                      <span className="capitalize font-bold text-emerald-400 truncate hidden sm:inline">
                        • {activeContact?.status || 'Online'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button 
                    onClick={() => alert(`Starting audio fellowship call with ${activeConv.participantName}...`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-purple-900/40 transition-colors"
                    title="Audio Prayer Call"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 min-h-0 scrollbar-thin scrollbar-thumb-purple-900">
                {(activeConv.messages || []).map((msg) => {
                  const isUserMsg = msg.senderId === user.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUserMsg ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-lg ${
                          isUserMsg
                            ? 'bg-gradient-to-r from-purple-700 to-amber-600 text-slate-950 font-medium rounded-tr-none'
                            : 'bg-slate-800 border border-purple-900/50 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {/* If message includes uploaded image data URL */}
                        {msg.content.includes('data:image/') ? (
                          <div className="space-y-2">
                            <img
                              src={msg.content.split('\n\n')[0]}
                              alt="Attachment"
                              className="rounded-xl max-h-48 w-full object-cover border border-purple-900/40"
                            />
                            {msg.content.split('\n\n')[1] && (
                              <p>{msg.content.split('\n\n')[1]}</p>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 px-1">
                        <span>{msg.timestamp}</span>
                        {isUserMsg && <CheckCheck className="w-3 h-3 text-amber-400" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Media Preview before send */}
              {selectedImage && (
                <div className="p-2 bg-slate-950 border-t border-purple-900/40 flex items-center justify-between text-xs text-amber-300 shrink-0">
                  <div className="flex items-center gap-2">
                    <img src={selectedImage} alt="Preview" className="w-8 h-8 rounded object-cover border border-amber-400" />
                    <span>Photo Attached</span>
                  </div>
                  <button onClick={() => setSelectedImage(null)} className="text-red-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-2.5 sm:p-3 bg-slate-950 border-t border-purple-900/40 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageAttachment}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-purple-900/40 transition-colors shrink-0"
                  title="Attach Photo or Device Media"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeConv.participantName}...`}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedImage}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* MODAL 1: FIND / SEARCH ALL BELIEVERS TO CHAT */}
          <AnimatePresence>
            {showNewChatModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                    <h3 className="font-bold text-base font-serif text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-amber-400" />
                      Find & Connect with Believers
                    </h3>
                    <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, role, or email..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-900">
                    {filteredContacts.map(c => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-purple-900/30 hover:border-amber-400/50 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border border-amber-400" />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">{c.name}</h4>
                            <p className="text-[10px] text-purple-300 truncate">{c.role} • {c.email}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => startChatWithBeliever(c.id)}
                          className="py-1 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-all"
                        >
                          Message
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* MODAL 2: UPLOAD / IMPORT CONTACTS */}
          <AnimatePresence>
            {showImportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                    <h3 className="font-bold text-base font-serif text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-400" />
                      Import Believer Contacts
                    </h3>
                    <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {importSuccessMsg ? (
                    <div className="p-4 bg-emerald-950 border border-emerald-500/50 rounded-2xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2">
                      <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                      {importSuccessMsg}
                    </div>
                  ) : (
                    <form onSubmit={handleImportContactsSubmit} className="space-y-3">
                      <p className="text-xs text-purple-200/80 leading-relaxed">
                        Paste email addresses, names, or phone numbers below (one per line or separated by commas) to import contacts to your DM directory:
                      </p>

                      <textarea
                        rows={4}
                        value={pastedContactsText}
                        onChange={(e) => setPastedContactsText(e.target.value)}
                        placeholder={`Brother Mark <mark@church.org>\nSister Martha <martha@prayer.org>\n713-555-0199`}
                        className="w-full p-3 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        Import Believer Contacts
                      </button>
                    </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
