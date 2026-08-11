import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Youtube, Image as ImageIcon, Video, Check, X, Film, Play } from 'lucide-react';

interface MediaInputPickerProps {
  label?: string;
  value?: string; // Current image URL or video URL
  youtubeId?: string; // Current YouTube ID if applicable
  onChange: (data: { mediaUrl?: string; videoUrl?: string; youtubeId?: string; mediaType?: 'image' | 'video' }) => void;
  acceptType?: 'image' | 'video' | 'both';
  placeholder?: string;
}

export const MediaInputPicker: React.FC<MediaInputPickerProps> = ({
  label = "Add Media (Photo, Video, Vimeo, Rumble, YouTube)",
  value = "",
  youtubeId = "",
  onChange,
  acceptType = "both",
  placeholder = "Paste Video URL (YouTube, Vimeo, Rumble, MP4) or Photo URL"
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'youtube'>('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [ytInput, setYtInput] = useState(youtubeId ? `https://youtube.com/watch?v=${youtubeId}` : '');
  const [fileName, setFileName] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract YouTube ID
  const extractYouTubeId = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.trim().match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Helper to extract Vimeo ID
  const extractVimeoId = (url: string) => {
    const match = url.trim().match(/vimeo\.com\/(?:.*\/)?(\d+)/);
    return match ? match[1] : '';
  };

  // Handle direct file upload from phone gallery, camera, or file system
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    const isVideo = file.type.startsWith('video/') || file.type.startsWith('audio/');
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploading(false);
      if (isVideo) {
        onChange({ videoUrl: dataUrl, mediaType: 'video' });
      } else {
        onChange({ mediaUrl: dataUrl, mediaType: 'image' });
      }
    };

    reader.onerror = () => {
      setUploading(false);
      alert("Error reading file from device.");
    };

    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    // 1. YouTube link
    const extractedYt = extractYouTubeId(trimmed);
    if (extractedYt) {
      onChange({ youtubeId: extractedYt, videoUrl: `https://www.youtube.com/watch?v=${extractedYt}`, mediaType: 'video' });
      return;
    }

    // 2. Vimeo link
    const vimeoId = extractVimeoId(trimmed);
    if (vimeoId) {
      const vimeoEmbed = `https://player.vimeo.com/video/${vimeoId}`;
      onChange({ videoUrl: vimeoEmbed, mediaType: 'video' });
      return;
    }

    // 3. Rumble link
    if (trimmed.includes('rumble.com')) {
      onChange({ videoUrl: trimmed, mediaType: 'video' });
      return;
    }

    // 4. Direct video file (mp4, webm, mov, ogg, etc)
    if (trimmed.match(/\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i) || trimmed.includes('video') || trimmed.includes('stream')) {
      onChange({ videoUrl: trimmed, mediaType: 'video' });
      return;
    }

    // 5. Image fallback
    onChange({ mediaUrl: trimmed, mediaType: 'image' });
  };

  const handleYouTubeSubmit = () => {
    const trimmed = ytInput.trim();
    const extracted = extractYouTubeId(trimmed);
    if (extracted) {
      onChange({ youtubeId: extracted, videoUrl: `https://www.youtube.com/watch?v=${extracted}`, mediaType: 'video' });
    } else if (trimmed.length === 11) {
      onChange({ youtubeId: trimmed, videoUrl: `https://www.youtube.com/watch?v=${trimmed}`, mediaType: 'video' });
    } else {
      alert("Please paste a standard YouTube, Vimeo, or video link.");
    }
  };

  return (
    <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-2xl border border-purple-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-amber-400" />
          {label}
        </label>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-purple-900/40 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              activeMode === 'upload' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Device File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              activeMode === 'url' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Video/Image Link</span>
          </button>

          {acceptType !== 'image' && (
            <button
              type="button"
              onClick={() => setActiveMode('youtube')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                activeMode === 'youtube' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Youtube className="w-3 h-3 text-red-600" />
              <span>YouTube</span>
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: DIRECT FILE UPLOAD FROM PHONE / DEVICE */}
      {activeMode === 'upload' && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={
              acceptType === 'image'
                ? "image/*"
                : acceptType === 'video'
                ? "video/*,audio/*"
                : "image/*,video/*,audio/*"
            }
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-purple-500/40 hover:border-amber-400/80 bg-slate-900/80 hover:bg-purple-950/40 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5"
          >
            <div className="p-2.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Upload className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
            </div>
            <p className="text-xs font-bold text-white">
              {uploading ? "Processing device video file..." : "Tap to choose Photo or Video from Phone"}
            </p>
            <p className="text-[10px] text-purple-300">
              Supports MP4, MOV, WebM, photos, or recordings directly from phone gallery
            </p>
          </div>

          {fileName && (
            <div className="flex items-center justify-between bg-purple-950/80 p-2 px-3 rounded-lg text-xs text-amber-300 font-medium">
              <span className="truncate">Selected File: {fileName}</span>
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
          )}
        </div>
      )}

      {/* MODE 2: DIRECT URL (Vimeo, Rumble, MP4, WebM, Photos) */}
      {activeMode === 'url' && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-slate-900 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all whitespace-nowrap"
            >
              Attach Link
            </button>
          </div>
          <p className="text-[10px] text-purple-300/80 px-1">
            Tip: Supports Vimeo (vimeo.com), Rumble, MP4 direct video URLs, or image links.
          </p>
        </div>
      )}

      {/* MODE 3: YOUTUBE LINK */}
      {activeMode === 'youtube' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            placeholder="e.g. https://www.youtube.com/watch?v=..."
            className="flex-1 px-3 py-2 bg-slate-900 border border-purple-900/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={handleYouTubeSubmit}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition-all whitespace-nowrap"
          >
            Attach YouTube
          </button>
        </div>
      )}

      {/* Current Preview */}
      {(value || youtubeId) && (
        <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-[11px] text-purple-300">
          <span className="truncate max-w-[280px] font-semibold text-amber-300 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            Active: {youtubeId ? `YouTube Video ID (${youtubeId})` : value.startsWith('data:') ? 'Device Video File Uploaded' : value.includes('vimeo') ? 'Vimeo Video Stream' : value.includes('rumble') ? 'Rumble Video Stream' : 'Video/Media Attachment Ready'}
          </span>
          <button
            type="button"
            onClick={() => {
              setUrlInput('');
              setYtInput('');
              setFileName('');
              onChange({ mediaUrl: '', videoUrl: '', youtubeId: '' });
            }}
            className="text-red-400 hover:underline text-[10px] flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>
      )}
    </div>
  );
};
