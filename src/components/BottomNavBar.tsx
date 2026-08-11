import React from 'react';
import { Home, Users, Calendar, Video, BookOpen, Newspaper } from 'lucide-react';

export type TabType = 'home' | 'news' | 'groups' | 'events' | 'sermons' | 'biblestudy';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBibleDrawer: () => void;
  isBibleOpen?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBibleDrawer,
  isBibleOpen = false
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#081229]/95 border-t border-amber-400/30 backdrop-blur-md py-2 px-2 shadow-2xl shadow-blue-950/80">
      <div className="max-w-xl mx-auto flex items-center justify-around">
        {/* 1. Home / News Feed */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Feed</span>
        </button>

        {/* 2. Contacts / Believers Directory */}
        <button
          onClick={() => onSelectTab('news')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'news'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Contacts</span>
        </button>

        {/* 3. Bible Study */}
        <button
          onClick={() => onSelectTab('biblestudy')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'biblestudy'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Study</span>
        </button>

        {/* 4. Sermons & Tyler Gaulden */}
        <button
          onClick={() => onSelectTab('sermons')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'sermons'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Sermons</span>
        </button>

        {/* 5. Groups */}
        <button
          onClick={() => onSelectTab('groups')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'groups'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Groups</span>
        </button>

        {/* 6. Events */}
        <button
          onClick={() => onSelectTab('events')}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'events'
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Events</span>
        </button>

        {/* 7. KJV Bible Reader Panel Drawer */}
        <button
          onClick={onOpenBibleDrawer}
          className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all cursor-pointer ${
            isBibleOpen
              ? 'text-amber-300 font-bold bg-blue-600/30 border border-amber-400/40 shadow-sm'
              : 'text-blue-200/70 hover:text-[#fffbe6]'
          }`}
          title="Open KJV Holy Bible Reader Drawer"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">Bible</span>
        </button>
      </div>
    </nav>
  );
};
