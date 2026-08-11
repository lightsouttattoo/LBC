import { User } from '../types';

export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1509021436468-d5103e63986a?auto=format&fit=crop&q=80&w=1200';

export function ensureUserDefaults(inputUser?: Partial<User> | null): User {
  if (!inputUser) {
    return {
      id: 'user_tex_admin',
      name: 'Tex',
      email: 'lightsouttattootex@gmail.com',
      avatar: DEFAULT_AVATAR,
      coverImage: DEFAULT_COVER,
      bio: 'Administrator & Owner of Living on a Prayer. Walking in faith, leading and managing our Christian prayer community.',
      favoriteVerse: 'Philippians 4:13',
      joinedDate: 'August 2026',
      role: 'Administrator & App Owner',
      followersCount: 15,
      followingCount: 8,
      followingIds: ['user_2', 'user_3'],
      followerIds: ['user_2'],
      followRequests: [],
      notifications: [],
      pushNotificationsEnabled: true,
      isConfirmed: true
    };
  }

  const email = (inputUser.email || 'believer@livingonaprayer.app').trim().toLowerCase();
  const isTex = email === 'lightsouttattootex@gmail.com' || inputUser.id === 'user_tex_admin';

  const rawName = inputUser.name || (email.includes('@') ? email.split('@')[0] : email) || (isTex ? 'Tex' : 'Brother Christian');
  const name = rawName.trim();

  return {
    id: inputUser.id || (isTex ? 'user_tex_admin' : `user_${Date.now()}`),
    name: name || (isTex ? 'Tex' : 'Brother Christian'),
    email,
    avatar: inputUser.avatar || DEFAULT_AVATAR,
    coverImage: inputUser.coverImage || DEFAULT_COVER,
    bio: inputUser.bio ?? (isTex ? 'Administrator & Owner of Living on a Prayer.' : 'Serving Christ through living on a prayer.'),
    favoriteVerse: inputUser.favoriteVerse ?? (isTex ? 'Philippians 4:13' : 'Romans 8:28'),
    joinedDate: inputUser.joinedDate || 'August 2026',
    role: isTex ? 'Administrator & App Owner' : (inputUser.role || 'Believer Member'),
    followersCount: typeof inputUser.followersCount === 'number' ? inputUser.followersCount : (Array.isArray(inputUser.followerIds) ? inputUser.followerIds.length : 15),
    followingCount: typeof inputUser.followingCount === 'number' ? inputUser.followingCount : (Array.isArray(inputUser.followingIds) ? inputUser.followingIds.length : 8),
    followingIds: Array.isArray(inputUser.followingIds) ? inputUser.followingIds : ['user_2', 'user_3'],
    followerIds: Array.isArray(inputUser.followerIds) ? inputUser.followerIds : ['user_2'],
    followRequests: Array.isArray(inputUser.followRequests) ? inputUser.followRequests : [],
    notifications: Array.isArray(inputUser.notifications) ? inputUser.notifications : [],
    pushNotificationsEnabled: typeof inputUser.pushNotificationsEnabled === 'boolean' ? inputUser.pushNotificationsEnabled : true,
    isConfirmed: isTex ? true : (typeof inputUser.isConfirmed === 'boolean' ? inputUser.isConfirmed : true),
    confirmationCode: inputUser.confirmationCode
  };
}
