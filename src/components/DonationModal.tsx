import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeartHandshake, X, Check, ShieldCheck, Heart, Sparkles, CreditCard, DollarSign } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [cause, setCause] = useState<string>('App Server & Expansion Fund');
  const [donorName, setDonorName] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompleted(true);
  };

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-6 text-slate-100"
      >
        <button
          onClick={() => { setIsCompleted(false); onClose(); }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold font-serif text-white">Support Ministry Expansion</h2>
              <p className="text-xs text-purple-200/70">
                Keep Living on a Prayer ad-free, secure, and expanding for Christian families worldwide.
              </p>
            </div>

            {/* Select Quick Amounts */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Select Giving Amount ($)</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => { setAmount(val); setCustomAmount(''); }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      amount === val && !customAmount
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-950 text-slate-300 border-purple-900/40 hover:bg-purple-950'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Or Enter Custom Amount ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  placeholder="Custom amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Ministry Fund Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Direct Gift To</label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-amber-300 font-semibold"
              >
                <option value="App Server & Expansion Fund">App Server & Expansion Fund</option>
                <option value="Global Missions & Outreach">Global Missions & Outreach</option>
                <option value="Community Food Pantry Relief">Community Food Pantry Relief</option>
                <option value="Free Gospel Tract Distribution">Free Gospel Tract Distribution</option>
              </select>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name / Anonymity</label>
                <input
                  type="text"
                  placeholder="Leave blank to give anonymously..."
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Give ${finalAmount} Gift Now
              </button>
            </form>
          </div>
        ) : (
          /* Thank you receipt */
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h2 className="text-xl font-bold font-serif text-white">May God Richly Bless You!</h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Your faithful offering of <strong className="text-amber-300">${finalAmount}</strong> to {cause} helps keep Living on a Prayer thriving.
            </p>
            <p className="text-xs text-purple-300 italic font-serif">
              "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver." — 2 Corinthians 9:7
            </p>
            <button
              onClick={() => { setIsCompleted(false); onClose(); }}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700"
            >
              Close Receipt
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
