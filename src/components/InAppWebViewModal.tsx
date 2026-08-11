import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ExternalLink, RefreshCw, ShieldCheck, Copy, Check, Globe, Newspaper, X, Play, Youtube, Sparkles, BookOpen } from 'lucide-react';

export interface WebViewTarget {
  url: string;
  title?: string;
  sourceName?: string;
  categoryName?: string;
}

interface InAppWebViewModalProps {
  isOpen: boolean;
  target: WebViewTarget | null;
  onClose: () => void;
}

export const InAppWebViewModal: React.FC<InAppWebViewModalProps> = ({
  isOpen,
  target,
  onClose
}) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);

  if (!isOpen || !target) return null;

  const getDomainName = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace('www.', '');
    } catch {
      return 'external-website.com';
    }
  };

  const domain = getDomainName(target.url);

  const isYouTube = target.url.includes('youtube.com') || target.url.includes('youtu.be');
  const isYouTubeChannel = isYouTube && (target.url.includes('/@') || target.url.includes('/channel/') || target.url.includes('/c/'));

  const getYouTubeEmbedUrl = (urlStr: string) => {
    if (urlStr.includes('youtu.be/')) {
      const id = urlStr.split('youtu.be/')[1]?.split('?')[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    if (urlStr.includes('watch?v=')) {
      const id = urlStr.split('watch?v=')[1]?.split('&')[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    return urlStr;
  };

  const iframeUrl = isYouTube && !isYouTubeChannel ? getYouTubeEmbedUrl(target.url) : target.url;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(target.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setLoading(true);
    setKey(prev => prev + 1);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100">
        {/* TOP BREADCRUMBS & APP RETURN HEADER */}
        <header className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-500/30 px-3 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xl z-20">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onClose}
              className="py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Return to App</span>
            </button>

            {/* Breadcrumb path text */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-purple-200/80 truncate">
              <span className="text-slate-400">Living on a Prayer</span>
              <span>/</span>
              <span className="text-purple-300 font-semibold">{target.categoryName || 'News & Web'}</span>
              <span>/</span>
              <span className="text-amber-300 font-bold truncate max-w-[200px]">{domain}</span>
            </div>
          </div>

          {/* Source Title & Header Label */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs bg-purple-950/80 px-3 py-1.5 rounded-xl border border-purple-800/50">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-purple-200">{target.sourceName || domain}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Web Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* WEBVIEW ADDRESS & CONTROLS TOOLBAR */}
        <div className="bg-slate-900 border-b border-purple-900/40 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs shadow-md z-10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md flex-shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">HTTPS</span>
            </div>

            {/* Address Bar */}
            <div className="flex-1 bg-slate-950 border border-purple-900/50 rounded-xl px-3 py-1.5 text-slate-300 text-xs truncate font-mono select-all">
              {target.url}
            </div>
          </div>

          {/* Webview Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Reload Page"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title="Copy Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px] font-medium">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-2.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-amber-300 border border-purple-800/50 text-[11px] font-bold flex items-center gap-1 transition-all"
              title="Open in External Browser"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Browser</span>
            </a>
          </div>
        </div>

        {/* WEBVIEW MAIN CONTENT CONTAINER */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden flex flex-col">
          {isYouTubeChannel ? (
            /* Dedicated YouTube Channel Hub for handles like @lighthousewinc */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 bg-red-600/20 border border-red-500/50 rounded-2xl flex items-center justify-center mx-auto text-red-500 shadow-xl">
                  <Youtube className="w-10 h-10" />
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Official YouTube Channel
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                    {target.title || 'Lighthouse Baptist Church (Winchester)'}
                  </h2>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Watch live Sunday services, midweek Bible preachings, and worship praise broadcasts.
                  </p>
                </div>

                {/* Primary Launch Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={target.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Youtube className="w-5 h-5 fill-white stroke-white" />
                    Open Channel in YouTube App / Browser
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shadow flex items-center justify-center gap-2"
                  >
                    Return to App
                  </button>
                </div>
              </div>

              {/* Embedded Video Stream Player for Church Sermons */}
              <div className="bg-slate-900 border border-purple-800/40 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-serif">
                    <Play className="w-4 h-4 fill-amber-300" /> Featured Service & Worship Video
                  </span>
                  <span className="text-[10px] text-purple-300">Live Embed Player</span>
                </div>

                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-purple-900/50 shadow-2xl">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/EdtUcXzIDaOpOSMa?rel=0"
                    title="Lighthouse Baptist Church Video Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              <div className="bg-slate-900/60 border border-purple-900/30 p-4 rounded-xl text-center space-y-1 text-xs text-slate-400">
                <p>💡 <strong className="text-slate-200">Notice:</strong> YouTube policies require channel homepages to open in the YouTube App or browser.</p>
              </div>
            </div>
          ) : (
            /* Standard Webview / Video Embed iframe */
            <>
              {loading && (
                <div className="absolute inset-0 z-10 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-amber-300 font-semibold font-serif">Loading page in Webview...</p>
                  <p className="text-[11px] text-purple-200/70 max-w-sm text-center">
                    Fetching content from {domain}. Click "Return to App" above anytime to return.
                  </p>
                </div>
              )}

              <iframe
                key={key}
                src={iframeUrl}
                title={target.title || "Webview Story"}
                onLoad={() => setLoading(false)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 max-w-md w-11/12 bg-slate-900/95 border border-purple-500/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Reading <strong className="text-white">{target.title || 'Story'}</strong> in-app.
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="py-1 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] rounded-lg shadow whitespace-nowrap"
                >
                  Back to App
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
