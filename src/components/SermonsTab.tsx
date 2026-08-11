import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Youtube, Plus, Play, BookOpen, Clock, User as UserIcon, X, Sparkles, Music, Upload, Film, FileAudio, Link as LinkIcon, Check, ExternalLink, Share2, Rss, ShieldAlert, Tv, Layers } from 'lucide-react';
import { Sermon, User, Post } from '../types';
import { parseVideoUrl } from '../utils/videoUtils';

interface SermonsTabProps {
  user: User;
  sermons: Sermon[];
  onAddSermon: (newSermon: Sermon) => void;
  onAddPost?: (newPost: Post) => void;
  onOpenWebView?: (url: string, title?: string, sourceName?: string, categoryName?: string) => void;
}

type MediaType = 'vimeo_rumble_mp4' | 'youtube' | 'direct_audio';

interface ChannelPreset {
  id: string;
  name: string;
  handle: string;
  platform: 'Vimeo' | 'Rumble' | 'YouTube' | 'Direct';
  description: string;
  url: string;
  videos: { title: string; videoUrl?: string; youtubeId?: string; speaker: string; scriptureRef: string }[];
}

const CHRISTIAN_CHANNELS: ChannelPreset[] = [
  {
    id: 'vimeo_sermons',
    name: 'Vimeo Faith & Word Broadcasts (No Embed Restrictions)',
    handle: '@vimeo_faith',
    platform: 'Vimeo',
    description: 'High-definition Christian sermon streams with zero embed restrictions or website blocks.',
    url: 'https://vimeo.com/search?q=sermon',
    videos: [
      {
        title: 'The Grace and Power of Living in Faith',
        videoUrl: 'https://player.vimeo.com/video/76979871',
        speaker: 'Pastor Thomas Reed',
        scriptureRef: 'Ephesians 2:8-10, Romans 8:31'
      },
      {
        title: 'Walking in Holy Spirit Anointing',
        videoUrl: 'https://player.vimeo.com/video/115200388',
        speaker: 'Evangelist Michael Brooks',
        scriptureRef: 'Acts 1:8, Galatians 5:22'
      },
      {
        title: 'Persistent Prayer in Times of Trial',
        videoUrl: 'https://player.vimeo.com/video/108453724',
        speaker: 'Elder Johnathan Vance',
        scriptureRef: '1 Thessalonians 5:17'
      }
    ]
  },
  {
    id: 'rumble_kjv',
    name: 'Rumble Gospel & Preaching Network',
    handle: '@rumble_kjv',
    platform: 'Rumble',
    description: 'Independent Christian video network featuring uncensored old-fashioned KJV preaching.',
    url: 'https://rumble.com/c/Christianity',
    videos: [
      {
        title: 'Standing Firm on the Unchanging Word',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        speaker: 'Evangelist Mark Davis',
        scriptureRef: '2 Timothy 3:16-17'
      },
      {
        title: 'Overcoming Spiritual Warfare with Praise',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        speaker: 'Pastor Samuel Wright',
        scriptureRef: 'Ephesians 6:10-18'
      }
    ]
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse Baptist Church (Winchester)',
    handle: '@lighthousewinc',
    platform: 'YouTube',
    description: 'Official channel for Sunday services, midweek Bible studies, and KJV preaching.',
    url: 'https://youtube.com/@lighthousewinc',
    videos: [
      {
        title: 'Sunday Worship Service & Anointed KJV Preaching',
        youtubeId: '5qap5aO4i9A',
        videoUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
        speaker: 'Pastor - Lighthouse Baptist Church',
        scriptureRef: 'Hebrews 11:1-6'
      },
      {
        title: 'Midweek Bible Study: Walking in Truth',
        youtubeId: '2g811Eo7K8U',
        videoUrl: 'https://www.youtube.com/watch?v=2g811Eo7K8U',
        speaker: 'Lighthouse Baptist Ministry',
        scriptureRef: '3 John 1:4, Psalm 91'
      }
    ]
  }
];

