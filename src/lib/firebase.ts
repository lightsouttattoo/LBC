import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  increment 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Post, Comment, User, DirectMessage } from '../types';
import { INITIAL_POSTS } from '../data/initialData';
import { DEFAULT_AVATAR, ensureUserDefaults } from '../utils/userUtils';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Firebase Auth Helper functions
export async function findUserProfileByEmail(email: string): Promise<User | null> {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check Tex / Admin email shortcut
  if (cleanEmail === 'lightsouttattootex@gmail.com') {
    let savedTexProfile: User | null = null;
    try {
      const savedMapStr = localStorage.getItem('lob_saved_user_profiles');
      if (savedMapStr) {
        const map = JSON.parse(savedMapStr);
        if (map['lightsouttattootex@gmail.com']) {
          savedTexProfile = map['lightsouttattootex@gmail.com'];
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return ensureUserDefaults(savedTexProfile || {
      id: 'user_tex_admin',
      name: 'Tex',
      email: 'lightsouttattootex@gmail.com',
      role: 'Administrator & App Owner',
      isConfirmed: true
    });
  }

  // 2. Check localStorage saved profiles map
  try {
    const savedMapStr = localStorage.getItem('lob_saved_user_profiles');
    if (savedMapStr) {
      const map = JSON.parse(savedMapStr);
      if (map[cleanEmail]) {
        return ensureUserDefaults(map[cleanEmail]);
      }
    }
  } catch (e) {
    console.warn(e);
  }

  // 3. Query Firestore users collection for matching email
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);
    let matchedDoc: any = null;
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email && data.email.trim().toLowerCase() === cleanEmail) {
        matchedDoc = { id: docSnap.id, ...data };
      }
    });

    if (matchedDoc) {
      return ensureUserDefaults({
        id: matchedDoc.id,
        name: matchedDoc.name,
        email: matchedDoc.email,
        avatar: matchedDoc.avatar,
        coverImage: matchedDoc.coverImage,
        bio: matchedDoc.bio,
        favoriteVerse: matchedDoc.favoriteVerse,
        role: matchedDoc.role,
        followersCount: matchedDoc.followersCount,
        followingCount: matchedDoc.followingCount,
        followingIds: matchedDoc.followingIds,
        followerIds: matchedDoc.followerIds,
        isConfirmed: matchedDoc.isConfirmed ?? true,
        confirmationCode: matchedDoc.confirmationCode
      });
    }
  } catch (err) {
    console.warn('Failed to query user by email in Firestore:', err);
  }

  return null;
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Check if account already exists
  const existing = await findUserProfileByEmail(cleanEmail);
  if (existing) {
    return existing;
  }

  // Generate confirmation code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    const newUser = ensureUserDefaults({
      id: fbUser.uid,
      name: name.trim() || fbUser.email?.split('@')[0] || 'Brother Christian',
      email: fbUser.email || email,
      joinedDate: 'August 2026',
      bio: 'Believer in Jesus Christ walking in love.',
      favoriteVerse: 'John 3:16',
      role: 'Believer Member',
      isConfirmed: false,
      confirmationCode: code
    });
    await syncUserProfileToFirestore(newUser);
    return newUser;
  } catch (err: any) {
    console.warn('Firebase Auth registration note:', err?.message || err);
    const fallbackUser = ensureUserDefaults({
      id: `user_${Date.now()}`,
      name: name.trim() || cleanEmail.split('@')[0] || 'Brother Christian',
      email: cleanEmail,
      joinedDate: 'August 2026',
      bio: 'Believer in Jesus Christ walking in love.',
      favoriteVerse: 'John 3:16',
      role: 'Believer Member',
      isConfirmed: false,
      confirmationCode: code
    });
    await syncUserProfileToFirestore(fallbackUser);
    return fallbackUser;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  // Look up existing profile FIRST so user gets back into their exact account
  const existing = await findUserProfileByEmail(cleanEmail);
  if (existing) {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      console.warn('Firebase signInNote:', e);
    }
    return existing;
  }

  // If no existing profile, sign in or create fallback
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;
    const newUser = ensureUserDefaults({
      id: fbUser.uid,
      name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Brother Christian',
      email: fbUser.email || email,
      isConfirmed: true
    });
    await syncUserProfileToFirestore(newUser);
    return newUser;
  } catch (err: any) {
    console.warn('Firebase Auth login note:', err?.message || err);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = ensureUserDefaults({
      id: `user_${Date.now()}`,
      name: cleanEmail.split('@')[0] || 'Brother Christian',
      email: cleanEmail,
      isConfirmed: false,
      confirmationCode: code
    });
    await syncUserProfileToFirestore(newUser);
    return newUser;
  }
}

