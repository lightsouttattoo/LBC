import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Shield, Check, UserPlus, X, Image as ImageIcon, Send, MessageSquare, Heart } from 'lucide-react';
import { Group, User, Post } from '../types';
import { MediaInputPicker } from './MediaInputPicker';

interface GroupsTabProps {
  user: User;
  groups: Group[];
  onCreateGroup: (newGroup: Group) => void;
  onToggleJoinGroup: (groupId: string) => void;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({
  user,
  groups,
  onCreateGroup,
  onToggleJoinGroup
}) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for creating a group
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Prayer & Intercession');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1000');

  // Local state for group wall post
  const [groupWallInput, setGroupWallInput] = useState('');
  const [groupWallMedia, setGroupWallMedia] = useState<{ mediaUrl?: string; videoUrl?: string; youtubeId?: string } | null>(null);

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    const newGrp: Group = {
      id: `grp_${Date.now()}`,
      name,
      description,
      category,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1000',
      avatarImage: user.avatar,
      creatorId: user.id,
      creatorName: user.name,
      membersCount: 1,
      isMember: true,
      createdAt: 'Just now',
      rules: ['Glorify God in all discussions', 'Respect fellow believers']
    };

    onCreateGroup(newGrp);
    setShowCreateModal(false);
    setName('');
    setDescription('');
  };

  const handlePostToGroupWall = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!groupWallInput.trim() && !groupWallMedia) || !selectedGroup) return;

    const newWallPost: Post = {
      id: `wall_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      title: 'Group Discussion Post',
      category: 'General Thought',
      content: groupWallInput,
      imageUrl: groupWallMedia?.mediaUrl,
      videoUrl: groupWallMedia?.videoUrl,
      youtubeId: groupWallMedia?.youtubeId,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      comments: []
    };

    const updatedGroup = {
      ...selectedGroup,
      wallPosts: [newWallPost, ...(selectedGroup.wallPosts || [])]
    };

    setSelectedGroup(updatedGroup);
    setGroupWallInput('');
    setGroupWallMedia(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-slate-100">
      {/* Header & Create Group CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-serif">Christian Fellowship Groups</h2>
            <p className="text-xs text-purple-200/70">Join prayer circles, Bible study groups, and outreach teams</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Group
        </button>
      </div>

      {/* Groups Grid View (Alternating Section Flow: Carousel -> Vertical -> Carousel...) */}
      {!selectedGroup ? (
        <div className="space-y-8">
          {(() => {
            const groupSections: { type: 'carousel' | 'vertical'; title: string; items: Group[] }[] = [];
            let gIdx = 0;
            let secIdx = 0;

            while (gIdx < groups.length) {
              const chunk = groups.slice(gIdx, gIdx + 3);
              const isCarousel = secIdx % 2 === 0;

              let sectionTitle = '';
              if (isCarousel) {
                sectionTitle = secIdx === 0 ? 'Featured Believer Groups' : 'Active Local Fellowship Circles';
              } else {
                sectionTitle = secIdx === 1 ? 'Community Outreach & Prayer Teams' : 'More Christian Groups';
              }

              groupSections.push({
                type: isCarousel ? 'carousel' : 'vertical',
                title: sectionTitle,
                items: chunk
              });

              gIdx += 3;
              secIdx++;
            }

            return groupSections.map((sec, sIdx) => {
              if (sec.type === 'carousel') {
                return (
                  <div key={`grp_sec_car_${sIdx}`} className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 tracking-wider uppercase px-1">
                      <span className="flex items-center gap-1.5 font-serif text-amber-300">
                        <Users className="w-4 h-4 text-amber-400" /> {sec.title}
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-normal">Swipe Horizontally →</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                      {sec.items.map(grp => (
                        <div
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp)}
                          className="snap-center flex-shrink-0 w-72 sm:w-80 bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group cursor-pointer hover:scale-[1.01]"
                        >
                          <div className="relative h-32 overflow-hidden bg-slate-950">
                            <img
                              src={grp.coverImage}
                              alt={grp.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                              {grp.category}
                            </span>
                          </div>

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-base text-[#fffbe6] font-serif group-hover:text-amber-300 transition-colors">
                                {grp.name}
                              </h3>
                              <p className="text-xs text-blue-100/80 line-clamp-2 leading-relaxed mt-1">
                                {grp.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-blue-200">
                                <Users className="w-3.5 h-3.5 text-amber-400" />
                                <span>{grp.membersCount} Members</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onToggleJoinGroup(grp.id)}
                                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    grp.isMember
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow font-extrabold'
                                  }`}
                                >
                                  {grp.isMember ? 'Joined ✓' : '+ Join'}
                                </button>

                                <button
                                  onClick={() => setSelectedGroup(grp)}
                                  className="py-1.5 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-100 text-xs font-semibold border border-amber-400/30 cursor-pointer"
                                >
                                  View Wall
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={`grp_sec_vert_${sIdx}`} className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider uppercase px-1">
                      <span className="font-serif text-amber-300">{sec.title}</span>
                      <span className="text-[10px] text-blue-200 font-normal">{sec.items.length} Groups Vertical</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sec.items.map(grp => (
                        <div
                          key={grp.id}
                          onClick={() => setSelectedGroup(grp)}
                          className="bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group cursor-pointer hover:scale-[1.01]"
                        >
                          <div className="relative h-32 overflow-hidden bg-slate-950">
                            <img
                              src={grp.coverImage}
                              alt={grp.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                              {grp.category}
                            </span>
                          </div>

                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-base text-[#fffbe6] font-serif group-hover:text-amber-300 transition-colors">
                                {grp.name}
                              </h3>
                              <p className="text-xs text-blue-100/80 line-clamp-2 leading-relaxed mt-1">
                                {grp.description}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 text-blue-200">
                                <Users className="w-4 h-4 text-amber-400" />
                                <span>{grp.membersCount} Believers</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onToggleJoinGroup(grp.id)}
                                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    grp.isMember
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow'
                                  }`}
                                >
                                  {grp.isMember ? 'Joined ✓' : '+ Join Group'}
                                </button>

                                <button
                                  onClick={() => setSelectedGroup(grp)}
                                  className="py-1.5 px-3 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-100 text-xs font-semibold border border-amber-400/30 cursor-pointer"
                                >
                                  View Wall
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            });
          })()}
        </div>
      ) : (
        /* SINGLE GROUP PAGE VIEW (Facebook Group Page Style) */
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGroup(null)}
            className="py-1.5 px-3 rounded-xl bg-slate-900 border border-purple-800/40 text-xs font-semibold text-purple-300 hover:text-white transition-colors"
          >
            ← Back to All Groups
          </button>

          {/* Group Header Hero */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-44 sm:h-56 relative bg-slate-950">
              <img
                src={selectedGroup.coverImage}
                alt={selectedGroup.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                    {selectedGroup.category}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-white mt-1">{selectedGroup.name}</h1>
                  <p className="text-xs text-slate-300 mt-0.5">Admin: {selectedGroup.creatorName} • {selectedGroup.membersCount} Members</p>
                </div>

                <button
                  onClick={() => onToggleJoinGroup(selectedGroup.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                    selectedGroup.isMember
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  }`}
                >
                  {selectedGroup.isMember ? 'Joined Member' : 'Request to Join Group'}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{selectedGroup.description}</p>

              {/* Group Wall Posting Box */}
              {selectedGroup.isMember && (
                <form onSubmit={handlePostToGroupWall} className="bg-slate-950 border border-purple-900/50 p-3 sm:p-4 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-amber-300 block">Post to Group Wall</span>
                  <textarea
                    rows={2}
                    placeholder="Share a message, scripture, or prayer with group members..."
                    value={groupWallInput}
                    onChange={(e) => setGroupWallInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-purple-900/40 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  
                  <MediaInputPicker
                    label="Attach Photo or Video (Device Upload, Camera, YouTube, URL)"
                    value={groupWallMedia?.mediaUrl || groupWallMedia?.videoUrl}
                    youtubeId={groupWallMedia?.youtubeId}
                    acceptType="both"
                    onChange={(data) => {
                      if (data.mediaUrl || data.videoUrl || data.youtubeId) {
                        setGroupWallMedia({
                          mediaUrl: data.mediaUrl,
                          videoUrl: data.videoUrl,
                          youtubeId: data.youtubeId
                        });
                      } else {
                        setGroupWallMedia(null);
                      }
                    }}
                  />

                  <div className="flex justify-end pt-1">
                    <button 
                      type="submit" 
                      disabled={!groupWallInput.trim() && !groupWallMedia}
                      className="py-2 px-5 rounded-lg bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                    >
                      Post to Wall
                    </button>
                  </div>
                </form>
              )}

              {/* Group Wall Feed */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Group Discussion Wall</h3>
                {selectedGroup.wallPosts && selectedGroup.wallPosts.length > 0 ? (
                  selectedGroup.wallPosts.map(p => (
                    <div key={p.id} className="p-3.5 bg-slate-950 border border-purple-900/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={p.userAvatar} alt={p.userName} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
                        <span className="text-xs font-bold text-white">{p.userName}</span>
                        <span className="text-[10px] text-slate-500">{p.createdAt}</span>
                      </div>

                      {p.content && <p className="text-xs text-slate-200 leading-relaxed">{p.content}</p>}

                      {p.youtubeId ? (
                        <div className="rounded-xl overflow-hidden border border-purple-900/40 bg-slate-900 mt-2">
                          <iframe
                            src={`https://www.youtube.com/embed/${p.youtubeId}`}
                            title="YouTube video"
                            className="w-full aspect-video rounded-xl"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : p.videoUrl ? (
                        <div className="rounded-xl overflow-hidden border border-purple-900/40 bg-slate-900 mt-2">
                          <video src={p.videoUrl} controls className="w-full max-h-60 rounded-xl object-contain" />
                        </div>
                      ) : p.imageUrl ? (
                        <div className="rounded-xl overflow-hidden border border-purple-900/40 bg-slate-900 mt-2">
                          <img src={p.imageUrl} alt="Group post attachment" referrerPolicy="no-referrer" className="w-full max-h-60 object-cover rounded-xl" />
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No posts on group wall yet. Be the first to start a conversation!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[90vh] my-auto bg-[#0b132b] border border-amber-400/40 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-amber-400/30 pb-3 mb-3 flex-shrink-0">
                <h3 className="font-bold font-serif text-lg text-[#fffbe6]">Create New Christian Group</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroupSubmit} className="space-y-4 overflow-y-auto pr-1.5 flex-1 scrollbar-thin">
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Group Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Proverbs 31 Women / Morning Prayer Circle..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Group Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    <option value="Prayer & Intercession">Prayer & Intercession</option>
                    <option value="Women Fellowship">Women Fellowship</option>
                    <option value="Men Fellowship">Men Fellowship</option>
                    <option value="Worship Arts">Worship Arts</option>
                    <option value="Youth & Young Adults">Youth & Young Adults</option>
                  </select>
                </div>

                <div>
                  <MediaInputPicker
                    label="Group Banner / Cover Image (Phone Upload / URL)"
                    value={coverImage}
                    acceptType="image"
                    onChange={(data) => {
                      if (data.mediaUrl) setCoverImage(data.mediaUrl);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">Description & Mission Statement</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the purpose of this group..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Create & Launch Group Page
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
