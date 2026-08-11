import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cross, BookOpen, Heart, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, User as UserIcon } from 'lucide-react';
import { GOSPEL_TRACT } from '../data/initialData';

interface SplashScreenProps {
  onEnter: () => void;
  onOpenAuth: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter, onOpenAuth }) => {
  const [showTract, setShowTract] = useState(false);
  const [acceptedPrayer, setAcceptedPrayer] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#081229] via-[#1d4ed8] to-[#081229] text-[#fffbe6] overflow-hidden px-4 py-3 sm:py-5 h-dvh">
      {/* Background glowing cross effect */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
        <Cross className="w-80 h-80 sm:w-96 sm:h-96 text-amber-300 blur-sm" />
      </div>

      {/* Header Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 bg-blue-950/80 border border-amber-400/40 px-3 py-1 rounded-full backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xl z-10 shrink-0"
      >
        <Sparkles className="w-3 h-3 text-amber-300" />
        Welcome to Living on a Prayer
      </motion.div>

      {/* Hero Content */}
      <div className="max-w-md w-full text-center space-y-2.5 sm:space-y-4 my-auto relative z-10 py-1 flex-1 flex flex-col justify-center items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative inline-block mx-auto"
        >
          {/* Main App Icon Logo Emblem */}
          <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-2xl p-1 bg-gradient-to-tr from-amber-300 via-amber-500 to-amber-200 shadow-xl shadow-blue-900/60 overflow-hidden relative">
            <div className="w-full h-full bg-[#0a142f] rounded-[14px] sm:rounded-[18px] flex flex-col items-center justify-center p-2 relative overflow-hidden border border-amber-300/40">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-amber-400/20 to-transparent blur-md"></div>
              <Cross className="w-9 h-9 sm:w-12 sm:h-12 text-amber-300 fill-amber-400/30 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)] relative z-10" />
              <span className="text-[8px] sm:text-[10px] text-amber-300 font-black tracking-widest uppercase mt-0.5 relative z-10">
                Lights Out
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
            <Cross className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-[#fffbe6] font-serif uppercase">
            Living on a Prayer
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm max-w-xs mx-auto leading-normal">
            Lights Out Baptist Church — Prayer, scripture, fellowship & holy community free from worldly noise.
          </p>
        </motion.div>

        {/* Gospel Tract Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0b132b]/90 border border-amber-400/30 rounded-xl p-3 sm:p-4 text-left shadow-xl space-y-2 backdrop-blur-sm w-full max-w-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-300" /> Gospel Tract
            </span>
            <button 
              onClick={() => setShowTract(!showTract)}
              className="text-[11px] sm:text-xs text-amber-300/90 hover:text-amber-300 underline font-semibold cursor-pointer"
            >
              {showTract ? 'Close Tract' : 'Read Good News'}
            </button>
          </div>

          <p className="text-[11px] sm:text-xs text-blue-100 italic border-l-2 border-amber-400 pl-2 py-0.5 leading-snug">
            "{GOSPEL_TRACT.subtitle}"
            <span className="block font-semibold text-amber-300 not-italic mt-0.5 text-[10px] sm:text-[11px]">{GOSPEL_TRACT.keyVerse}</span>
          </p>

          {showTract && (
            <div className="space-y-2 pt-1 text-[11px] sm:text-xs text-blue-100 max-h-48 overflow-y-auto pr-1">
              {GOSPEL_TRACT.steps.map((step) => (
                <div key={step.number} className="bg-blue-950/60 p-2 rounded-lg border border-amber-400/20">
                  <span className="font-bold text-amber-300 mr-1">{step.number}. {step.heading}:</span>
                  <p className="mt-0.5 text-blue-100 leading-snug">{step.text}</p>
                </div>
              ))}

              <div className="bg-amber-950/30 border border-amber-400/40 p-2.5 rounded-xl mt-2 space-y-1.5">
                <p className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Sinner's Prayer of Salvation:
                </p>
                <p className="italic text-[#fffbe6] text-[10px] leading-snug bg-[#081229] p-1.5 rounded border border-amber-400/30">
                  "{GOSPEL_TRACT.sinnersPrayer}"
                </p>
                <button
                  onClick={() => setAcceptedPrayer(true)}
                  className={`w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    acceptedPrayer 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-md font-black'
                  }`}
                >
                  {acceptedPrayer ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Amen! I Prayed This Prayer
                    </>
                  ) : (
                    <>
                      <Heart className="w-3.5 h-3.5" /> Accept Christ & Pray Now
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-xs sm:max-w-sm w-full space-y-2 relative z-10 shrink-0 mb-1"
      >
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          Sign In / Create Account
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
        </button>

        <button
          onClick={onEnter}
          className="w-full py-2 sm:py-2.5 px-5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-amber-400/40 text-amber-200 font-bold text-xs shadow-lg backdrop-blur-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserIcon className="w-3.5 h-3.5 text-amber-300" />
          Continue as Guest
        </button>
      </motion.div>
    </div>
  );
};