const POSTS_COLLECTION = 'posts';
const COMMENTS_COLLECTION = 'comments';
const USERS_COLLECTION = 'users';
const DMS_COLLECTION = 'dms';
const NOTIFICATIONS_COLLECTION = 'notifications';

// Real-time listener for posts with auto-seeding if empty and comment joining
export function subscribeToPosts(onPostsUpdate: (posts: Post[]) => void) {
  const postsRef = collection(db, POSTS_COLLECTION);
  const q = query(postsRef, orderBy('timestamp', 'desc'));

  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const commentsQ = query(commentsRef, orderBy('timestamp', 'asc'));

  let currentPostsDocs: any[] = [];
  let currentCommentsDocs: any[] = [];

  const updateCombined = () => {
    if (currentPostsDocs.length === 0) return;

    // Group comments by postId
    const commentsByPostId: Record<string, Comment[]> = {};
    currentCommentsDocs.forEach(docSnap => {
      const data = docSnap.data();
      const pId = data.postId;
      if (pId) {
        if (!commentsByPostId[pId]) commentsByPostId[pId] = [];
        const isDuplicate = commentsByPostId[pId].some(
          c => c.id === docSnap.id || (c.content.trim() === (data.content || '').trim() && c.userName === data.userName)
        );
        if (!isDuplicate) {
          commentsByPostId[pId].push({
            id: docSnap.id,
            postId: pId,
            userId: data.userId || 'user_anon',
            userName: data.userName || 'Believer',
            userAvatar: data.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            content: data.content || '',
            createdAt: data.createdAt || 'Just now',
            likes: data.likes || 0
          });
        }
      }
    });

    const postsList: Post[] = currentPostsDocs.map(docSnap => {
      const data = docSnap.data();
      const pId = docSnap.id;

      // Seed initial mock comments if post matches initial data post ids and has no Firestore comments yet
      const initialSeedPost = INITIAL_POSTS.find(ip => ip.id === pId || ip.title === data.title);
      const firestoreComments = commentsByPostId[pId] || [];
      const combinedComments = firestoreComments.length > 0
        ? firestoreComments
        : (initialSeedPost?.comments || []);

      return {
        id: pId,
        userId: data.userId || 'user_anon',
        userName: data.userName || data.authorName || 'Church Member',
        userAvatar: data.userAvatar || data.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        title: data.title || '',
        category: data.category || 'Testimony',
        content: data.content || '',
        imageUrl: data.imageUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        youtubeId: data.youtubeId || undefined,
        createdAt: data.createdAt || 'Just now',
        likesCount: data.likesCount || 0,
        commentsCount: Math.max(data.commentsCount || 0, combinedComments.length),
        sharesCount: data.sharesCount || 0,
        isLiked: false,
        comments: combinedComments
      };
    });

    onPostsUpdate(postsList);
  };

  const unsubPosts = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      seedInitialPosts();
      onPostsUpdate(INITIAL_POSTS);
    } else {
      currentPostsDocs = snapshot.docs;
      updateCombined();
    }
  }, (err) => {
    console.warn('Firestore subscription active, fallback to local state:', err);
    onPostsUpdate(INITIAL_POSTS);
  });

  const unsubComments = onSnapshot(commentsQ, (snapshot) => {
    currentCommentsDocs = snapshot.docs;
    updateCombined();
  }, (err) => {
    console.warn('Comments subscription note:', err);
  });

  return () => {
    unsubPosts();
    unsubComments();
  };
}

