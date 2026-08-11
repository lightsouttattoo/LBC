import React, { useState, useEffect } from 'react';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
import { MessageSquare } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { AuthModal } from './components/AuthModal';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { LeftDrawer } from './components/LeftDrawer';
import { RightBibleDrawer } from './components/RightBibleDrawer';
import { DMDrawer } from './components/DMDrawer';
import { DonationModal } from './components/DonationModal';
import { GospelTractModal } from './components/GospelTractModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { NewsFeed } from './components/NewsFeed';
import { GroupsTab } from './components/GroupsTab';
import { EventsTab } from './components/EventsTab';
import { SermonsTab } from './components/SermonsTab';
import { ContactsTab } from './components/ContactsTab';
import { BibleStudyTab } from './components/BibleStudyTab';
import { ProfileWall } from './components/ProfileWall';
import { InAppWebViewModal, WebViewTarget } from './components/InAppWebViewModal';

import { User, Post, Group, Event, Sermon, Comment } from './types';
import { CURRENT_USER, INITIAL_POSTS, INITIAL_GROUPS, INITIAL_EVENTS, INITIAL_SERMONS } from './data/initialData';
import { TYLER_GAULDEN_SERMONS } from './data/baptistNewsData';
import { 
  subscribeToPosts, 
  createFirestorePost, 
  updateFirestorePost,
  deleteFirestorePost,
  deleteAllFirestorePosts,
  deleteFirestorePostsBatch,
  togglePostLikeInFirestore, 
  addCommentToFirestore,
  syncUserProfileToFirestore,
  findUserProfileByEmail,
  subscribeToAllUsers,
  subscribeToUserNotifications,
  sendNotificationToFirestore
} from './lib/supabase';
import { ensureUserDefaults } from './utils/userUtils';

