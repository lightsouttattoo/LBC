import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, MessageSquare, Share2, Plus, Image as ImageIcon, Video, Link, Youtube, 
  X, Send, Sparkles, Cross, Filter, Eye, Bookmark, Check, ThumbsUp, ExternalLink,
  UserPlus, UserCheck, Play, Film, Volume2, Edit3, Trash2, AlertTriangle, RotateCcw,
  Shield, Users, RefreshCw
} from 'lucide-react';
import { Post, Category, User, Comment } from '../types';
import { MediaInputPicker } from './MediaInputPicker';
import { parseVideoUrl } from '../utils/videoUtils';

interface NewsFeedProps {
  user: User;
  posts: Post[];
  onAddPost: (newPost: Post) => void;
  onEditPost?: (postId: string, updatedFields: Partial<Post>) => void;
  onDeletePost?: (postId: string) => void;
  onEraseAllPosts?: () => void;
  onEraseSelectedPosts?: (postIds: string[]) => void;
  onSwitchUser?: (newUser: User) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onOpenWebView?: (url: string, title?: string, sourceName?: string, categoryName?: string) => void;
  onToggleFollow?: (targetUserId: string, targetUserName: string, targetAvatar: string) => void;
  onSelectUser?: (targetUserId: string, userName?: string, userAvatar?: string) => void;
}

const CATEGORIES: Category[] = [
  'Prayer Request',
  'Praise Report',
  'Testimony',
  'Bible Study',
  'General Thought',
  'Urgent Prayer'
];

