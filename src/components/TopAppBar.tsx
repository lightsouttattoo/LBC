import React from 'react';
import { Menu, LogOut, Cross, Smartphone, Bell, Flame } from 'lucide-react';
import { User } from '../types';

interface TopAppBarProps {
  user: User;
  onOpenLeftDrawer: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenNotifications?: () => void;
  onOpenInstallPwa?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  user,
  onOpenLeftDrawer,
  onLogout,
  onOpenProfile,
  onOpenNotifications,
  onOpenInstallPwa
}) => {
  const pendingCount = (user?.followRequests || []).filter(r => r?.status === 'pending').length;
  const unreadNotifCount = (user?.notifications || []).filter(n => n && !n.isRead).length;
  const totalBadge = pendingCount + unreadNotifCount;
  const displayName = (user?.name || 'Believer').trim();
  const firstName = displayName ? displayName.split(' ')[0] : 'Believer';

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#091126] via-[#1d4ed8] to-[#091126] border-b border-amber-400/40 backdrop-blur-md px-3 sm:px-4 py-2.5 shadow-2xl shadow-blue-950/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Menu Hamburger Icon */}
        <button
          onClick={onOpenLeftDrawer}
          className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-amber-300 border border-amber-400/30 transition-all active:scale-95 flex items-center justify-center shadow-md"
          title="Open Menu & Verses"
        >
          <Menu className="w-5 h-5 text-amber-300" />
        </button>

        {/* Center: Main Logo & App Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenProfile}>
          {/* Main Logo Emblem */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="w-full h-full bg-[#0a142f] rounded-[14px] flex items-center justify-center relative overflow-hidden border border-amber-300/40">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/30 via-amber-400/20 to-transparent blur-sm"></div>
              <Cross className="w-5 h-5 text-amber-300 fill-amber-400/30 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] relative z-10" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black font-serif text-[#fffbe6] tracking-tight uppercase drop-shadow">
                Living on a Prayer
              </h1>
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 hidden sm:inline" />
            </div>
            <span className="text-[10px] text-amber-300 font-bold tracking-widest uppercase flex items-center gap-1">
              Lights Out Baptist Church
            </span>
          </div>
        </div>

        {/* Right Side: Install App & User Profile & Notifications & Log Out */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenInstallPwa && (
            <button
              onClick={onOpenInstallPwa}
              className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-bold text-xs shadow hover:brightness-110 flex items-center gap-1 transition-all active:scale-95"
              title="Install App to Home Screen"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-amber-300 border border-amber-400/30 transition-all active:scale-95 flex items-center justify-center shadow-md relative"
              title="Notifications & Follow Requests"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {totalBadge > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {totalBadge}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="hidden sm:flex items-center gap-2 p-1 pr-3 rounded-full bg-blue-950/60 border border-amber-400/30 hover:bg-blue-900/60 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-amber-400"
            />
            <span className="text-xs font-semibold text-[#fffbe6] max-w-[90px] truncate">{firstName}</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl bg-blue-950/60 hover:bg-red-950/80 text-slate-300 hover:text-red-300 border border-amber-400/30 transition-all active:scale-95 flex items-center justify-center shadow-md"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
