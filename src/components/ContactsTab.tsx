import React, { useState } from 'react';
import { User } from '../types';
import { 
  Users, 
  MessageSquare, 
  UserCheck, 
  UserPlus, 
  Search, 
  Shield, 
  Cross, 
  Mail, 
  Calendar, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface ContactsTabProps {
  currentUser: User;
  allBelievers: User[];
  onOpenDMs: (userId: string) => void;
  onSelectUser: (user: User) => void;
  onToggleFollow: (targetUserId: string, targetName: string, targetAvatar: string) => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  currentUser,
  allBelievers,
  onOpenDMs,
  onSelectUser,
  onToggleFollow
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'followers'>('all');

  // Ensure default church leadership / pastor contacts are present if database is fresh
  const defaultContacts: User[] = [
    {
      id: 'pastor_david',
      name: 'Pastor David Evans',
      email: 'pastor.david@lightsoutbaptist.org',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      role: 'Senior Pastor',
      bio: 'Shepherding God’s flock at Lights Out Baptist Church. Here for prayer, counsel, and holy scripture study.',
      favoriteVerse: 'Psalm 23:1 - The LORD is my shepherd; I shall not want.',
      joinedDate: 'August 2026',
      followersCount: 124,
      followingCount: 18,
      followingIds: [],
      followerIds: []
    },
    {
      id: 'evangelist_sarah',
      name: 'Evangelist Sarah Jenkins',
      email: 'sarah.j@lightsoutbaptist.org',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      role: 'Evangelist & Prayer Leader',
      bio: 'Fervent prayer warrior, leading women’s Bible studies and local outreach for the glory of Christ.',
      favoriteVerse: 'James 5:16 - The effectual fervent prayer of a righteous man availeth much.',
      joinedDate: 'August 2026',
      followersCount: 98,
      followingCount: 24,
      followingIds: [],
      followerIds: []
    },
    {
      id: 'deacon_michael',
      name: 'Deacon Michael Thomas',
      email: 'deacon.m@lightsoutbaptist.org',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      role: 'Deacon & Youth Ministry',
      bio: 'Serving the church body and discipling young believers in the KJV Holy Bible.',
      favoriteVerse: 'Romans 12:2 - Be ye transformed by the renewing of your mind.',
      joinedDate: 'August 2026',
      followersCount: 75,
      followingCount: 30,
      followingIds: [],
      followerIds: []
    }
  ];

  // Merge registered Firestore believers + defaults (filtering out current user and duplicate emails)
  const currentUserEmail = currentUser.email?.trim().toLowerCase();
  const contactMap = new Map<string, User>();

  defaultContacts.forEach(u => {
    const uEmail = u.email?.trim().toLowerCase();
    if (!currentUserEmail || uEmail !== currentUserEmail) {
      contactMap.set(u.id, u);
    }
  });

  allBelievers.forEach(u => {
    // Exclude if same user ID
    if (u.id === currentUser.id) return;

    const uEmail = u.email?.trim().toLowerCase();

    // Exclude if email matches current user's email address
    if (currentUserEmail && uEmail && uEmail === currentUserEmail) {
      return;
    }

    // Deduplicate by email if present
    if (uEmail) {
      const existing = Array.from(contactMap.values()).find(
        c => c.email && c.email.trim().toLowerCase() === uEmail
      );
      if (existing) return;
    }

    contactMap.set(u.id, u);
  });

  const contactsList = Array.from(contactMap.values());

  const followingSet = new Set(currentUser.followingIds || []);
  const followerSet = new Set(currentUser.followerIds || []);

  const filteredContacts = contactsList.filter(c => {
    // Filter tab
    if (activeFilter === 'following' && !followingSet.has(c.id)) return false;
    if (activeFilter === 'followers' && !followerSet.has(c.id)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchRole = c.role?.toLowerCase().includes(q);
      const matchBio = c.bio?.toLowerCase().includes(q);
      return matchName || matchRole || matchBio;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border border-amber-400/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#fffbe6] font-serif">Believer Directory & Fellowship Contacts</h2>
            <p className="text-xs text-blue-200">Connect with pastors, leaders, and brothers and sisters in Christ</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-950/80 px-3 py-1.5 rounded-xl border border-amber-400/30 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{contactsList.length} Connected Believers</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#0b132b] border border-amber-400/30 p-3.5 sm:p-4 rounded-2xl shadow-xl space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search believers by name, ministry role, or bio..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] placeholder:text-blue-300/50 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-amber-300 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-purple-900/30">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-950 text-slate-300 border-purple-900/50 hover:bg-purple-900/40'
            }`}
          >
            All Contacts ({contactsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('following')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeFilter === 'following'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-950 text-slate-300 border-purple-900/50 hover:bg-purple-900/40'
            }`}
          >
            Following ({currentUser.followingIds?.length || 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('followers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeFilter === 'followers'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-950 text-slate-300 border-purple-900/50 hover:bg-purple-900/40'
            }`}
          >
            Followers ({currentUser.followerIds?.length || 0})
          </button>
        </div>
      </div>

      {/* Believers Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => {
            const isFollowing = followingSet.has(contact.id);

            return (
              <div
                key={contact.id}
                className="bg-slate-900 border border-purple-500/30 hover:border-amber-400/60 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01]"
              >
                {/* Contact Card Top: Avatar & Meta */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white hover:text-amber-300 transition-colors font-serif leading-snug">
                          {contact.name}
                        </h3>
                        <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                          {contact.role || 'Believer Member'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleFollow(contact.id, contact.name, contact.avatar)}
                      className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                        isFollowing
                          ? 'bg-blue-900/80 text-amber-300 border border-amber-400/40'
                          : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow'
                      }`}
                      title={isFollowing ? 'Following' : 'Follow Believer'}
                    >
                      {isFollowing ? (
                        <UserCheck className="w-4 h-4 text-amber-300" />
                      ) : (
                        <UserPlus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {contact.bio && (
                    <p className="text-xs text-blue-100/90 line-clamp-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-purple-900/30">
                      "{contact.bio}"
                    </p>
                  )}

                  {contact.favoriteVerse && (
                    <p className="text-[11px] text-amber-300/90 italic line-clamp-1 font-serif">
                      ✝️ {contact.favoriteVerse}
                    </p>
                  )}
                </div>

                {/* Contact Card Action Buttons */}
                <div className="pt-3 border-t border-purple-900/40 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDMs(contact.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Direct Message</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectUser(contact)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="View Profile Wall"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-purple-500/20 rounded-2xl p-6 space-y-2">
            <Users className="w-10 h-10 text-amber-400/60 mx-auto" />
            <h3 className="text-base font-bold text-white">No Believers Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search criteria or switch to "All Contacts" to discover fellow believers in the church network.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