// Seed initial posts to Firestore
async function seedInitialPosts() {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    for (const post of INITIAL_POSTS) {
      await addDoc(postsRef, {
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        title: post.title,
        category: post.category,
        content: post.content,
        imageUrl: post.imageUrl || null,
        videoUrl: post.videoUrl || null,
        youtubeId: post.youtubeId || null,
        createdAt: post.createdAt,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        sharesCount: post.sharesCount,
        timestamp: Date.now()
      });
    }
  } catch (err) {
    console.error('Error seeding initial posts to Firestore:', err);
  }
}

// Save a new Post to Firestore
export async function createFirestorePost(newPost: Post) {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    await addDoc(postsRef, {
      userId: newPost.userId,
      userName: newPost.userName,
      userAvatar: newPost.userAvatar,
      title: newPost.title,
      category: newPost.category,
      content: newPost.content,
      imageUrl: newPost.imageUrl || null,
      videoUrl: newPost.videoUrl || null,
      youtubeId: newPost.youtubeId || null,
      createdAt: newPost.createdAt || 'Just now',
      likesCount: newPost.likesCount || 1,
      commentsCount: newPost.commentsCount || 0,
      sharesCount: newPost.sharesCount || 0,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Failed to save post to Firestore:', err);
  }
}

// Update post in Firestore
export async function updateFirestorePost(postId: string, updatedFields: Partial<Post>) {
  try {
    const postDoc = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postDoc, {
      ...(updatedFields.title !== undefined && { title: updatedFields.title }),
      ...(updatedFields.category !== undefined && { category: updatedFields.category }),
      ...(updatedFields.content !== undefined && { content: updatedFields.content }),
      ...(updatedFields.imageUrl !== undefined && { imageUrl: updatedFields.imageUrl || null }),
      ...(updatedFields.videoUrl !== undefined && { videoUrl: updatedFields.videoUrl || null }),
      ...(updatedFields.youtubeId !== undefined && { youtubeId: updatedFields.youtubeId || null }),
    });
  } catch (err) {
    console.warn('Could not update post in Firestore:', err);
  }
}

// Delete single post from Firestore
export async function deleteFirestorePost(postId: string) {
  try {
    const postDoc = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(postDoc);
  } catch (err) {
    console.warn('Could not delete post from Firestore:', err);
  }
}

// Delete ALL posts from Firestore
export async function deleteAllFirestorePosts() {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);
    const snapshot = await getDocs(postsRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Could not delete all posts from Firestore:', err);
  }
}

// Delete selected batch of posts from Firestore
export async function deleteFirestorePostsBatch(postIds: string[]) {
  try {
    const deletePromises = postIds.map(id => deleteDoc(doc(db, POSTS_COLLECTION, id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Could not delete selected posts batch from Firestore:', err);
  }
}

// Like/Unlike post in Firestore
export async function togglePostLikeInFirestore(postId: string, isLiked: boolean) {
  try {
    const postDoc = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postDoc, {
      likesCount: increment(isLiked ? 1 : -1)
    });
  } catch (err) {
    console.warn('Could not update like count in Firestore:', err);
  }
}

// Add comment to Post in Firestore
export async function addCommentToFirestore(postId: string, comment: Comment) {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    await addDoc(commentsRef, {
      postId: postId,
      userId: comment.userId,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      content: comment.content,
      createdAt: comment.createdAt,
      timestamp: Date.now()
    });

    const postDoc = doc(db, POSTS_COLLECTION, postId);
    await updateDoc(postDoc, {
      commentsCount: increment(1)
    });
  } catch (err) {
    console.error('Failed to save comment to Firestore:', err);
  }
}

// Sync User Profile to Firestore
export async function syncUserProfileToFirestore(user: User) {
  if (!user.id) return;
  try {
    const userRef = doc(db, USERS_COLLECTION, user.id);
    
    // Prune excessive notifications and giant base64 strings to prevent Firestore 1MB document limit error
    const sanitizedAvatar = (user.avatar && user.avatar.length > 300000) ? DEFAULT_AVATAR : user.avatar;
    const sanitizedCover = (user.coverImage && user.coverImage.length > 500000) ? undefined : user.coverImage;

    const profileData = {
      name: user.name,
      email: user.email,
      avatar: sanitizedAvatar,
      coverImage: sanitizedCover || null,
      bio: user.bio || '',
      favoriteVerse: user.favoriteVerse || '',
      role: user.role || 'Believer Member',
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      followingIds: (user.followingIds || []).slice(0, 100),
      followerIds: (user.followerIds || []).slice(0, 100),
      isConfirmed: user.isConfirmed ?? true,
      confirmationCode: user.confirmationCode || null,
      lastActive: Date.now()
    };

    await updateDoc(userRef, profileData).catch(async () => {
      // Document doesn't exist yet, create with setDoc fallback
      const { setDoc } = await import('firebase/firestore');
      await setDoc(userRef, {
        ...profileData,
        joinedDate: user.joinedDate || 'August 2026'
      });
    });
  } catch (err) {
    console.warn('Failed to sync user profile to Firestore:', err);
  }
}

// Subscribe to all Users in Firestore
export function subscribeToAllUsers(onUsersUpdate: (users: User[]) => void) {
  const usersRef = collection(db, USERS_COLLECTION);
  return onSnapshot(usersRef, (snapshot) => {
    const usersList: User[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || 'Believer',
        email: data.email || '',
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        coverImage: data.coverImage || undefined,
        bio: data.bio || '',
        favoriteVerse: data.favoriteVerse || 'John 3:16',
        joinedDate: data.joinedDate || 'August 2026',
        role: data.role || 'Believer Member',
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        followingIds: data.followingIds || [],
        followerIds: data.followerIds || []
      };
    });
    onUsersUpdate(usersList);
  }, (err) => {
    console.warn('Users snapshot note:', err);
  });
}