export const NewsFeed: React.FC<NewsFeedProps> = ({
  user,
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onEraseAllPosts,
  onEraseSelectedPosts,
  onSwitchUser,
  onLikePost,
  onAddComment,
  onOpenWebView,
  onToggleFollow,
  onSelectUser
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePostLightbox, setActivePostLightbox] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  // Admin and permissions check
  const isAdmin = Boolean(
    user?.role?.toLowerCase().includes('admin') || 
    user?.role?.toLowerCase().includes('owner') ||
    user?.name?.toLowerCase().includes('tex') ||
    user?.role?.toLowerCase().includes('leader') || 
    user?.role?.toLowerCase().includes('pastor')
  );

  const canModifyPost = (p: Post) => {
    if (!user) return false;
    const isOwner = p.userId === user.id || (p.userName && user.name && p.userName.trim().toLowerCase() === user.name.trim().toLowerCase());
    return isOwner || isAdmin;
  };

  // State for Admin Erase Selector Modal
  const [showEraseSelectorModal, setShowEraseSelectorModal] = useState(false);
  const [eraseSelectorMode, setEraseSelectorMode] = useState<'author' | 'category' | 'all'>('author');
  const [selectedAuthorToErase, setSelectedAuthorToErase] = useState<string>('');
  const [selectedCategoryToErase, setSelectedCategoryToErase] = useState<Category>('Prayer Request');

  // Live active post from posts state
  const activePost = activePostLightbox ? posts.find(p => p.id === activePostLightbox.id) || activePostLightbox : null;

  // Form states for creating a post
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Prayer Request');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  // Form states for editing a post
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Prayer Request');
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editYoutubeId, setEditYoutubeId] = useState('');

  // State for single post deletion confirmation
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // State for Erase All Posts confirmation modal
  const [showEraseAllConfirm, setShowEraseAllConfirm] = useState(false);

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
    if (activePostLightbox && activePostLightbox.id === deletingPostId) {
      setActivePostLightbox(null);
    }
  };

  const handleConfirmEraseAll = () => {
    if (onEraseAllPosts) {
      onEraseAllPosts();
    }
    setShowEraseAllConfirm(false);
    setActivePostLightbox(null);
  };

  // Filter and deduplicate posts
  const rawCategoryPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  const filteredPosts = rawCategoryPosts.reduce((acc: Post[], current) => {
    const isDup = acc.some(p => 
      p.id === current.id ||
      (p.title.trim().toLowerCase() === current.title.trim().toLowerCase() && 
       ((p.youtubeId && p.youtubeId === current.youtubeId) || 
        (p.videoUrl && p.videoUrl === current.videoUrl) || 
        (p.content && current.content && p.content.trim().toLowerCase() === current.content.trim().toLowerCase())))
    );
    if (!isDup) {
      acc.push(current);
    }
    return acc;
  }, []);

  // Group filtered posts into alternating sections: Carousel (3 posts) -> Vertical (3 posts) -> Carousel (3 posts) -> Vertical (3 posts) ...
  const feedSections: { type: 'carousel' | 'vertical'; title: string; posts: Post[] }[] = [];
  let pIdx = 0;
  let sectionIndex = 0;

  while (pIdx < filteredPosts.length) {
    const chunk = filteredPosts.slice(pIdx, pIdx + 3);
    const isCarousel = sectionIndex % 2 === 0;

    let sectionTitle = '';
    if (isCarousel) {
      sectionTitle = sectionIndex === 0 ? 'Featured & Urgent Prayers' : 'Trending Faith Messages';
    } else {
      sectionTitle = sectionIndex === 1 ? 'Community Prayer Wall' : 'More Believer Posts';
    }

    feedSections.push({
      type: isCarousel ? 'carousel' : 'vertical',
      title: sectionTitle,
      posts: chunk
    });

    pIdx += 3;
    sectionIndex++;
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      title,
      category,
      content,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      youtubeId: youtubeId || undefined,
      createdAt: 'Just now',
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      comments: []
    };

    onAddPost(newPost);
    setShowCreateModal(false);
    // Reset form
    setTitle('');
    setContent('');
    setImageUrl('');
    setVideoUrl('');
    setYoutubeId('');
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activePostLightbox) return;

    onAddComment(activePostLightbox.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6">
      {/* Top Banner & Create Post Action Trigger */}
      <div className="bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border border-amber-400/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={user.avatar}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#fffbe6]">{user.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isAdmin 
                  ? 'bg-amber-400 text-slate-950 border border-amber-300' 
                  : 'bg-purple-900/80 text-purple-200 border border-purple-500/40'
              }`}>
                {user.role || 'Believer'}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              {isAdmin 
                ? 'Admin Account: You can edit/erase any post or use the Erase Selector.' 
                : 'Member Account: You can edit or erase only your own posts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-end">
          {/* ADMIN ONLY Erase Selector Tool Button */}
          {isAdmin && posts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                // Set default author to first available author in posts
                const firstAuthor = posts.find(p => p.userName)?.userName || '';
                setSelectedAuthorToErase(firstAuthor);
                setShowEraseSelectorModal(true);
              }}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-950 to-rose-900 hover:from-rose-900 hover:to-rose-850 border border-rose-500/60 text-rose-200 font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Admin Post Erase Selector"
            >
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Admin Erase Selector</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-blue-950/80 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Post Prayer
          </button>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
              : 'bg-[#0b132b] text-blue-100 border border-amber-400/30 hover:bg-blue-900/40'
          }`}
        >
          All Community Feed
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                : 'bg-[#0b132b] text-blue-100 border border-amber-400/30 hover:bg-blue-900/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* DYNAMIC ALTERNATING SECTIONS: Carousel -> Vertical -> Carousel -> Vertical ... */}
      <div className="space-y-8 pt-1">
        {feedSections.map((sec, sIdx) => {
          if (sec.type === 'carousel') {
            return (
              <div key={`carousel_sec_${sIdx}`} className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 tracking-wider uppercase px-1">
                  <span className="flex items-center gap-1.5 font-serif">
                    <Sparkles className="w-4 h-4 text-amber-400" /> {sec.title}
                  </span>
                  <span className="text-[10px] text-amber-300/80 font-normal">Swipe Horizontally →</span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                  {sec.posts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setActivePostLightbox(post)}
                      className="snap-center flex-shrink-0 w-72 sm:w-80 bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
                    >
                      {/* Cover Image or Video Header */}
                      {(post.videoUrl || post.youtubeId) ? (
                        <div className="relative h-44 overflow-hidden bg-slate-950 flex items-center justify-center border-b border-amber-400/20">
                          <img
                            src={post.imageUrl || (post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800')}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="p-3 rounded-full bg-amber-400 text-slate-950 shadow-2xl border border-white/60 group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                            </div>
                          </div>
                          <span className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center gap-1">
                            <Film className="w-3 h-3 text-amber-400" /> VIDEO POST
                          </span>
                        </div>
                      ) : post.imageUrl ? (
                        <div className="relative h-44 overflow-hidden bg-slate-950">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                            {post.category}
                          </span>
                          <span className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-400/40 opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Eye className="w-3 h-3 text-amber-400" /> Open Full
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-gradient-to-r from-blue-950 to-[#0b132b] border-b border-amber-400/20 flex items-center justify-between">
                          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                            {post.category}
                          </span>
                        </div>
                      )}

                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-[#fffbe6] line-clamp-2 group-hover:text-amber-300 transition-colors font-serif">
                            {post.title}
                          </h3>
                          <p className="text-xs text-blue-100/80 line-clamp-2 mt-1 leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs text-slate-400">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectUser) onSelectUser(post.userId, post.userName, post.userAvatar);
                            }}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={post.userAvatar}
                              alt={post.userName}
                              referrerPolicy="no-referrer"
                              className="w-5 h-5 rounded-full object-cover border border-amber-400/60"
                            />
                            <span className="text-[11px] font-medium text-slate-200 truncate max-w-[100px] hover:text-amber-300">{post.userName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            {onEditPost && canModifyPost(post) && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className="p-1 rounded-lg bg-blue-950/80 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/30 transition-colors cursor-pointer"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeletePost && canModifyPost(post) && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                                className="p-1 rounded-lg bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Erase Post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onLikePost(post.id); }}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                post.isLiked
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                                  : 'bg-blue-950 text-amber-300 border-amber-400/30 hover:bg-blue-900'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${post.isLiked ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                              <span>Amen ({post.likesCount})</span>
                            </button>
                            <span className="flex items-center gap-1 text-blue-200">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> {post.commentsCount}
                            </span>
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
              <div key={`vertical_sec_${sIdx}`} className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider uppercase px-1">
                  <span className="font-serif text-amber-300">{sec.title}</span>
                  <span className="text-[10px] text-blue-200 font-normal">{sec.posts.length} Posts Vertical</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sec.posts.map(post => (
                    <motion.div
                      key={post.id}
                      whileHover={{ y: -2 }}
                      onClick={() => setActivePostLightbox(post)}
                      className="bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      {/* Cover Image or Video Header */}
                      {(post.videoUrl || post.youtubeId) ? (
                        <div className="relative h-44 overflow-hidden bg-slate-950 flex items-center justify-center border-b border-amber-400/20">
                          <img
                            src={post.imageUrl || (post.youtubeId ? `https://img.youtube.com/vi/${post.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800')}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="p-3 rounded-full bg-amber-400 text-slate-950 shadow-2xl border border-white/60 group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                            </div>
                          </div>
                          <span className="absolute top-2.5 left-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 flex items-center gap-1">
                            <Film className="w-3 h-3 text-amber-400" /> VIDEO POST
                          </span>
                        </div>
                      ) : post.imageUrl ? (
                        <div className="relative h-44 overflow-hidden bg-slate-950">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                            {post.category}
                          </div>
                          <span className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-400/40 opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Eye className="w-3 h-3 text-amber-400" /> Open Full
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-950/60 border-b border-amber-400/20 flex items-center justify-between">
                          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                            {post.category}
                          </span>
                          <span className="text-[10px] text-blue-200/60">{post.createdAt}</span>
                        </div>
                      )}

                      {/* Card Body */}
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[#fffbe6] group-hover:text-amber-300 transition-colors font-serif leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-blue-100/80 line-clamp-3 mt-1.5 leading-relaxed">
                            {post.content}
                          </p>
                        </div>

                        {/* Card Footer: Author + Reaction Counts */}
                        <div className="pt-3 border-t border-amber-400/20 flex items-center justify-between text-xs text-slate-400">
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectUser) onSelectUser(post.userId, post.userName, post.userAvatar);
                            }}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                          >
                            <img
                              src={post.userAvatar}
                              alt={post.userName}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover border border-amber-400/60"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-200 block truncate max-w-[100px] hover:text-amber-300">{post.userName}</span>
                                {post.userId !== user.id && onToggleFollow && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onToggleFollow(post.userId, post.userName, post.userAvatar);
                                    }}
                                    className={`p-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-0.5 cursor-pointer ${
                                      (user.followingIds || []).includes(post.userId)
                                        ? 'bg-blue-900/80 text-amber-300 border border-amber-400/40'
                                        : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow'
                                    }`}
                                    title={(user.followingIds || []).includes(post.userId) ? 'Following' : 'Follow User'}
                                  >
                                    {(user.followingIds || []).includes(post.userId) ? (
                                      <UserCheck className="w-3 h-3 text-amber-300" />
                                    ) : (
                                      <UserPlus className="w-3 h-3 stroke-[2.5]" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <span className="text-[9px] text-blue-200/60">{post.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs">
                            {onEditPost && canModifyPost(post) && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditModal(post, e)}
                                className="p-1.5 rounded-xl bg-blue-950 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/30 transition-colors cursor-pointer"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeletePost && canModifyPost(post) && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                                className="p-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Erase Post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onLikePost(post.id); }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                post.isLiked
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                                  : 'bg-blue-950 text-amber-300 border-amber-400/30 hover:bg-blue-900/80'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
                              <span>Amen ({post.likesCount})</span>
                            </button>
                            <span className="flex items-center gap-1 bg-blue-950 px-2 py-1 rounded-lg border border-amber-400/30 text-blue-200">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                              <span>{post.commentsCount}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* CREATE POST MODAL (Direct Upload, URL, YouTube support) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-4">
                <h3 className="font-bold font-serif text-lg text-white flex items-center gap-2">
                  <Cross className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Post Prayer or Content
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Post Title / Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prayer Request for Healing / Praise Report..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-amber-300 font-semibold focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Content / Scripture / Testimony</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your prayer petition, reflection, or words of encouragement here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Media Attachment Selector */}
                <div>
                  <MediaInputPicker
                    label="Attach Photo or Video (Upload from Phone, URL, or YouTube)"
                    value={imageUrl || videoUrl}
                    youtubeId={youtubeId}
                    onChange={(data) => {
                      if (data.youtubeId) {
                        setYoutubeId(data.youtubeId);
                        setImageUrl('');
                        setVideoUrl('');
                      } else if (data.videoUrl) {
                        setVideoUrl(data.videoUrl);
                        setImageUrl('');
                        setYoutubeId('');
                      } else if (data.mediaUrl) {
                        setImageUrl(data.mediaUrl);
                        setVideoUrl('');
                        setYoutubeId('');
                      } else {
                        setImageUrl('');
                        setVideoUrl('');
                        setYoutubeId('');
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 transition-all"
                >
                  Publish Prayer Post
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX DETAIL POPUP MODAL */}
      <AnimatePresence>
        {activePost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100"
            >
              {/* Header */}
              <div className="p-4 bg-slate-950/90 border-b border-purple-900/40 flex items-center justify-between">
                <div 
                  onClick={() => {
                    if (onSelectUser) onSelectUser(activePost.userId, activePost.userName, activePost.userAvatar);
                    setActivePostLightbox(null);
                  }}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={activePost.userAvatar}
                    alt={activePost.userName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-amber-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white hover:text-amber-300">{activePost.userName}</h3>
                      {activePost.userId !== user.id && onToggleFollow && (
                        <button
                          type="button"
                          onClick={() => onToggleFollow(activePost.userId, activePost.userName, activePost.userAvatar)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                            (user.followingIds || []).includes(activePost.userId)
                              ? 'bg-purple-900/80 text-amber-300 border border-purple-500/40'
                              : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow'
                          }`}
                        >
                          {(user.followingIds || []).includes(activePost.userId) ? (
                            <>
                              <UserCheck className="w-3 h-3 text-amber-300" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3 stroke-[2.5]" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-purple-300">
                      <span>{activePost.category}</span>
                      <span>•</span>
                      <span>{activePost.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onEditPost && canModifyPost(activePost) && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(activePost)}
                      className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-xs font-bold border border-amber-400/40 flex items-center gap-1 transition-all cursor-pointer"
                      title="Edit Post"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onDeletePost && canModifyPost(activePost) && (
                    <button
                      type="button"
                      onClick={() => setDeletingPostId(activePost.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-600 text-rose-300 text-xs font-bold border border-rose-500/40 flex items-center gap-1 transition-all cursor-pointer"
                      title="Erase Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Erase</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActivePostLightbox(null)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-white leading-snug">
                  {activePost.title}
                </h2>

                {/* Media Section: Video (YouTube, Vimeo, Rumble, Direct MP4) or Image */}
                {(() => {
                  const videoSource = activePost.videoUrl || activePost.youtubeId;
                  if (!videoSource) {
                    if (activePost.imageUrl) {
                      return (
                        <div className="rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950/90 flex items-center justify-center p-2 min-h-[220px] max-h-[60vh] sm:max-h-[70vh] shadow-2xl">
                          <img
                            src={activePost.imageUrl}
                            alt={activePost.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                            className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                          />
                        </div>
                      );
                    }
                    return null;
                  }

                  const isAudio = typeof videoSource === 'string' && (
                    videoSource.startsWith('data:audio/') ||
                    /\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(videoSource) ||
                    videoSource.includes('audio')
                  );

                  if (isAudio) {
                    return (
                      <div className="p-4 bg-slate-950 border border-amber-400/50 rounded-2xl shadow-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
                          <span>Anointed Audio Sermon / Broadcast</span>
                        </div>
                        <audio
                          controls
                          controlsList="nodownload"
                          src={videoSource}
                          className="w-full h-12 rounded-xl accent-amber-400"
                        />
                      </div>
                    );
                  }

                  const parsed = parseVideoUrl(videoSource, activePost.youtubeId);

                  return (
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-purple-900/40 bg-slate-950 shadow-xl relative">
                        {parsed.provider === 'youtube' && parsed.embedUrl ? (
                          <iframe
                            src={parsed.embedUrl}
                            title={activePost.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : parsed.embedUrl && parsed.provider !== 'direct' ? (
                          <iframe
                            src={parsed.embedUrl}
                            title={activePost.title}
                            allow="autoplay; fullscreen"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video
                            controls
                            autoPlay
                            src={parsed.directUrl || parsed.embedUrl || activePost.videoUrl}
                            poster={activePost.imageUrl}
                            className="w-full h-full object-contain bg-black"
                          />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            // Switch to direct sample MP4 video if embed has restriction
                            setActivePostLightbox(prev => prev ? {
                              ...prev,
                              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                              youtubeId: undefined
                            } : null);
                          }}
                          className="text-[11px] text-amber-300 hover:underline inline-flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30 font-semibold"
                        >
                          <Video className="w-3.5 h-3.5 text-amber-400" /> Play Direct MP4 Stream
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const rawUrl = activePost.videoUrl || (activePost.youtubeId ? `https://www.youtube.com/watch?v=${activePost.youtubeId}` : 'https://vimeo.com');
                            if (onOpenWebView) onOpenWebView(rawUrl, activePost.title, parsed.provider.toUpperCase(), 'Community Post');
                            else window.open(rawUrl, '_blank');
                          }}
                          className="text-[11px] text-purple-200 hover:underline inline-flex items-center gap-1 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40 font-medium"
                        >
                          Open in Webview <ExternalLink className="w-3 h-3 text-amber-400" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {activePost.content}
                </p>

                {/* Reaction Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLikePost(activePost.id)}
                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        activePost.isLiked
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-purple-950/60 text-amber-300 border-purple-800/40 hover:bg-purple-900'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${activePost.isLiked ? 'fill-slate-950' : ''}`} />
                      <span>Amen / Praying ({activePost.likesCount})</span>
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText?.(window.location.href);
                        alert('Prayer post link copied!');
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Community Prayers & Comments ({activePost.comments?.length || 0})
                  </h4>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {activePost.comments && activePost.comments.length > 0 ? (
                      activePost.comments.map(c => (
                        <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-purple-900/30 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-amber-300">
                            <span className="flex items-center gap-1.5">
                              <img src={c.userAvatar} alt={c.userName} referrerPolicy="no-referrer" className="w-4 h-4 rounded-full" />
                              {c.userName}
                            </span>
                            <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-200">{c.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Be the first believer to leave an encouraging comment.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Input Footer */}
              <form onSubmit={handleSendComment} className="p-3 bg-slate-950 border-t border-purple-900/40 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a prayer or comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 py-2 px-3 bg-slate-900 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Post
                </button>
              </form>
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
                  Edit Post
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
                Are you sure you want to permanently erase this post from the community feed and database? This action cannot be undone.
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

      {/* ERASE ALL POSTS CONFIRMATION MODAL */}
      <AnimatePresence>
        {showEraseAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-3 rounded-2xl bg-rose-950 border border-rose-500/50 animate-pulse">
                  <Trash2 className="w-7 h-7 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Erase ALL Posts?</h3>
                  <p className="text-xs text-rose-300">Complete feed reset</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-rose-950/40 p-3 rounded-xl border border-rose-900/40">
                ⚠️ <strong className="text-rose-300">Warning:</strong> This will erase <strong>ALL {posts.length} posts</strong> currently in the community feed and remove them permanently from Firestore database storage.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEraseAllConfirm(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEraseAll}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white font-extrabold text-xs shadow-xl cursor-pointer"
                >
                  Yes, Erase All Posts
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ADMIN ERASE SELECTOR MODAL */}
      <AnimatePresence>
        {showEraseSelectorModal && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/50 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-amber-300 font-serif">Admin Post Erase Selector</h3>
                    <p className="text-[11px] text-slate-400">Select specific criteria to erase posts from feed & database</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEraseSelectorModal(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selector Mode Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setEraseSelectorMode('author')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    eraseSelectorMode === 'author'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  By Author
                </button>
                <button
                  type="button"
                  onClick={() => setEraseSelectorMode('category')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    eraseSelectorMode === 'category'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  By Category
                </button>
                <button
                  type="button"
                  onClick={() => setEraseSelectorMode('all')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    eraseSelectorMode === 'all'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entire Feed
                </button>
              </div>

              {/* Controls depending on mode */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-900/30 space-y-3">
                {eraseSelectorMode === 'author' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Author to Erase</label>
                    {Array.from(new Set(posts.map(p => p.userName))).length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No post authors found in feed.</p>
                    ) : (
                      <select
                        value={selectedAuthorToErase}
                        onChange={(e) => setSelectedAuthorToErase(e.target.value)}
                        className="w-full py-2.5 px-3 bg-slate-900 border border-purple-900/60 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {Array.from(new Set(posts.map(p => p.userName))).map(authorName => {
                          const count = posts.filter(p => p.userName === authorName).length;
                          return (
                            <option key={authorName} value={authorName}>
                              {authorName} ({count} {count === 1 ? 'post' : 'posts'})
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}

                {eraseSelectorMode === 'category' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Select Category to Erase</label>
                    <select
                      value={selectedCategoryToErase}
                      onChange={(e) => setSelectedCategoryToErase(e.target.value as Category)}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-purple-900/60 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {CATEGORIES.map(cat => {
                        const count = posts.filter(p => p.category === cat).length;
                        return (
                          <option key={cat} value={cat}>
                            {cat} ({count} {count === 1 ? 'post' : 'posts'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {eraseSelectorMode === 'all' && (
                  <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30 text-rose-200 text-xs leading-relaxed">
                    ⚠️ <strong>Admin Overwrite:</strong> This will permanently erase <strong>ALL {posts.length} posts</strong> from the community feed and Firestore database.
                  </div>
                )}

                {/* Target Summary Stats */}
                {(() => {
                  let targetPosts: Post[] = [];
                  if (eraseSelectorMode === 'author') {
                    targetPosts = posts.filter(p => p.userName === selectedAuthorToErase);
                  } else if (eraseSelectorMode === 'category') {
                    targetPosts = posts.filter(p => p.category === selectedCategoryToErase);
                  } else {
                    targetPosts = posts;
                  }

                  return (
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-900/30">
                      <span className="text-slate-400">Target Posts:</span>
                      <span className="font-extrabold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        {targetPosts.length} {targetPosts.length === 1 ? 'Post' : 'Posts'} to be erased
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEraseSelectorModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    let idsToErase: string[] = [];
                    if (eraseSelectorMode === 'author') {
                      idsToErase = posts.filter(p => p.userName === selectedAuthorToErase).map(p => p.id);
                    } else if (eraseSelectorMode === 'category') {
                      idsToErase = posts.filter(p => p.category === selectedCategoryToErase).map(p => p.id);
                    } else {
                      idsToErase = posts.map(p => p.id);
                    }

                    if (idsToErase.length === 0) {
                      setShowEraseSelectorModal(false);
                      return;
                    }

                    if (eraseSelectorMode === 'all') {
                      if (onEraseAllPosts) onEraseAllPosts();
                    } else {
                      if (onEraseSelectedPosts) onEraseSelectedPosts(idsToErase);
                    }

                    setShowEraseSelectorModal(false);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:brightness-110 text-white font-extrabold text-xs shadow-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Execute Erase</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