export const SermonsTab: React.FC<SermonsTabProps> = ({
  user,
  sermons,
  onAddSermon,
  onAddPost,
  onOpenWebView
}) => {
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(sermons[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Quick Paste Bar State
  const [quickLinkInput, setQuickLinkInput] = useState('');
  const [postSuccessMsg, setPostSuccessMsg] = useState('');

  // Channel Switcher State
  const [selectedChannel, setSelectedChannel] = useState<ChannelPreset>(CHRISTIAN_CHANNELS[0]);

  // Form states for adding sermon in modal
  const [mediaType, setMediaType] = useState<MediaType>('vimeo_rumble_mp4');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [videoLinkUrl, setVideoLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [directAudioUrl, setDirectAudioUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [scriptureRef, setScriptureRef] = useState('John 3:16');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'video') {
        setUploadedFileUrl(dataUrl);
      } else {
        setDirectAudioUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to save sermon to sermon video library
  const saveSermonToLibrary = (sermon: Sermon, customMsg?: string) => {
    onAddSermon(sermon);
    setActiveSermon(sermon);

    const msg = customMsg || `"${sermon.title}" saved to Sermon Video Library!`;
    setPostSuccessMsg(msg);
    setTimeout(() => setPostSuccessMsg(''), 4500);
  };

  const saveSermonAndPostToFeed = (sermon: Sermon, customMsg?: string) => {
    saveSermonToLibrary(sermon, customMsg);
    if (onAddPost) {
      onAddPost({
        id: `post_sermon_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        title: sermon.title,
        category: 'Sermon',
        content: `🎥 **${sermon.title}**\nPreached by ${sermon.speaker}\n\n"${sermon.description}"`,
        imageUrl: sermon.thumbnailUrl,
        createdAt: 'Just now',
        likesCount: 1,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: true
      });
    }
  };

  // Quick paste submit handler for pasting ANY video link (Vimeo, Rumble, YouTube, MP4)
  const handleQuickPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickLinkInput.trim();
    if (!raw) return;

    const parsed = parseVideoUrl(raw);

    const newSermon: Sermon = {
      id: `sermon_quick_${Date.now()}`,
      title: 'Anointed Faith Video Message',
      speaker: selectedChannel.name,
      date: 'Just Now',
      duration: 'Video Sermon',
      category: 'Spiritual Growth',
      thumbnailUrl: parsed.thumbnailUrl || 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800',
      youtubeId: parsed.provider === 'youtube' ? parsed.id : undefined,
      videoUrl: parsed.provider !== 'youtube' ? (parsed.embedUrl || parsed.directUrl || raw) : `https://www.youtube.com/watch?v=${parsed.id}`,
      description: `Shared sermon video broadcast (${parsed.provider.toUpperCase()}).`,
      scriptureRef: '2 Timothy 3:16'
    };

    saveSermonToLibrary(newSermon, `Video added & playing in Sermon Library!`);
    setQuickLinkInput('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !speaker.trim()) return;

    let ytId: string | undefined = undefined;
    let vidUrl: string | undefined = undefined;
    let audUrl: string | undefined = undefined;

    if (mediaType === 'youtube') {
      const parsed = parseVideoUrl(youtubeUrl);
      ytId = parsed.id || '5qap5aO4i9A';
    } else if (mediaType === 'vimeo_rumble_mp4') {
      if (uploadedFileUrl) {
        vidUrl = uploadedFileUrl;
      } else {
        const parsed = parseVideoUrl(videoLinkUrl);
        vidUrl = parsed.embedUrl || parsed.directUrl || videoLinkUrl || 'https://player.vimeo.com/video/76979871';
      }
    } else if (mediaType === 'direct_audio') {
      audUrl = directAudioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }

    const parsedThumb = parseVideoUrl(vidUrl || youtubeUrl);
    const thumb = parsedThumb.thumbnailUrl || 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=800';

    const newSermon: Sermon = {
      id: `sermon_${Date.now()}`,
      title,
      speaker,
      date: 'Today',
      duration: mediaType === 'direct_audio' ? 'Audio Message' : 'Video Sermon',
      category: mediaType === 'direct_audio' ? 'Audio Teaching' : 'Spiritual Growth',
      thumbnailUrl: thumb,
      youtubeId: ytId,
      videoUrl: vidUrl,
      audioUrl: audUrl,
      description,
      scriptureRef
    };

    saveSermonToLibrary(newSermon, `Saved "${title}" to Sermon Library!`);
    setShowAddModal(false);

    // Reset form
    setTitle('');
    setSpeaker('');
    setVideoLinkUrl('');
    setYoutubeUrl('');
    setDirectAudioUrl('');
    setUploadedFileName('');
    setUploadedFileUrl('');
    setDescription('');
  };

  const parsedActiveVideo = parseVideoUrl(activeSermon?.videoUrl || activeSermon?.youtubeId, activeSermon?.youtubeId);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-slate-100">
      {/* Header & Add Sermon CTA */}
      <div className="bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border border-amber-400/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#fffbe6] font-serif">Sermons & Gospel Messages</h2>
            <p className="text-xs text-blue-200">Watch & listen to sermons from Steven Furtick, Elevation, Dr. Tony Evans, Bible Project, Lighthouse Baptist & 2819 Church</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Custom Sermon
        </button>
      </div>

      {/* QUICK PASTE VIDEO LINK BAR */}
      <div className="bg-[#0b132b] border border-amber-400/30 p-3.5 sm:p-4 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-amber-300 flex items-center gap-1.5">
            <Film className="w-4 h-4 text-amber-300" /> Quick Add Sermon Link to Library
          </span>
          {postSuccessMsg && (
            <span className="text-[11px] text-emerald-400 font-bold animate-pulse flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> {postSuccessMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleQuickPostSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              value={quickLinkInput}
              onChange={(e) => setQuickLinkInput(e.target.value)}
              placeholder="Paste Sermon Video URL (YouTube, Vimeo, Rumble, or MP4 audio)..."
              className="w-full pl-9 pr-3 py-2.5 bg-[#081229] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] placeholder:text-blue-300/50 focus:outline-none focus:border-amber-400"
            />
            <LinkIcon className="w-4 h-4 text-amber-300 absolute left-3 top-3" />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow whitespace-nowrap flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add to Library
          </button>
        </form>
      </div>

      {/* ACTIVE FEATURED SERMON PLAYER */}
      {activeSermon && (
        <div className="bg-slate-900 border border-purple-500/40 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-4 sm:p-5">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-purple-900/40 shadow-inner flex flex-col items-center justify-center relative">
            {activeSermon.audioUrl || (activeSermon.videoUrl && (activeSermon.videoUrl.startsWith('data:audio/') || /\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(activeSermon.videoUrl))) ? (
              <div className="w-full h-full p-6 flex flex-col items-center justify-between bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 relative">
                <div className="text-center space-y-2 mt-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg">
                    <Music className="w-8 h-8 animate-pulse" />
                  </div>
                  <span className="inline-block text-[10px] font-bold text-amber-300 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
                    Audio Sermon Broadcast
                  </span>
                  <h3 className="text-lg font-bold font-serif text-white">{activeSermon.title}</h3>
                  <p className="text-xs text-purple-200">Preacher: {activeSermon.speaker}</p>
                </div>

                <div className="w-full max-w-md my-4">
                  <audio controls controlsList="nodownload" src={activeSermon.audioUrl || activeSermon.videoUrl} className="w-full rounded-xl shadow-lg" />
                </div>
              </div>
            ) : parsedActiveVideo.provider === 'youtube' && parsedActiveVideo.embedUrl ? (
              <iframe
                src={parsedActiveVideo.embedUrl}
                title={activeSermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : parsedActiveVideo.embedUrl && parsedActiveVideo.provider !== 'direct' ? (
              <iframe
                src={parsedActiveVideo.embedUrl}
                title={activeSermon.title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                controls
                src={activeSermon.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                poster={activeSermon.thumbnailUrl}
                className="w-full h-full object-contain bg-black"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                {activeSermon.category}
              </span>
              <span className="text-xs text-purple-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {activeSermon.duration}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold font-serif text-white">{activeSermon.title}</h1>
            <p className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" /> Preacher: {activeSermon.speaker} • {activeSermon.date}
            </p>

            {activeSermon.scriptureRef && (
              <div className="p-2.5 bg-slate-950 border border-purple-900/30 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span><strong className="text-amber-300">Key Scriptures: </strong>{activeSermon.scriptureRef}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">{activeSermon.description}</p>

            {/* Action Bar for Active Sermon */}
            <div className="pt-2 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  saveSermonAndPostToFeed(activeSermon, `Published "${activeSermon.title}" to Community Home Feed!`);
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
              >
                <Share2 className="w-4 h-4 stroke-[2.5]" /> Save & Post Video to Feed
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    // Switch to direct MP4 sample if iframe fails
                    setActiveSermon(prev => prev ? {
                      ...prev,
                      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                    } : null);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" /> Direct MP4 Player
                </button>

                {activeSermon.videoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenWebView) onOpenWebView(activeSermon.videoUrl!, activeSermon.title, 'Video Stream', 'Sermons');
                      else window.open(activeSermon.videoUrl, '_blank');
                    }}
                    className="text-[11px] text-purple-300 hover:text-amber-300 underline inline-flex items-center gap-1 font-semibold"
                  >
                    Open Link <ExternalLink className="w-3 h-3 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERMON LIBRARY LIST (Alternating Section Flow: Carousel -> Vertical -> Carousel...) */}
      <div className="space-y-6">
        {(() => {
          const sermonSections: { type: 'carousel' | 'vertical'; title: string; items: Sermon[] }[] = [];
          let sIdx = 0;
          let secIdx = 0;

          while (sIdx < sermons.length) {
            const chunk = sermons.slice(sIdx, sIdx + 3);
            const isCarousel = secIdx % 2 === 0;

            let secTitle = '';
            if (isCarousel) {
              secTitle = secIdx === 0 ? 'Featured Anointed Preaching' : 'Revival & Bible Message Broadcasts';
            } else {
              secTitle = secIdx === 1 ? 'Expository Teaching & Messages' : 'More Anointed Sermons';
            }

            sermonSections.push({
              type: isCarousel ? 'carousel' : 'vertical',
              title: secTitle,
              items: chunk
            });

            sIdx += 3;
            secIdx++;
          }

          return sermonSections.map((sec, secIndex) => {
            if (sec.type === 'carousel') {
              return (
                <div key={`sermon_sec_car_${secIndex}`} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 tracking-wider uppercase px-1">
                    <span className="flex items-center gap-1.5 font-serif text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" /> {sec.title}
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-normal">Swipe Horizontally →</span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                    {sec.items.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setActiveSermon(s)}
                        className={`snap-center flex-shrink-0 w-72 sm:w-80 p-3 rounded-2xl bg-[#0b132b] border transition-all cursor-pointer shadow-xl space-y-2 flex flex-col justify-between ${
                          activeSermon?.id === s.id ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-400/30 hover:border-amber-400/60'
                        }`}
                      >
                        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={s.thumbnailUrl}
                            alt={s.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="p-2.5 rounded-full bg-amber-400 text-slate-950 shadow-lg hover:scale-105 transition-transform">
                              {s.audioUrl ? <Music className="w-4 h-4 text-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-[#fffbe6] line-clamp-1 font-serif">{s.title}</h4>
                          <p className="text-[11px] text-amber-300 flex items-center justify-between">
                            <span>{s.speaker}</span>
                            {s.audioUrl ? (
                              <span className="text-[9px] bg-blue-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">Audio</span>
                            ) : (
                              <span className="text-[9px] bg-blue-950 text-blue-200 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">Video</span>
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveSermonAndPostToFeed(s, `Posted "${s.title}" to Community Home Feed!`);
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 text-[11px] font-black flex items-center justify-center gap-1 active:scale-95 transition-all shadow cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Post Video to Feed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`sermon_sec_vert_${secIndex}`} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider uppercase px-1">
                    <span className="font-serif text-amber-300">{sec.title}</span>
                    <span className="text-[10px] text-blue-200 font-normal">{sec.items.length} Videos Vertical</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sec.items.map(s => (
                      <div
                        key={s.id}
                        onClick={() => setActiveSermon(s)}
                        className={`p-3 rounded-2xl bg-[#0b132b] border transition-all cursor-pointer shadow-xl space-y-2 flex flex-col justify-between ${
                          activeSermon?.id === s.id ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-400/30 hover:border-amber-400/60'
                        }`}
                      >
                        <div className="relative h-28 rounded-xl overflow-hidden bg-slate-950">
                          <img
                            src={s.thumbnailUrl}
                            alt={s.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'; }}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <div className="p-2 rounded-full bg-amber-400 text-slate-950 shadow">
                              {s.audioUrl ? <Music className="w-4 h-4 text-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-xs text-[#fffbe6] line-clamp-1 font-serif">{s.title}</h4>
                          <p className="text-[11px] text-amber-300 flex items-center justify-between">
                            <span>{s.speaker}</span>
                            {s.audioUrl ? (
                              <span className="text-[9px] bg-blue-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">Audio</span>
                            ) : (
                              <span className="text-[9px] bg-blue-950 text-blue-200 px-1.5 py-0.5 rounded border border-amber-400/30 font-bold">Video</span>
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveSermonAndPostToFeed(s, `Posted "${s.title}" to Community Home Feed!`);
                          }}
                          className="w-full py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" /> Post Video to Feed
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          });
        })()}
      </div>

      {/* ADD SERMON MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 mb-2">
                <h3 className="font-bold font-serif text-lg text-white">Post Custom Video or Sermon</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MEDIA TYPE SELECTOR TABS */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-purple-900/50">
                <button
                  type="button"
                  onClick={() => setMediaType('vimeo_rumble_mp4')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === 'vimeo_rumble_mp4'
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" /> Vimeo / MP4
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('youtube')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === 'youtube'
                      ? 'bg-red-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Youtube className="w-4 h-4" /> YouTube
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('direct_audio')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    mediaType === 'direct_audio'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileAudio className="w-4 h-4" /> Audio File
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sermon / Video Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Walking by Faith in Troubled Times..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Preacher / Speaker Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pastor David Evans"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white"
                  />
                </div>

                {/* VIMEO / RUMBLE / DIRECT MP4 OR PHONE FILE UPLOAD */}
                {mediaType === 'vimeo_rumble_mp4' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Video Link (Vimeo, Rumble, Direct MP4)</label>
                      <input
                        type="text"
                        placeholder="https://vimeo.com/... or https://rumble.com/... or .mp4 link"
                        value={videoLinkUrl}
                        onChange={(e) => setVideoLinkUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-purple-900/40"></div>
                      <span className="flex-shrink mx-2 text-[10px] text-purple-300 uppercase font-bold">Or Phone Video File Upload</span>
                      <div className="flex-grow border-t border-purple-900/40"></div>
                    </div>

                    <div className="p-4 bg-slate-950 border-2 border-dashed border-purple-800/60 rounded-xl text-center space-y-2">
                      <Upload className="w-6 h-6 text-purple-400 mx-auto" />
                      <p className="text-xs text-slate-300">Choose a video file from your phone or device</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                      />
                      {uploadedFileName && (
                        <p className="text-xs text-amber-300 font-semibold">Selected: {uploadedFileName}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* YOUTUBE INPUT */}
                {mediaType === 'youtube' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">YouTube Video Link</label>
                    <input
                      type="text"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                    />
                  </div>
                )}

                {/* DIRECT AUDIO UPLOAD OR URL */}
                {mediaType === 'direct_audio' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Audio Recording</label>
                    <div className="p-4 bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-xl text-center space-y-2">
                      <FileAudio className="w-6 h-6 text-amber-400 mx-auto" />
                      <p className="text-xs text-slate-300">Choose an audio recording from your device</p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleFileUpload(e, 'audio')}
                        className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                      />
                      {uploadedFileName && (
                        <p className="text-xs text-amber-300 font-semibold">Selected: {uploadedFileName}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Key Scripture References</label>
                  <input
                    type="text"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder="e.g. Hebrews 11:1-6, Ephesians 6"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Summary / Sermon Notes</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Key teaching points or message summary..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 transition-all"
                >
                  Publish Video & Post to Feed
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