export default function App() {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('lob_user');
      if (saved) return ensureUserDefaults(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
    return ensureUserDefaults(CURRENT_USER);
  });

  const [allBelievers, setAllBelievers] = useState<User[]>([]);
  const [viewingUserProfile, setViewingUserProfile] = useState<User | null>(null);

  // Restore existing user profile by email from Firestore/localStorage on mount
  useEffect(() => {
    if (user && user.email) {
      findUserProfileByEmail(user.email).then((remoteProfile) => {
        if (remoteProfile) {
          const safe = ensureUserDefaults(remoteProfile);
          setUser(prev => {
            if (prev.id !== safe.id || prev.name !== safe.name || prev.role !== safe.role || prev.isConfirmed !== safe.isConfirmed) {
              return safe;
            }
            return prev;
          });
        }
      }).catch(err => console.error('Failed to restore user by email on mount:', err));
    }
  }, []);

  // Sync active user to Firestore
  useEffect(() => {
    if (user && user.id) {
      syncUserProfileToFirestore(user);
    }
  }, [user]);

  // Subscribe to all believers in Firestore
  useEffect(() => {
    const unsub = subscribeToAllUsers((usersList) => {
      setAllBelievers(usersList);
    });
    return () => unsub();
  }, []);

  // Subscribe to real-time notifications for active user
  useEffect(() => {
    if (!user || !user.id) return;
    const unsub = subscribeToUserNotifications(user.id, (realtimeNotifs) => {
      if (!realtimeNotifs) return;
      setUser(prev => ({
        ...prev,
        notifications: realtimeNotifs
      }));
    });
    return () => unsub();
  }, [user.id]);

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      const hasAuth = localStorage.getItem('lob_auth_active');
      return !hasAuth;
    } catch (e) {
      return true;
    }
  });

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<TabType | 'profile'>('home');

  // Drawers & Modals
  const [leftDrawerOpen, setLeftDrawerOpen] = useState<boolean>(false);
  const [rightBibleOpen, setRightBibleOpen] = useState<boolean>(false);
  const [dmDrawerOpen, setDmDrawerOpen] = useState<boolean>(false);
  const [selectedPastorForDm, setSelectedPastorForDm] = useState<string | undefined>(undefined);

  const handleOpenDMs = (pastorId?: string) => {
    if (pastorId) setSelectedPastorForDm(pastorId);
    setDmDrawerOpen(true);
  };
  const [donateOpen, setDonateOpen] = useState<boolean>(false);
  const [gospelTractOpen, setGospelTractOpen] = useState<boolean>(false);
  const [installPwaOpen, setInstallPwaOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [webViewTarget, setWebViewTarget] = useState<WebViewTarget | null>(null);

  const handleOpenWebView = (url: string, title?: string, sourceName?: string, categoryName?: string) => {
    setWebViewTarget({ url, title, sourceName, categoryName });
  };

  // Follow / Unfollow / Follow Request logic
  const handleToggleFollow = (targetUserId: string, targetUserName: string, targetAvatar: string) => {
    const currentFollowing = user.followingIds || [];
    const isFollowing = currentFollowing.includes(targetUserId);

    let nextFollowing: string[];
    let nextCount = user.followingCount || 0;

    if (isFollowing) {
      nextFollowing = currentFollowing.filter(id => id !== targetUserId);
      nextCount = Math.max(0, nextCount - 1);
    } else {
      nextFollowing = [...currentFollowing, targetUserId];
      nextCount += 1;

      // Send real-time follow notification to target user in Firestore
      sendNotificationToFirestore(targetUserId, {
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar,
        title: 'New Believer Connection',
        message: `${user.name} followed you on Lights Out Baptist!`,
        type: 'follow_request'
      });
    }

    const updatedUser: User = {
      ...user,
      followingIds: nextFollowing,
      followingCount: nextCount,
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title: isFollowing ? 'Unfollowed User' : 'Follow Request Sent',
          message: isFollowing
            ? `You unfollowed ${targetUserName}.`
            : `You are now following ${targetUserName}!`,
          timestamp: 'Just now',
          isRead: false,
          type: 'follow_request',
          fromUserId: targetUserId,
          fromUserName: targetUserName,
          fromUserAvatar: targetAvatar
        },
        ...(user.notifications || [])
      ]
    };

    handleUpdateProfile(updatedUser);
  };

  const handleAcceptFollowRequest = (reqId: string) => {
    const targetReq = (user.followRequests || []).find(r => r.id === reqId);
    if (!targetReq) return;

    const updatedRequests = (user.followRequests || []).map(r => 
      r.id === reqId ? { ...r, status: 'accepted' as const } : r
    );

    const updatedFollowerIds = Array.from(new Set([...(user.followerIds || []), targetReq.fromUserId]));
    const newFollowersCount = updatedFollowerIds.length;

    const updatedUser: User = {
      ...user,
      followerIds: updatedFollowerIds,
      followersCount: newFollowersCount,
      followRequests: updatedRequests,
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title: 'Follow Request Accepted',
          message: `You accepted ${targetReq.fromUserName}'s follow request! You are now connected in prayer.`,
          timestamp: 'Just now',
          isRead: false,
          type: 'follow_accepted',
          fromUserId: targetReq.fromUserId,
          fromUserName: targetReq.fromUserName,
          fromUserAvatar: targetReq.fromUserAvatar
        },
        ...(user.notifications || [])
      ]
    };

    handleUpdateProfile(updatedUser);
  };

  const handleDeclineFollowRequest = (reqId: string) => {
    const updatedRequests = (user.followRequests || []).filter(r => r.id !== reqId);
    const updatedUser: User = {
      ...user,
      followRequests: updatedRequests
    };
    handleUpdateProfile(updatedUser);
  };

  const handleTogglePushNotifications = (enabled: boolean) => {
    const updatedUser: User = {
      ...user,
      pushNotificationsEnabled: enabled
    };
    handleUpdateProfile(updatedUser);
  };

  // App State collections
  const [likedPostIds, setLikedPostIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    } catch {
      return [];
    }
  });
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [sermons, setSermons] = useState<Sermon[]>([...TYLER_GAULDEN_SERMONS, ...INITIAL_SERMONS]);

  // Subscribe to real-time Firestore database posts on mount
  useEffect(() => {
    const unsubscribe = subscribeToPosts((updatedPosts) => {
      setPosts(prevPosts => {
        return updatedPosts.map(p => {
          const isLiked = likedPostIds.includes(p.id);
          const existingPost = prevPosts.find(oldP => oldP.id === p.id);

          // Preserve any optimistic local comments that might not have landed in snapshot yet
          const existingComments = existingPost?.comments || [];
          const firestoreComments = p.comments || [];

          // Merge comments avoiding duplicates by id
          const commentMap = new Map<string, Comment>();
          firestoreComments.forEach(c => commentMap.set(c.id, c));
          existingComments.forEach(c => {
            if (!commentMap.has(c.id)) {
              commentMap.set(c.id, c);
            }
          });
          const mergedComments = Array.from(commentMap.values());

          return {
            ...p,
            isLiked,
            likesCount: isLiked && p.likesCount === 0 ? 1 : p.likesCount,
            commentsCount: Math.max(p.commentsCount, mergedComments.length),
            comments: mergedComments
          };
        });
      });
    });
    return () => unsubscribe();
  }, [likedPostIds]);

  // Handlers
  const handleAddPost = (newPost: Post) => {
    // Optimistic local update
    setPosts(prev => [newPost, ...prev]);
    // Save permanently to Firestore database
    createFirestorePost(newPost);
  };

  const handleEditPost = (postId: string, updatedFields: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedFields } : p));
    updateFirestorePost(postId, updatedFields);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    deleteFirestorePost(postId);
  };

  const handleEraseAllPosts = () => {
    setPosts([]);
    deleteAllFirestorePosts();
  };

  const handleEraseSelectedPosts = (postIdsToErase: string[]) => {
    setPosts(prev => prev.filter(p => !postIdsToErase.includes(p.id)));
    deleteFirestorePostsBatch(postIdsToErase);
  };

  const handleLikePost = (postId: string) => {
    const isCurrentlyLiked = likedPostIds.includes(postId);
    const nextIsLiked = !isCurrentlyLiked;

    const newLikedIds = nextIsLiked
      ? [...likedPostIds, postId]
      : likedPostIds.filter(id => id !== postId);

    setLikedPostIds(newLikedIds);
    try {
      localStorage.setItem('likedPostIds', JSON.stringify(newLikedIds));
    } catch (e) {
      console.warn('Could not save likedPostIds:', e);
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newCount = nextIsLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
        return {
          ...p,
          isLiked: nextIsLiked,
          likesCount: newCount
        };
      }
      return p;
    }));

    // Update in Firestore database
    togglePostLikeInFirestore(postId, nextIsLiked);
  };

  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText,
      createdAt: 'Just now',
      likes: 0
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));

    // Save comment permanently to Firestore database
    addCommentToFirestore(postId, newComment);
  };

  const handleCreateGroup = (newGroup: Group) => {
    setGroups([newGroup, ...groups]);
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const isMem = !g.isMember;
        return {
          ...g,
          isMember: isMem,
          membersCount: isMem ? g.membersCount + 1 : Math.max(1, g.membersCount - 1)
        };
      }
      return g;
    }));
  };

  const handleCreateEvent = (newEvent: Event) => {
    setEvents([newEvent, ...events]);
  };

  const handleRSVPEvent = (eventId: string, status: 'Going' | 'Interested') => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          isAttending: status,
          attendeesCount: status === 'Going' && e.isAttending !== 'Going' ? e.attendeesCount + 1 : e.attendeesCount
        };
      }
      return e;
    }));
  };

  const handleAddSermon = (newSermon: Sermon) => {
    setSermons([newSermon, ...sermons]);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    const safeUser = ensureUserDefaults(updatedUser);
    setUser(safeUser);
    try {
      // Create lightweight copy without base64 or long histories for localStorage
      const storageUser = {
        ...safeUser,
        avatar: (safeUser.avatar && safeUser.avatar.length > 200000) ? DEFAULT_AVATAR : safeUser.avatar,
        coverImage: (safeUser.coverImage && safeUser.coverImage.length > 300000) ? undefined : safeUser.coverImage,
        notifications: (safeUser.notifications || []).slice(0, 15)
      };

      // 1. Persist current active session user
      localStorage.setItem('lob_user', JSON.stringify(storageUser));

      // 2. Persist to profile registry map by email
      const profilesStr = localStorage.getItem('lob_saved_user_profiles');
      const profiles = profilesStr ? JSON.parse(profilesStr) : {};
      if (storageUser.email) {
        profiles[storageUser.email.toLowerCase()] = storageUser;
      }
      localStorage.setItem('lob_saved_user_profiles', JSON.stringify(profiles));

      // 3. Update saved Google accounts chooser list
      const savedAccountsStr = localStorage.getItem('lob_saved_google_accounts');
      if (savedAccountsStr) {
        const savedAccounts = JSON.parse(savedAccountsStr);
        if (Array.isArray(savedAccounts)) {
          const idx = savedAccounts.findIndex((a: any) => a.email.toLowerCase() === storageUser.email.toLowerCase());
          if (idx >= 0) {
            savedAccounts[idx].name = storageUser.name;
            savedAccounts[idx].avatar = storageUser.avatar;
          } else {
            savedAccounts.unshift({
              email: storageUser.email,
              name: storageUser.name,
              avatar: storageUser.avatar,
              isPrimary: storageUser.email.includes('lightsouttattootex')
            });
          }
          localStorage.setItem('lob_saved_google_accounts', JSON.stringify(savedAccounts));
        }
      }
    } catch (e) {
      console.warn('LocalStorage limit exceeded, cleared non-essential cache:', e);
      try {
        localStorage.removeItem('lob_saved_user_profiles');
        const storageUserMinimal = { ...safeUser, notifications: [] };
        localStorage.setItem('lob_user', JSON.stringify(storageUserMinimal));
      } catch (innerErr) {
        console.warn('Could not write minimal user to localStorage:', innerErr);
      }
    }

    // 4. Update posts in state to reflect new author name & avatar immediately
    setPosts(prev => prev.map(p => {
      if (p.userId === safeUser.id || (safeUser.email && p.userId === `google_${safeUser.email.replace(/[^a-zA-Z0-9]/g, '_')}`)) {
        return {
          ...p,
          userName: updatedUser.name,
          userAvatar: updatedUser.avatar
        };
      }
      return p;
    }));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('lob_user');
      localStorage.removeItem('lob_auth_active');
    } catch (e) {
      console.error(e);
    }
    setUser(CURRENT_USER);
    setShowSplash(true);
    setLeftDrawerOpen(false);
  };

  // Filter posts belonging to active user for profile wall
  const userPosts = (posts || []).filter(p => p && (p.userId === user?.id || (user?.email && p.userId === `google_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`)));

  if (showSplash) {
    return (
      <>
        <SplashScreen
          onEnter={() => {
            setShowSplash(false);
            try {
              localStorage.setItem('lob_auth_active', 'true');
            } catch (e) {
              console.error(e);
            }
          }}
          onOpenAuth={() => {
            setShowAuthModal(true);
          }}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(loggedInUser) => {
            const safeUser = ensureUserDefaults(loggedInUser);
            setUser(safeUser);
            setShowSplash(false);
            setShowAuthModal(false);
            try {
              localStorage.setItem('lob_user', JSON.stringify(safeUser));
              localStorage.setItem('lob_auth_active', 'true');
            } catch (e) {
              console.error(e);
            }
            setActiveTab('profile');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top App Bar */}
      <TopAppBar
        user={user}
        onOpenLeftDrawer={() => setLeftDrawerOpen(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenInstallPwa={() => setInstallPwaOpen(true)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 overflow-x-hidden">
        {viewingUserProfile ? (
          <div className="relative">
            <div className="bg-slate-900 border-b border-purple-900/40 p-3 px-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
              <button
                onClick={() => setViewingUserProfile(null)}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-purple-500/30 cursor-pointer"
              >
                ← Back to Feed
              </button>
              <span className="text-xs font-bold text-slate-300 font-serif">Believer Profile</span>
            </div>
            <ProfileWall
              user={viewingUserProfile}
              currentUser={user}
              userPosts={(posts || []).filter(p => p.userId === viewingUserProfile.id)}
              onUpdateProfile={handleUpdateProfile}
              onLikePost={handleLikePost}
              onAddPost={handleAddPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onOpenDMs={(targetId) => {
                setViewingUserProfile(null);
                handleOpenDMs(targetId);
              }}
              onToggleFollow={handleToggleFollow}
            />
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <NewsFeed
                user={user}
                posts={posts}
                onAddPost={handleAddPost}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onEraseAllPosts={handleEraseAllPosts}
                onEraseSelectedPosts={handleEraseSelectedPosts}
                onSwitchUser={(newUser) => setUser(newUser)}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onOpenWebView={handleOpenWebView}
                onToggleFollow={handleToggleFollow}
                onSelectUser={(targetUserId, targetName, targetAvatar) => {
                  const foundUser = allBelievers.find(u => u.id === targetUserId) || {
                    id: targetUserId,
                    name: targetName || 'Believer',
                    email: '',
                    avatar: targetAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
                    joinedDate: 'August 2026',
                    role: 'Believer Member'
                  };
                  setViewingUserProfile(foundUser);
                }}
              />
            )}

            {activeTab === 'news' && (
              <ContactsTab
                currentUser={user}
                allBelievers={allBelievers}
                onOpenDMs={(userId) => handleOpenDMs(userId)}
                onSelectUser={(selectedUser) => setViewingUserProfile(selectedUser)}
                onToggleFollow={handleToggleFollow}
              />
            )}

            {activeTab === 'biblestudy' && (
              <BibleStudyTab />
            )}

            {activeTab === 'groups' && (
              <GroupsTab
                user={user}
                groups={groups}
                onCreateGroup={handleCreateGroup}
                onToggleJoinGroup={handleToggleJoinGroup}
              />
            )}

            {activeTab === 'events' && (
              <EventsTab
                user={user}
                events={events}
                onCreateEvent={handleCreateEvent}
                onRSVPEvent={handleRSVPEvent}
              />
            )}

            {activeTab === 'sermons' && (
              <SermonsTab
                user={user}
                sermons={sermons}
                onAddSermon={handleAddSermon}
                onAddPost={handleAddPost}
                onOpenWebView={handleOpenWebView}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileWall
                user={user}
                currentUser={user}
                userPosts={userPosts}
                onUpdateProfile={handleUpdateProfile}
                onLikePost={handleLikePost}
                onAddPost={handleAddPost}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
              />
            )}
          </>
        )}
      </main>

      {/* Floating DM Bar Trigger for Community Believers Chat */}
      <button
        type="button"
        onClick={() => handleOpenDMs()}
        className="fixed bottom-14 right-4 sm:right-6 z-30 bg-gradient-to-r from-[#2d1b4e] to-[#4c1d95] hover:brightness-110 border border-amber-400/40 text-white rounded-t-xl px-4 py-2 flex items-center gap-2.5 shadow-2xl transition-all active:scale-95 cursor-pointer"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Believers Chat (DMs)</span>
        <MessageSquare className="w-4 h-4 text-amber-400" />
      </button>

      {/* Bottom App Navigation Bar */}
      <BottomNavBar
        activeTab={activeTab === 'profile' ? 'home' : activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenBibleDrawer={() => setRightBibleOpen(true)}
        isBibleOpen={rightBibleOpen}
      />

      {/* Left Mobile Menu Slide-Out Drawer */}
      <LeftDrawer
        isOpen={leftDrawerOpen}
        user={user}
        onClose={() => setLeftDrawerOpen(false)}
        onOpenProfile={() => setActiveTab('profile')}
        onLogout={handleLogout}
        onOpenDonate={() => setDonateOpen(true)}
        onOpenDMs={(pastorId) => handleOpenDMs(pastorId)}
        onOpenGospelTract={() => setGospelTractOpen(true)}
        onOpenInstallPwa={() => setInstallPwaOpen(true)}
        onOpenBibleStudy={() => setActiveTab('biblestudy')}
      />

      {/* Right Holy Bible KJV Drawer */}
      <RightBibleDrawer
        isOpen={rightBibleOpen}
        onClose={() => setRightBibleOpen(false)}
        onOpenWebView={handleOpenWebView}
      />

      {/* Direct Messages Chat Drawer (Slides from Bottom) */}
      <DMDrawer
        isOpen={dmDrawerOpen}
        user={user}
        onClose={() => setDmDrawerOpen(false)}
        initialPastorId={selectedPastorForDm}
      />

      {/* Ministry Giving & Donation Modal */}
      <DonationModal
        isOpen={donateOpen}
        onClose={() => setDonateOpen(false)}
      />

      {/* Gospel Tract Modal */}
      <GospelTractModal
        isOpen={gospelTractOpen}
        onClose={() => setGospelTractOpen(false)}
      />

      {/* Notifications & Follow Requests Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        user={user}
        onAcceptFollowRequest={handleAcceptFollowRequest}
        onDeclineFollowRequest={handleDeclineFollowRequest}
        onTogglePushNotifications={handleTogglePushNotifications}
      />

      {/* PWA Install to Home Screen Modal */}
      <InstallPwaModal
        isOpen={installPwaOpen}
        onClose={() => setInstallPwaOpen(false)}
      />

      {/* Auth Modal (Email / Google account simulation) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={(loggedInUser) => {
          const safeUser = ensureUserDefaults(loggedInUser);
          setUser(safeUser);
          setShowSplash(false);
          setShowAuthModal(false);
          try {
            localStorage.setItem('lob_user', JSON.stringify(safeUser));
            localStorage.setItem('lob_auth_active', 'true');
          } catch (e) {
            console.error(e);
          }
          setActiveTab('profile');
        }}
      />

      {/* In-App Webview Modal Reader with Breadcrumbs */}
      <InAppWebViewModal
        isOpen={!!webViewTarget}
        target={webViewTarget}
        onClose={() => setWebViewTarget(null)}
      />
    </div>
  );
}
