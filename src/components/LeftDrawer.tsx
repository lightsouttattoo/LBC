import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User as UserIcon, LogOut, HeartHandshake, MessageSquare, BookOpen, Share2, Sparkles, Shield, Bookmark, Cross, Smartphone } from 'lucide-react';
import { User, DailyVerse } from '../types';
import { DAILY_VERSES } from '../data/initialData';

interface LeftDrawerProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onOpenDonate: () => void;
  onOpenDMs: (targetUserId?: string) => void;
  onOpenGospelTract: () => void;
  onOpenInstallPwa?: () => void;
  onOpenBibleStudy?: () => void;
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({
  isOpen,
  user,
  onClose,
  onOpenProfile,
  onLogout,
  onOpenDonate,
  onOpenDMs,
  onOpenGospelTract,
  onOpenInstallPwa,
  onOpenBibleStudy
}) => {
  // Rotate verse of the day
  const todayVerse: DailyVerse = DAILY_VERSES[0];
  const [copiedVerse, setCopiedVerse] = React.useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-xs sm:max-w-sm bg-[#081229] border-r border-amber-400/30 text-[#fffbe6] flex flex-col justify-between h-[100dvh] max-h-[100dvh] shadow-2xl z-10 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-3 sm:p-4 border-b border-amber-400/30 flex items-center justify-between bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Cross className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span className="font-bold font-serif text-xs sm:text-sm text-[#fffbe6] uppercase tracking-wider">Living on a Prayer</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-blue-950/60 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {/* BEAUTIFUL BIBLE VERSE OF THE DAY CARD (Vivid Blue & Gold) */}
              <div className="relative bg-gradient-to-br from-[#1d4ed8] via-[#1e40af] to-[#0f172a] rounded-xl p-3 shadow-lg space-y-2 overflow-hidden border border-amber-400/30">
                <div className="flex items-center justify-between text-amber-300 text-[10px] font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" /> Daily Manna
                  </span>
                  <span className="text-[9px] text-blue-200 font-normal">KJV Manna</span>
                </div>

                <blockquote className="text-xs text-[#fffbe6] italic leading-snug font-serif">
                  "{todayVerse.verse.text}"
                </blockquote>

                <div className="flex items-center justify-between pt-1 border-t border-amber-400/30 text-[10px]">
                  <span className="font-bold text-amber-300">
                    — {todayVerse.verse.book} {todayVerse.verse.chapter}:{todayVerse.verse.verse}
                  </span>
                  <button 
                    onClick={() => {
                      try {
                        navigator.clipboard?.writeText?.(`${todayVerse.verse.text} - ${todayVerse.verse.book} ${todayVerse.verse.chapter}:${todayVerse.verse.verse}`);
                      } catch (e) {
                        console.error(e);
                      }
                      setCopiedVerse(true);
                      setTimeout(() => setCopiedVerse(false), 2500);
                    }}
                    className="text-blue-100 hover:text-white p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    title="Share Verse"
                  >
                    {copiedVerse ? <span className="text-amber-300 font-bold">Copied!</span> : <Share2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* LOGGED IN USER CARD */}
              <div 
                onClick={() => { onOpenProfile(); onClose(); }}
                className="bg-blue-950/50 border border-amber-400/20 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-blue-900/40 transition-all shadow-md group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 p-[1.5px] flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#fffbe6] truncate">{user.name}</h3>
                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-200/80 truncate mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* MENU NAVIGATION LINKS */}
              <div className="space-y-1 pt-1">
                <button
                  onClick={() => { onOpenProfile(); onClose(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-blue-100 hover:bg-blue-900/50 transition-all text-xs font-semibold cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-amber-300" />
                  Personal Profile
                </button>

                <button
                  onClick={() => { onOpenGospelTract(); onClose(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-blue-100 hover:bg-blue-900/50 transition-all text-xs font-semibold cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Gospel Tract & Salvation Plan
                </button>

                {onOpenBibleStudy && (
                  <button
                    onClick={() => { onOpenBibleStudy(); onClose(); }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20 transition-all text-xs font-bold cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    Books of the Bible Study
                  </button>
                )}

                {onOpenInstallPwa && (
                  <button
                    onClick={() => { onOpenInstallPwa(); onClose(); }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-amber-300 hover:bg-blue-900/50 transition-all text-xs font-semibold cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    Install App to Home Screen
                  </button>
                )}

                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-red-300 hover:bg-red-950/40 transition-all text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* BOTTOM DRAWER ACTIONS: DONATE & DMs BUTTONS */}
            <div className="p-3 sm:p-4 border-t border-amber-400/30 bg-[#081229] space-y-2 flex-shrink-0">
              <button
                onClick={() => { onOpenDMs(); onClose(); }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-[#fffbe6] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-blue-400/40"
              >
                <MessageSquare className="w-4 h-4 text-amber-300" />
                Direct Messages (DMs)
              </button>

              <button
                onClick={() => { onOpenDonate(); onClose(); }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 fill-slate-950" />
                GIVE & BLESS
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
