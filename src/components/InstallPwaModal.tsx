import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Share, PlusSquare, Check, Sparkles } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => window.deferredPwaPrompt || null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (window.deferredPwaPrompt) {
      setDeferredPrompt(window.deferredPwaPrompt);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('Install prompt note:', err);
      }
      setDeferredPrompt(null);
      window.deferredPwaPrompt = null;
    } else {
      alert("To install on Android: Tap the 3 dots (⋮) in Chrome menu and tap 'Add to Home Screen' or 'Install App'.\n\nOn iPhone: Tap Share button in Safari and tap 'Add to Home Screen'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-5 text-slate-100 space-y-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-amber-400 p-0.5 rounded-2xl shadow-xl mx-auto flex items-center justify-center overflow-hidden">
            <img src="./icon-512.png" alt="Living on a Prayer App Icon" className="w-full h-full object-cover rounded-[14px]" />
          </div>
          <h2 className="text-xl font-bold font-serif text-white">Install Lights Out Baptist App</h2>
          <p className="text-xs text-purple-200/80">
            Install directly to your iPhone, Android, or Desktop home screen to bypass App Stores with fast instant access!
          </p>
        </div>

        {isInstalled ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-400 mx-auto stroke-[3]" />
            <p className="font-bold text-sm text-emerald-300">App Installed on Your Device!</p>
            <p className="text-xs text-slate-300">You can now launch Lights Out Baptist directly from your home screen anytime.</p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-purple-600 text-slate-950 font-bold text-sm shadow-xl hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-5 h-5" /> Install Now to Home Screen
            </button>

            <div className="space-y-2 bg-slate-950 border border-purple-900/50 p-3.5 rounded-xl">
              <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Quick Home Screen Instructions:
              </p>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-purple-400">iOS (iPhone/iPad):</span>
                  <span>Tap <strong>Share <Share className="w-3.5 h-3.5 inline text-amber-300" /></strong> in Safari, then tap <strong>"Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-amber-300" />"</strong>.</span>
                </div>
                <div className="flex items-start gap-2 border-t border-slate-800 pt-2">
                  <span className="font-bold text-purple-400">Android / Chrome:</span>
                  <span>Tap Chrome menu <strong>(⋮)</strong> and select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};
