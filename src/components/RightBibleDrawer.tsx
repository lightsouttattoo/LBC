import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, BookOpen, ExternalLink, Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { BIBLE_BOOKS } from '../data/initialData';
import { getChapterVerses, fetchChapterVersesAsync, searchBibleAsync, getBibleGatewayUrl, BIBLE_CHAPTER_COUNTS } from '../services/bibleService';
import { BibleVerse } from '../types';

interface RightBibleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWebView?: (url: string, title?: string, sourceName?: string, categoryName?: string) => void;
}

export const RightBibleDrawer: React.FC<RightBibleDrawerProps> = ({ isOpen, onClose, onOpenWebView }) => {
  const [selectedBook, setSelectedBook] = useState('John');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleVerse[]>([]);
  const [copiedVerse, setCopiedVerse] = useState<string | null>(null);
  
  const [verses, setVerses] = useState<BibleVerse[]>(() => getChapterVerses('John', 3));
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Total chapters for selected book
  const totalChapters = BIBLE_CHAPTER_COUNTS[selectedBook] || 30;

  // Load verses whenever book or chapter changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Initial sync check
    const local = getChapterVerses(selectedBook, selectedChapter);
    if (local.length > 0) {
      setVerses(local);
      setLoading(false);
    }

    // Async fetch complete KJV chapter
    fetchChapterVersesAsync(selectedBook, selectedChapter).then((data) => {
      if (isMounted) {
        setVerses(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedBook, selectedChapter]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await searchBibleAsync(searchQuery);
    setSearchResults(res);
    setIsSearching(false);
  };

  const copyToClipboard = (verse: BibleVerse) => {
    const text = `"${verse.text}" — ${verse.book} ${verse.chapter}:${verse.verse} (KJV)`;
    navigator.clipboard?.writeText?.(text);
    setCopiedVerse(`${verse.book}_${verse.chapter}_${verse.verse}`);
    setTimeout(() => setCopiedVerse(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Right Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-sm sm:max-w-md bg-[#081229] border-l border-amber-400/30 text-[#fffbe6] flex flex-col h-full shadow-2xl z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border-b border-amber-400/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-400/20 border border-amber-400/40 rounded-lg text-amber-300 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold font-serif text-sm text-[#fffbe6]">Holy Bible (KJV)</h2>
                  <p className="text-[10px] text-amber-300 font-medium">Complete Genesis to Revelation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-blue-950/80 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-blue-950/60 border-b border-amber-400/20">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-amber-300" />
                <input
                  type="text"
                  placeholder="Search Scripture or verse (e.g. John 3:16, Faith)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value) setSearchResults([]);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-[#0b132b] border border-amber-400/30 rounded-xl text-xs text-[#fffbe6] placeholder-blue-300/50 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-2 py-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 rounded-lg text-[10px] font-extrabold"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin text-slate-950" /> : 'Go'}
                </button>
              </form>
            </div>

            {/* Book & Chapter Nav Selector */}
            {searchResults.length === 0 && (
              <div className="p-3 bg-blue-950/40 border-b border-amber-400/20 flex gap-2">
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setSelectedChapter(1);
                  }}
                  className="flex-1 bg-[#0b132b] border border-amber-400/30 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                >
                  {BIBLE_BOOKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="w-32 bg-[#0b132b] border border-amber-400/30 rounded-lg px-2 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                >
                  {Array.from({ length: totalChapters }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Main Bible Text Reader Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Search Results Mode */}
              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                    <span>Found {searchResults.length} verses for "{searchQuery}"</span>
                    <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-purple-300 hover:underline">
                      Clear Search
                    </button>
                  </div>
                  {searchResults.map((v, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-purple-900/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                        <span>{v.book} {v.chapter}:{v.verse}</span>
                        <button onClick={() => copyToClipboard(v)} className="text-purple-300 hover:text-white">
                          {copiedVerse === `${v.book}_${v.chapter}_${v.verse}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 font-serif leading-relaxed">"{v.text}"</p>
                    </div>
                  ))}
                </div>
              ) : loading ? (
                <div className="py-20 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                  <p className="text-xs text-purple-200">Loading {selectedBook} Chapter {selectedChapter} (KJV)...</p>
                </div>
              ) : (
                /* Chapter View Mode */
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                    <h3 className="text-base font-bold font-serif text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      {selectedBook} Chapter {selectedChapter}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const url = getBibleGatewayUrl(selectedBook, selectedChapter);
                        if (onOpenWebView) {
                          onOpenWebView(url, `${selectedBook} ${selectedChapter} - Bible Gateway`, 'Bible Gateway', 'Holy Bible');
                        } else {
                          window.open(url, '_blank');
                        }
                      }}
                      className="text-[11px] text-purple-300 hover:text-amber-200 flex items-center gap-1 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40 font-semibold transition-all"
                    >
                      Bible Gateway <ExternalLink className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    {verses.length > 0 ? (
                      verses.map((v) => (
                        <div 
                          key={v.verse} 
                          className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-purple-900/30 transition-colors space-y-1 group"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400/90">
                            <span>Verse {v.verse}</span>
                            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100">
                              <button
                                onClick={() => copyToClipboard(v)}
                                className="text-purple-300 hover:text-amber-300 transition-colors"
                                title="Copy Verse"
                              >
                                {copiedVerse === `${v.book}_${v.chapter}_${v.verse}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 font-serif leading-relaxed">
                            <sup className="text-amber-400 font-sans font-bold mr-1">{v.verse}</sup>
                            {v.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6 italic">No verses found for this chapter.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-3 bg-slate-900/90 border-t border-purple-900/30 text-center text-[10px] text-slate-400">
              Authorized King James Version (KJV) • Complete 66 Books
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
