import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Post, Category } from '../types';
import { 
  Edit3, Bookmark, Heart, MessageSquare, Image as ImageIcon, Camera, Check, X, 
  Shield, Cross, Sparkles, UserPlus, Share2, Plus, Send, Copy, Trash2, AlertTriangle
} from 'lucide-react';
import { MediaInputPicker } from './MediaInputPicker';

interface ProfileWallProps {
  user: User;
  currentUser?: User;
  userPosts: Post[];
  onUpdateProfile: (updatedUser: User) => void;
  onLikePost: (postId: string) => void;
  onAddPost?: (newPost: Post) => void;
  onEditPost?: (postId: string, updatedFields: Partial<Post>) => void;
  onDeletePost?: (postId: string) => void;
  onOpenDMs?: (targetUserId: string) => void;
  onToggleFollow?: (targetUserId: string, targetUserName: string, targetAvatar: string) => void;
}

const CATEGORIES: Category[] = [
  'Prayer Request',
  'Praise Report',
  'Testimony',
  'Bible Study',
  'General Thought',
  'Urgent Prayer'
];

export const ProfileWall: React.FC<ProfileWallProps> = ({
  user,
  currentUser,
  userPosts,
  onUpdateProfile,
  onLikePost,
  onAddPost,
  onEditPost,
  onDeletePost,
  onOpenDMs,
  onToggleFollow
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activePostModal, setActivePostModal] = useState<Post | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Edit & Delete Post State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Prayer Request');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editYoutubeId, setEditYoutubeId] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.role?.toLowerCase().includes('admin') || user?.role?.toLowerCase().includes('leader') || user?.role?.toLowerCase().includes('pastor'));

  const canModifyPost = (p: Post) => {
    if (!user) return false;
    const isOwner = p.userId === user.id || (p.userName && user.name && p.userName.trim().toLowerCase() === user.name.trim().toLowerCase());
    return isOwner || isAdmin;
  };

  const handleOpenEditModal = (p: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPost(p);
    setEditTitle(p.title);
    setEditCategory(p.category);
    setEditContent(p.content);
    setEditImageUrl(p.imageUrl || '');
    setEditVideoUrl(p.videoUrl || '');
    setEditYoutubeId(p.youtubeId || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim() || !editContent.trim()) return;

    if (onEditPost) {
      onEditPost(editingPost.id, {
        title: editTitle.trim(),
        category: editCategory,
        content: editContent.trim(),
        imageUrl: editImageUrl || undefined,
        videoUrl: editVideoUrl || undefined,
        youtubeId: editYoutubeId || undefined
      });
    }

    setEditingPost(null);
  };

  const handleConfirmDelete = () => {
    if (deletingPostId && onDeletePost) {
      onDeletePost(deletingPostId);
    }
    setDeletingPostId(null);
    if (activePostModal && activePostModal.id === deletingPostId) {
      setActivePostModal(null);
    }
  };

  // Profile Edit State
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [favoriteVerse, setFavoriteVerse] = useState(user.favoriteVerse || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [coverImage, setCoverImage] = useState(user.coverImage || 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=1200');

  // Post Creator State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState<Category>('Prayer Request');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postYoutubeId, setPostYoutubeId] = useState('');

  // Sync internal edit state whenever user prop updates
  React.useEffect(() => {
    setName(user.name);
    setBio(user.bio || '');
    setFavoriteVerse(user.favoriteVerse || '');
    setAvatar(user.avatar);
    setCoverImage(user.coverImage || 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=1200');
  }, [user]);

  const handleOpenEdit = () => {
    setName(user.name);
    setBio(user.bio || '');
    setFavoriteVerse(user.favoriteVerse || '');
    setAvatar(user.avatar);
    setCoverImage(user.coverImage || 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=1200');
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      bio,
      favoriteVerse,
      avatar,
      coverImage
    };
    onUpdateProfile(updated);
    setIsEditing(false);
    setSaveSuccessMsg('Personal space updated & saved!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleCopyInviteLink = () => {
    const link = 'https://livingonaprayer.online';
    try {
      navigator.clipboard.writeText(link);
    } catch (e) {
      console.error(e);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const author = currentUser || user;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: author.id,
      userName: author.name,
      userAvatar: author.avatar,
      title: postTitle,
      category: postCategory,
      content: postContent,
      imageUrl: postImageUrl || undefined,
      videoUrl: postVideoUrl || undefined,
      youtubeId: postYoutubeId || undefined,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      comments: []
    };

    if (onAddPost) {
      onAddPost(newPost);
    }

    setShowCreatePostModal(false);
    setPostTitle('');
    setPostContent('');
    setPostImageUrl('');
    setPostVideoUrl('');
    setPostYoutubeId('');

    setSaveSuccessMsg(`Prayer request published as ${author.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-slate-100">
      {/* Profile Wall Banner & Avatar Header */}
      <div className="bg-[#0b132b] border border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 relative bg-[#081229]">
          <img
            src={coverImage}
            alt="Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b132b] via-[#0b132b]/30 to-transparent" />
          
          <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap">
            {currentUser && currentUser.id !== user.id ? (
              <>
                {onOpenDMs && (
                  <button
                    onClick={() => onOpenDMs(user.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/50 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-300" /> Message DM
                  </button>
                )}

                {onToggleFollow && (
                  <button
                    onClick={() => onToggleFollow(user.id, user.name, user.avatar)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
                      (currentUser.followingIds || []).includes(user.id)
                        ? 'bg-purple-950/90 text-amber-300 border border-purple-400/60'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                    {(currentUser.followingIds || []).includes(user.id) ? 'Following' : 'Follow'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:brightness-110 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> Invite Believers
                </button>

                <button
                  onClick={handleOpenEdit}
                  className="bg-[#081229]/90 hover:bg-blue-950 text-amber-300 border border-amber-400/50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Avatar & User Details */}
        <div className="px-6 pb-6 pt-0 relative -mt-16 sm:-mt-20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[#0b132b] shadow-2xl"
                />
                <span className="absolute bottom-2 right-2 p-1.5 bg-amber-400 text-slate-950 rounded-full border-2 border-[#0b132b]">
                  <Cross className="w-4 h-4 fill-slate-950 stroke-slate-950" />
                </span>
              </div>

              <div className="pb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#fffbe6] flex items-center gap-2">
                  {user.name}
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </h1>
                <p className="text-xs text-blue-200 font-medium">{user.email}</p>
                
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/40">
                    {user.role || 'Believer'}
                  </span>

                  <span className="bg-blue-950/80 text-blue-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <strong className="text-amber-300">{user.followersCount || 142}</strong> Followers
                  </span>

                  <span className="bg-blue-950/80 text-blue-100 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <strong className="text-amber-300">{user.followingCount || 38}</strong> Following
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Favorite Verse */}
          <div className="bg-[#081229]/80 border border-amber-400/30 p-4 rounded-2xl space-y-2">
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-sans">{user.bio}</p>
            {user.favoriteVerse && (
              <p className="text-xs text-amber-300 font-serif italic pt-1 border-t border-amber-400/20">
                "{user.favoriteVerse}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* USER'S PERSONAL POSTS & PRAYERS WALL HEADER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
            {user.name}'s Personal Wall ({userPosts.length})
          </h2>

          <button
            onClick={() => setShowCreatePostModal(true)}
            className="py-2 px-3 bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Post Prayer Request
          </button>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPosts.map(post => (
              <div
                key={post.id}
                onClick={() => setActivePostModal(post)}
                className="bg-slate-900 border border-purple-800/40 hover:border-amber-400/60 rounded-2xl p-4 shadow-xl space-y-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] group"
              >
                {post.imageUrl && (
                  <div className="h-44 rounded-xl overflow-hidden border border-purple-900/40 relative bg-slate-950">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-400/30">
                      Open Post & Photo
                    </span>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] bg-purple-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-sm text-white font-serif group-hover:text-amber-300 transition-colors">{post.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{post.content}</p>
                </div>

                <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs text-slate-400">
                  <span>{post.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    {onEditPost && canModifyPost(post) && (
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(post, e)}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/30 transition-colors cursor-pointer"
                        title="Edit Post"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeletePost && canModifyPost(post) && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                        className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                        title="Erase Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikePost(post.id);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                        post.isLiked
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                          : 'bg-purple-950/60 text-amber-300 border-purple-800/40 hover:bg-purple-900/80'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                      <span>Amen ({post.likesCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-slate-900/60 border border-purple-900/30 rounded-2xl text-center space-y-3">
            <p className="text-xs text-slate-300">No prayer posts on your personal wall yet.</p>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              + Create First Personal Prayer Request
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: EDIT PROFILE */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-3 shrink-0">
                <h3 className="font-bold font-serif text-base sm:text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Edit Personal Space
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-purple-900">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <MediaInputPicker
                    label="Profile Avatar (Phone Photo Upload / URL)"
                    value={avatar}
                    acceptType="image"
                    onChange={(data) => {
                      if (data.mediaUrl) setAvatar(data.mediaUrl);
                    }}
                  />
                </div>

                <div>
                  <MediaInputPicker
                    label="Cover Banner Photo (Phone Photo Upload / URL)"
                    value={coverImage}
                    acceptType="image"
                    onChange={(data) => {
                      if (data.mediaUrl) setCoverImage(data.mediaUrl);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Favorite Scripture Verse</label>
                  <input
                    type="text"
                    value={favoriteVerse}
                    onChange={(e) => setFavoriteVerse(e.target.value)}
                    placeholder="e.g. Philippians 4:13"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 sticky bottom-0 bg-slate-900 z-10">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Save Personal Space Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: INVITE BELIEVERS */}
      <AnimatePresence>
        {showInviteModal && (
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
                  Invite Believers to Living on a Prayer
                </h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-950 border border-purple-900/40 rounded-2xl space-y-3 text-center">
                <p className="text-xs text-purple-200 leading-relaxed">
                  Share our fellowship app with friends, family, and church members so we can pray and study scripture together!
                </p>

                <div className="p-2.5 bg-slate-900 border border-purple-800/40 rounded-xl flex items-center justify-between text-xs text-amber-300 font-mono">
                  <span>https://livingonaprayer.online</span>
                  <button
                    onClick={handleCopyInviteLink}
                    className="py-1 px-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyInviteLink}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Share Invite Link
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: CREATE PERSONAL PRAYER POST FROM PROFILE WALL */}
      <AnimatePresence>
        {showCreatePostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-purple-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-3 shrink-0">
                <h3 className="font-bold font-serif text-base sm:text-lg text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Post Prayer Request or Praise Report
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-purple-900">
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-950/80 rounded-xl border border-amber-400/30 text-xs">
                  <img
                    src={(currentUser || user).avatar}
                    alt={(currentUser || user).name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-amber-400"
                  />
                  <span className="text-slate-200">
                    Posting as <strong className="text-amber-300">{(currentUser || user).name}</strong>
                    {currentUser && currentUser.id !== user.id ? ` on ${user.name}'s Wall` : ''}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Pray for my family / Praise Report for Healing"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value as Category)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Content / Prayer Details</label>
                  <textarea
                    rows={4}
                    required
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share what God is doing or what prayer is needed..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <MediaInputPicker
                    label="Attach Photo / Video / Media (Device Upload)"
                    value={postImageUrl || postVideoUrl}
                    youtubeId={postYoutubeId}
                    onChange={(data) => {
                      if (data.mediaUrl) setPostImageUrl(data.mediaUrl);
                      if (data.videoUrl) setPostVideoUrl(data.videoUrl);
                      if (data.youtubeId) setPostYoutubeId(data.youtubeId);
                    }}
                  />
                </div>

                <div className="pt-2 sticky bottom-0 bg-slate-900 z-10">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Publish Prayer Request
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: POP-OUT POST LIGHTBOX */}
      <AnimatePresence>
        {activePostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100"
            >
              {/* Header */}
              <div className="p-4 bg-slate-950/90 border-b border-purple-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activePostModal.userAvatar}
                    alt={activePostModal.userName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-amber-400"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white">{activePostModal.userName}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-purple-300">
                      <span>{activePostModal.category}</span>
                      <span>•</span>
                      <span>{activePostModal.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onEditPost && canModifyPost(activePostModal) && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(activePostModal)}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1 transition-all cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDeletePost && canModifyPost(activePostModal) && (
                    <button
                      type="button"
                      onClick={() => setDeletingPostId(activePostModal.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-600 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer"
                      title="Erase Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActivePostModal(null)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white leading-snug">
                  {activePostModal.title}
                </h2>

                {activePostModal.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950/90 flex items-center justify-center p-2 min-h-[220px] max-h-[60vh] sm:max-h-[70vh] shadow-2xl">
                    <img
                      src={activePostModal.imageUrl}
                      alt={activePostModal.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                      className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )}

                <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {activePostModal.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
                  <button
                    onClick={() => {
                      onLikePost(activePostModal.id);
                      setActivePostModal(prev => prev ? {
                        ...prev,
                        isLiked: !prev.isLiked,
                        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
                      } : null);
                    }}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      activePostModal.isLiked
                        ? 'bg-amber-400 text-slate-950 border-amber-400'
                        : 'bg-purple-950/60 text-amber-300 border-purple-800/40 hover:bg-purple-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${activePostModal.isLiked ? 'fill-slate-950' : ''}`} />
                    <span>Amen / Praying ({activePostModal.likesCount})</span>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText?.(window.location.href);
                        alert('Prayer post link copied!');
                      } catch (e) {}
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50"
                  >
                    <Share2 className="w-4 h-4" /> Share Post
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT POST MODAL */}
      <AnimatePresence>
        {editingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-amber-400/40 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <h3 className="font-bold text-base text-amber-300 font-serif flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  Edit Personal Post
                </h3>
                <button
                  onClick={() => setEditingPost(null)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                    className="w-full py-2 px-3 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Content / Message</label>
                  <textarea
                    required
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="border-t border-purple-900/30 pt-3">
                  <label className="block text-xs font-bold text-amber-300 mb-2">Media & Video attachment</label>
                  <MediaInputPicker
                    value={editImageUrl || editVideoUrl}
                    youtubeId={editYoutubeId}
                    onChange={({ mediaUrl, videoUrl, youtubeId }) => {
                      setEditImageUrl(mediaUrl || '');
                      setEditVideoUrl(videoUrl || '');
                      setEditYoutubeId(youtubeId || '');
                    }}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-900/40">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow hover:brightness-110 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE POST DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-500/40">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Erase Post?</h3>
                  <p className="text-xs text-rose-300/80">Confirm post deletion</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently erase this post from the wall and database? This action cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingPostId(null)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Yes, Erase Post
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
