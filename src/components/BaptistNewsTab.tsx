import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Sparkles, Clock, Globe, Film, Play, X, Share2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsArticle, fetchLiveBaptistNews } from '../data/baptistNewsData';

interface BaptistNewsTabProps {
  onOpenWebView: (url: string, title?: string, sourceName?: string, categoryName?: string) => void;
}

export const BaptistNewsTab: React.FC<BaptistNewsTabProps> = ({ onOpenWebView }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const loadNews = async () => {
    setLoading(true);
    const articles = await fetchLiveBaptistNews();
    setNews(articles);
    setLoading(false);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  useEffect(() => {
    loadNews();
  }, []);

  // Group news articles into alternating sections: Carousel (3 articles) -> Vertical (3 articles)...
  const newsSections: { type: 'carousel' | 'vertical'; title: string; articles: NewsArticle[] }[] = [];
  let aIdx = 0;
  let sIndex = 0;

  while (aIdx < news.length) {
    const chunk = news.slice(aIdx, aIdx + 3);
    const isCarousel = sIndex % 2 === 0;

    let secTitle = '';
    if (isCarousel) {
      secTitle = sIndex === 0 ? 'Breaking Christian News & Headlines' : 'Global Baptist Mission Reports';
    } else {
      secTitle = sIndex === 1 ? 'National Revival & Evangelism Wire' : 'Believer Ministry Updates';
    }

    newsSections.push({
      type: isCarousel ? 'carousel' : 'vertical',
      title: secTitle,
      articles: chunk
    });

    aIdx += 3;
    sIndex++;
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-24 space-y-6 text-[#fffbe6]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border border-amber-400/40 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/20 border border-amber-400/40 rounded-xl text-amber-300 shadow">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#fffbe6] font-serif">Baptist & Christian News Network</h2>
            <p className="text-xs text-blue-200">Live RSS news feed from Baptist Press, evangelism reports & global missions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-amber-300 font-semibold hidden sm:inline">Refreshed: {lastRefreshed}</span>
          <button
            onClick={loadNews}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh News Feed"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh RSS Feed</span>
          </button>
        </div>
      </div>

      {/* News Feed Sections (Alternating Horizontal / Vertical Flow) */}
      {loading ? (
        <div className="py-16 text-center text-amber-300 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-400" />
          <p className="text-xs font-serif">Fetching live Christian RSS news feed...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {newsSections.map((sec, secIdx) => {
            if (sec.type === 'carousel') {
              return (
                <div key={`news_carousel_${secIdx}`} className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300 tracking-wider uppercase px-1">
                    <span className="flex items-center gap-1.5 font-serif">
                      <Sparkles className="w-4 h-4 text-amber-400" /> {sec.title}
                    </span>
                    <span className="text-[10px] text-amber-300/80 font-normal">Swipe Horizontally →</span>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
                    {sec.articles.map(article => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="snap-center flex-shrink-0 w-72 sm:w-80 bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
                      >
                        {article.imageUrl ? (
                          <div className="h-40 w-full bg-slate-950 relative overflow-hidden">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                              {article.category}
                            </span>
                            <span className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-amber-400" /> Open Popout
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-gradient-to-r from-blue-950 to-[#0b132b] border-b border-amber-400/20 flex items-center justify-between">
                            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                              {article.category}
                            </span>
                          </div>
                        )}

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-blue-200">
                              <span className="font-semibold text-amber-400 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-amber-400" /> {article.source}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" /> {article.publishedAt}
                              </span>
                            </div>

                            <h3 className="font-bold text-sm text-[#fffbe6] font-serif line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                              {article.title}
                            </h3>

                            <p className="text-xs text-blue-100/80 leading-relaxed line-clamp-2">
                              {article.summary}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-amber-400/20 mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenWebView(article.url, article.title, article.source, 'Baptist RSS Feed');
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1.5 rounded-xl shadow hover:brightness-110 active:scale-95 transition-all"
                            >
                              Read Story <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`news_vertical_${secIdx}`} className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 tracking-wider uppercase px-1">
                    <span className="font-serif text-amber-300">{sec.title}</span>
                    <span className="text-[10px] text-blue-200 font-normal">{sec.articles.length} Stories Vertical</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {sec.articles.map(article => (
                      <div
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="bg-[#0b132b] border border-amber-400/30 hover:border-amber-400/60 rounded-2xl overflow-hidden shadow-xl cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
                      >
                        {article.imageUrl && (
                          <div className="h-40 w-full bg-slate-950 relative overflow-hidden">
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                              {article.category}
                            </span>
                            <span className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-amber-400/30 flex items-center gap-1">
                              <Eye className="w-3 h-3 text-amber-400" /> Open Popout
                            </span>
                          </div>
                        )}

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-blue-200">
                              <span className="font-semibold text-amber-400 flex items-center gap-1">
                                <Globe className="w-3 h-3 text-amber-400" /> {article.source}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" /> {article.publishedAt}
                              </span>
                            </div>

                            <h3 className="font-bold text-sm text-[#fffbe6] font-serif line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                              {article.title}
                            </h3>

                            <p className="text-xs text-blue-100/80 leading-relaxed line-clamp-3">
                              {article.summary}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-amber-400/20 mt-2 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedArticle(article);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition-colors bg-blue-950 px-3 py-1.5 rounded-xl border border-amber-400/30"
                            >
                              Popout Article <Eye className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* POPOUT ARTICLE MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#0b132b] border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-100"
            >
              {/* Header */}
              <div className="p-4 bg-[#081229] border-b border-amber-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/30">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> {selectedArticle.source}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#fffbe6] leading-snug">
                  {selectedArticle.title}
                </h2>

                <div className="text-xs text-blue-200 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Published {selectedArticle.publishedAt}</span>
                </div>

                {selectedArticle.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-amber-400/40 bg-slate-950 flex items-center justify-center p-2 min-h-[220px] max-h-[60vh] sm:max-h-[70vh] shadow-2xl">
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=800'; }}
                      className="max-h-[55vh] sm:max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )}

                <div className="p-4 bg-[#081229] border border-amber-400/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-serif">Report Summary</h4>
                  <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-sans whitespace-pre-line">
                    {selectedArticle.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-400/20 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onOpenWebView(selectedArticle.url, selectedArticle.title, selectedArticle.source, 'Baptist RSS Feed');
                    }}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <span>Read Full Web Story In App</span>
                    <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText?.(selectedArticle.url);
                        alert('Article URL copied to clipboard!');
                      } catch (e) {}
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-blue-950 text-blue-200 hover:text-white border border-amber-400/30 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" /> Share Story
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