// Real-time Direct Messages (DMs) in Firestore
export function subscribeToDirectMessages(userId1: string, userId2: string, onMessagesUpdate: (msgs: DirectMessage[]) => void) {
  const dmsRef = collection(db, DMS_COLLECTION);
  const q = query(dmsRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const relevantMsgs: DirectMessage[] = [];
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const sId = data.senderId;
      const rId = data.receiverId;
      if ((sId === userId1 && rId === userId2) || (sId === userId2 && rId === userId1)) {
        relevantMsgs.push({
          id: docSnap.id,
          senderId: sId,
          receiverId: rId,
          content: data.content || '',
          timestamp: data.createdAt || 'Just now',
          isRead: data.isRead || false
        });
      }
    });
    onMessagesUpdate(relevantMsgs);
  }, (err) => {
    console.warn('DMs subscription note:', err);
  });
}

// Send Direct Message in Firestore
export async function sendDirectMessageToFirestore(msg: DirectMessage) {
  try {
    const dmsRef = collection(db, DMS_COLLECTION);
    await addDoc(dmsRef, {
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      createdAt: msg.timestamp || 'Just now',
      isRead: false,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error('Failed to send DM to Firestore:', err);
  }
}

// Send Notification / Follow Request to target user in Firestore
export async function sendNotificationToFirestore(toUserId: string, notification: any) {
  try {
    const notifsRef = collection(db, NOTIFICATIONS_COLLECTION);
    await addDoc(notifsRef, {
      toUserId: toUserId,
      fromUserId: notification.fromUserId,
      fromUserName: notification.fromUserName,
      fromUserAvatar: notification.fromUserAvatar,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: false,
      timestamp: Date.now(),
      createdAt: 'Just now'
    });
  } catch (err) {
    console.error('Failed to send notification to Firestore:', err);
  }
}

// Subscribe to Notifications for a specific user in Firestore
export function subscribeToUserNotifications(userId: string, onNotifsUpdate: (notifs: any[]) => void) {
  if (!userId) return () => {};
  const notifsRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(notifsRef, orderBy('timestamp', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const myNotifs: any[] = [];
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.toUserId === userId) {
        myNotifs.push({
          id: docSnap.id,
          title: data.title || 'Notification',
          message: data.message || '',
          timestamp: data.createdAt || 'Just now',
          isRead: data.isRead || false,
          type: data.type || 'system',
          fromUserId: data.fromUserId,
          fromUserName: data.fromUserName,
          fromUserAvatar: data.fromUserAvatar
        });
      }
    });
    onNotifsUpdate(myNotifs);
  }, (err) => {
    console.warn('Notifications snapshot note:', err);
  });
}
