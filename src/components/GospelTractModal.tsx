import React from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, Heart, Cross, Sparkles } from 'lucide-react';
import { GOSPEL_TRACT } from '../data/initialData';

interface GospelTractModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GospelTractModal: React.FC<GospelTractModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto space-y-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <Cross className="w-6 h-6 fill-amber-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">{GOSPEL_TRACT.title}</h2>
          <p className="text-xs text-amber-300 font-serif italic border-l-2 border-amber-400 pl-2 py-1 max-w-xs mx-auto">
            "{GOSPEL_TRACT.subtitle}" — {GOSPEL_TRACT.keyVerse}
          </p>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          {GOSPEL_TRACT.steps.map(step => (
            <div key={step.number} className="bg-slate-950 border border-purple-900/40 p-3 rounded-xl space-y-1">
              <span className="font-bold text-amber-300 text-sm block">
                {step.number}. {step.heading}
              </span>
              <p className="text-slate-300 leading-relaxed">{step.text}</p>
            </div>
          ))}

          <div className="bg-gradient-to-r from-purple-950 to-slate-950 border border-amber-400/40 p-4 rounded-xl space-y-2 text-center">
            <p className="font-bold text-amber-300 flex items-center justify-center gap-1.5 text-xs">
              <Heart className="w-4 h-4 fill-amber-400" /> Sinner's Prayer of Salvation
            </p>
            <p className="italic text-slate-200 text-xs leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-purple-800/30">
              "{GOSPEL_TRACT.sinnersPrayer}"
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white"
        >
          Amen • Close Gospel Tract
        </button>
      </motion.div>
    </div>
  );
};
