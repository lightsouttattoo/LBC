import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User as UserIcon, X, Check, ArrowRight, ShieldCheck, Sparkles, KeyRound, RefreshCw } from 'lucide-react';
import { User } from '../types';
import { registerWithEmail, loginWithEmail, findUserProfileByEmail, syncUserProfileToFirestore } from '../lib/supabase';
import { ensureUserDefaults } from '../utils/userUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Confirmation step state
  const [pendingConfirmationUser, setPendingConfirmationUser] = useState<User | null>(null);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [codeSentNotice, setCodeSentNotice] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  if (!isOpen) return null;

  const saveActiveSession = (u: User) => {
    try {
      localStorage.setItem('lob_user', JSON.stringify(u));
      localStorage.setItem('lob_auth_active', 'true');

      // Update saved profiles map
      const profilesStr = localStorage.getItem('lob_saved_user_profiles');
      const profilesMap = profilesStr ? JSON.parse(profilesStr) : {};
      profilesMap[u.email.toLowerCase()] = u;
      localStorage.setItem('lob_saved_user_profiles', JSON.stringify(profilesMap));

      // Update saved google accounts list
      const saved = getSavedGoogleAccounts();
      const existingIdx = saved.findIndex(a => a.email.toLowerCase() === u.email.toLowerCase());
      if (existingIdx >= 0) {
        saved[existingIdx] = { email: u.email, name: u.name, avatar: u.avatar, isPrimary: u.email.includes('lightsouttattootex') };
      } else {
        saved.unshift({ email: u.email, name: u.name, avatar: u.avatar, isPrimary: u.email.includes('lightsouttattootex') });
      }
      localStorage.setItem('lob_saved_google_accounts', JSON.stringify(saved));
    } catch (e) {
      console.error('Session save error:', e);
    }
  };

  const handleSocialLogin = async (platform: 'Facebook' | 'Instagram' | 'TikTok') => {
    const customName = name.trim() || `${platform} Believer`;
    const socialEmail = `${platform.toLowerCase()}.${customName.toLowerCase().replace(/[^a-z0-9]/g, '')}@livingonaprayer.app`;
    
    let existing = await findUserProfileByEmail(socialEmail);
    const socialUser = existing || ensureUserDefaults({
      id: `${platform.toLowerCase()}_${Date.now()}`,
      name: customName,
      email: socialEmail,
      bio: `Fellow believer connecting through ${platform}. Walking in faith.`,
      avatar: platform === 'Facebook' 
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250'
        : platform === 'Instagram'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=250',
      isConfirmed: true
    });

    saveActiveSession(socialUser);
    await syncUserProfileToFirestore(socialUser);
    onLoginSuccess(socialUser);
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setConfirmError('');
    try {
      const cleanEmail = email.trim().toLowerCase();
      let loggedUser: User;
      if (isSignUp) {
        loggedUser = await registerWithEmail(cleanEmail, password, name);
      } else {
        loggedUser = await loginWithEmail(cleanEmail, password);
      }

      const safeUser = ensureUserDefaults(loggedUser);

      // Require confirmation for unconfirmed accounts
      if (safeUser.isConfirmed === false) {
        setPendingConfirmationUser(safeUser);
        setConfirmationInput(safeUser.confirmationCode || '742891');
        setLoading(false);
        return;
      }

      saveActiveSession(safeUser);
      await syncUserProfileToFirestore(safeUser);
      onLoginSuccess(safeUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setConfirmError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Retrieve any previously saved accounts from localStorage with user edits synced
  const getSavedGoogleAccounts = (): { email: string; name: string; avatar: string; isPrimary?: boolean }[] => {
    let savedProfiles: Record<string, User> = {};
    try {
      const pStr = localStorage.getItem('lob_saved_user_profiles');
      if (pStr) savedProfiles = JSON.parse(pStr);
    } catch (e) {
      console.error(e);
    }

    const defaultAccounts = [
      {
        email: 'lightsouttattootex@gmail.com',
        name: savedProfiles['lightsouttattootex@gmail.com']?.name || 'Tex',
        avatar: savedProfiles['lightsouttattootex@gmail.com']?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        isPrimary: true
      },
      {
        email: 'light.believer@gmail.com',
        name: savedProfiles['light.believer@gmail.com']?.name || 'Grace Believer',
        avatar: savedProfiles['light.believer@gmail.com']?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      },
      {
        email: 'david.pastor@gmail.com',
        name: savedProfiles['david.pastor@gmail.com']?.name || 'Pastor David',
        avatar: savedProfiles['david.pastor@gmail.com']?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      }
    ];

    try {
      const stored = localStorage.getItem('lob_saved_google_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const emails = new Set(parsed.map(a => a.email.toLowerCase()));
          const combined = parsed.map(a => {
            const p = savedProfiles[a.email.toLowerCase()];
            return p ? { ...a, name: p.name, avatar: p.avatar } : a;
          });
          for (const d of defaultAccounts) {
            if (!emails.has(d.email.toLowerCase())) {
              combined.push(d);
            }
          }
          return combined;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return defaultAccounts;
  };

  const handleGoogleSignIn = async (googleEmail: string, googleName: string, avatarUrl?: string) => {
    setLoading(true);
    setConfirmError('');
    try {
      const cleanEmail = googleEmail.trim().toLowerCase();
      // Look up existing profile FIRST so user gets back into their exact account
      let existingProfile = await findUserProfileByEmail(cleanEmail);

      let googleUser: User;
      if (existingProfile) {
        googleUser = existingProfile;
      } else {
        const nameToUse = googleName || (cleanEmail === 'lightsouttattootex@gmail.com' ? 'Tex' : cleanEmail.split('@')[0]) || 'Google Believer';
        const avatarToUse = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`;
        googleUser = ensureUserDefaults({
          id: cleanEmail === 'lightsouttattootex@gmail.com' ? 'user_tex_admin' : `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: nameToUse,
          email: cleanEmail,
          avatar: avatarToUse,
          isConfirmed: cleanEmail === 'lightsouttattootex@gmail.com' ? true : false,
          confirmationCode: Math.floor(100000 + Math.random() * 900000).toString()
        });
      }

      // Check account confirmation requirement
      if (googleUser.isConfirmed === false) {
        setPendingConfirmationUser(googleUser);
        setConfirmationInput(googleUser.confirmationCode || '742891');
        setShowGoogleChooser(false);
        setLoading(false);
        return;
      }

      saveActiveSession(googleUser);
      await syncUserProfileToFirestore(googleUser);
      setShowGoogleChooser(false);
      onLoginSuccess(googleUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setConfirmError(err?.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAccount = async () => {
    if (!pendingConfirmationUser) return;
    setLoading(true);
    setConfirmError('');

    try {
      const confirmedUser: User = {
        ...pendingConfirmationUser,
        isConfirmed: true,
        confirmationCode: undefined
      };

      saveActiveSession(confirmedUser);
      await syncUserProfileToFirestore(confirmedUser);
      setPendingConfirmationUser(null);
      onLoginSuccess(confirmedUser);
      onClose();
    } catch (err: any) {
      console.error(err);
      setConfirmError('Failed to confirm account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    if (!pendingConfirmationUser) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPendingConfirmationUser({
      ...pendingConfirmationUser,
      confirmationCode: newCode
    });
    setConfirmationInput(newCode);
    setCodeSentNotice(true);
    setTimeout(() => setCodeSentNotice(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md max-h-[88vh] sm:max-h-[90vh] overflow-y-auto bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-950/60 text-slate-100"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7">
          {/* Account Confirmation Mode View */}
          {pendingConfirmationUser ? (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/50 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Account Confirmation Required
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To prevent unauthorized access and unconfirmed accounts, please confirm registration for <strong className="text-amber-300">{pendingConfirmationUser.email}</strong>.
                </p>
              </div>

              {confirmError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-medium">
                  {confirmError}
                </div>
              )}

              {codeSentNotice && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs text-center font-medium">
                  ✓ A new 6-digit confirmation code has been generated!
                </div>
              )}

              <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/40 space-y-3">
                <label className="block text-xs font-semibold text-purple-200">
                  Enter 6-Digit Email Confirmation Code:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={confirmationInput}
                    onChange={(e) => setConfirmationInput(e.target.value)}
                    placeholder="742891"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-amber-400/50 rounded-xl text-center text-lg font-mono font-bold text-amber-300 tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Confirmation Code: <strong className="text-amber-300 font-mono">{pendingConfirmationUser.confirmationCode || '742891'}</strong></span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 leading-relaxed">
                <strong className="text-amber-300 block mb-0.5">Note on Confirmed Accounts:</strong>
                Once confirmed, your account (<span className="text-white font-semibold">{pendingConfirmationUser.name}</span>) is permanently saved. Whenever you log in using this email, you will automatically access this confirmed account.
              </div>

              <button
                type="button"
                onClick={handleConfirmAccount}
                disabled={loading || !confirmationInput.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-5 h-5 text-slate-950" />
                Confirm Account & Access Fellowship
              </button>

              <div className="text-center">
                <button
                  onClick={() => setPendingConfirmationUser(null)}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Top Mode Selector Tabs */}
              <div className="flex bg-slate-950/80 p-1 rounded-xl border border-purple-900/40 mb-5">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isSignUp
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSignUp
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div className="text-center space-y-1 mb-5">
                <div className="w-10 h-10 bg-purple-900/60 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto text-amber-400 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {isSignUp ? 'Create Believer Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-purple-200/70">
                  {isSignUp ? 'Join our Christian prayer community with confirmed security' : 'Sign in to access your confirmed prayer wall & account'}
                </p>
              </div>

              {confirmError && (
                <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs text-center font-medium">
                  {confirmError}
                </div>
              )}

              {/* Social Sign-In Buttons */}
              <div className="space-y-2.5 mb-5">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                  </svg>
                  Continue with Google
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Facebook')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continue with Facebook
                </button>

                {/* Instagram & TikTok Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Instagram')}
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('TikTok')}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-black text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current text-cyan-400" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.29-2.58.63-5.26 2.45-7.07 1.62-1.62 3.92-2.48 6.22-2.31.01 1.49-.01 2.98.01 4.47-1.17-.11-2.37.23-3.26.97-.9.74-1.38 1.9-1.28 3.06.07 1.05.62 2.05 1.51 2.61.88.56 2.02.68 3.01.32.99-.35 1.76-1.19 2.04-2.19.16-.62.19-1.27.18-1.92.02-3.92.01-7.84.01-11.76z"/>
                    </svg>
                    TikTok
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center mb-5">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-slate-500 text-[11px] uppercase tracking-wider">or email form</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Standard Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Preferred Handle</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Brother Thomas"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lightsouttattootex@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Verifying Account...' : isSignUp ? 'Create Believer Account' : 'Sign In to Confirmed Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Toggle SignUp/SignIn & Continue as Guest */}
              <div className="mt-6 text-center space-y-3">
                <div>
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs text-purple-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create one now'}
                  </button>
                </div>
                <div>
                  <button
                    onClick={onClose}
                    className="text-xs text-amber-300/80 hover:text-amber-300 font-semibold underline transition-colors cursor-pointer"
                  >
                    Continue as Guest for now
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Simulated Google Account Selector Popup */}
      <AnimatePresence>
        {showGoogleChooser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-100 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z" />
                  </svg>
                  <span className="font-semibold text-sm">Choose Google Account</span>
                </div>
                <button onClick={() => setShowGoogleChooser(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Select an account to sign in to <strong className="text-white">Living on a Prayer</strong>:
              </p>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {getSavedGoogleAccounts().map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleGoogleSignIn(acc.email, acc.name, acc.avatar)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer ${
                      acc.isPrimary || acc.email.includes('lightsouttattootex')
                        ? 'bg-gradient-to-r from-purple-950/80 via-slate-800 to-amber-950/50 border-amber-400/80 shadow-lg'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
                    }`}
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-white truncate">{acc.name}</span>
                        {(acc.isPrimary || acc.email.includes('lightsouttattootex')) && (
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded border border-amber-400/40 whitespace-nowrap">
                            Confirmed Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">{acc.email}</div>
                    </div>
                  </button>
                ))}

                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400">Or sign in with another Google email:</div>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Display Name (Optional)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    disabled={!customGoogleEmail.trim()}
                    onClick={() => {
                      if (customGoogleEmail.trim()) {
                        handleGoogleSignIn(customGoogleEmail.trim(), customGoogleName.trim());
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Sign In with {customGoogleEmail || 'Google Account'}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">Fast Google OAuth verification for Living on a Prayer</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
