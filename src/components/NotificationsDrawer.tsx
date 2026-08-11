import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, UserPlus, Check, X, Shield, Sparkles, Send, Volume2, VolumeX } from 'lucide-react';
import { User, FollowRequest, NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onAcceptFollowRequest: (reqId: string) => void;
  onDeclineFollowRequest: (reqId: string) => void;
  onTogglePushNotifications: (enabled: boolean) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onAcceptFollowRequest,
  onDeclineFollowRequest,
  onTogglePushNotifications
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

  const pendingRequests = (user.followRequests || []).filter(r => r.status === 'pending');
  const notifications = user.notifications || [];

  const handlePushToggle = async () => {
    const nextState = !user.pushNotificationsEnabled;
    if (nextState && 'Notification' in window && Notification.permission !== 'granted') {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          onTogglePushNotifications(true);
        } else {
          onTogglePushNotifications(false);
        }
      } catch (err) {
        onTogglePushNotifications(nextState);
      }
    } else {
      onTogglePushNotifications(nextState);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md h-full bg-slate-900 border-l border-purple-500/40 text-slate-100 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-b border-purple-900/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-900/60 rounded-xl text-amber-300 border border-purple-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-white text-base">Notifications & Requests</h2>
              <p className="text-[11px] text-purple-300">Stay connected with fellow believers</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Toggle Banner */}
        <div className="p-3.5 bg-slate-950 border-b border-purple-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {user.pushNotificationsEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <div className="text-xs font-bold text-white">Push Notifications</div>
              <div className="text-[10px] text-slate-400">Receive alerts for new follow requests & prayers</div>
            </div>
          </div>

          <button
            onClick={handlePushToggle}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
              user.pushNotificationsEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {user.pushNotificationsEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-purple-900/30 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-purple-900/60 text-amber-300 border border-purple-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Activity ({notifications.length})
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'requests'
                ? 'bg-purple-900/60 text-amber-300 border border-purple-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Follow Requests
            {pendingRequests.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'requests' ? (
            pendingRequests.length > 0 ? (
              pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-3.5 bg-slate-950/80 border border-purple-800/40 rounded-2xl flex flex-col gap-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.fromUserAvatar}
                        alt={req.fromUserName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/80"
                      />
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          {req.fromUserName}
                          <Sparkles className="w-3 h-3 text-amber-400" />
                        </div>
                        <div className="text-[10px] text-purple-300">Wants to follow your prayer space</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">{req.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAcceptFollowRequest(req.id)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Accept Follow
                    </button>
                    <button
                      onClick={() => onDeclineFollowRequest(req.id)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 active:scale-[0.98] transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2 text-slate-400">
                <UserPlus className="w-8 h-8 text-purple-400/50 mx-auto" />
                <p className="text-xs">No pending follow requests at this time.</p>
              </div>
            )
          ) : (
            notifications.length > 0 ? (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className="p-3.5 bg-slate-950/80 border border-purple-900/40 rounded-2xl space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-purple-950 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs text-white font-serif">{notif.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2 text-slate-400">
                <Bell className="w-8 h-8 text-purple-400/50 mx-auto" />
                <p className="text-xs">Your notification feed is completely clear.</p>
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
