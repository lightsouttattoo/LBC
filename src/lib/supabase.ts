import { createClient } from '@supabase/supabase-js'
import { Post, Comment, User } from '../types'

const SUPABASE_URL = 'https://jsdsamkehoddpgmrukam.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHNhbWtlaG9kZHBnbXJ1a2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzgyOTcsImV4cCI6MjEwMDk1NDI5N30.WCX1X0FDM6y2yAmRLMYf1PrDlkswjQJGDnf8W6wbuAs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function loginWithEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
  if (error || !data.user) return null
  return await fetchUserProfile(data.user.id)
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { display_name: name } }
  })

  if (error || !data.user) return null

  const newProfile: User = {
    id: data.user.id,
    name: name || email.split('@')[0],
    email: email,
    role: 'Believer Member',
    joinedDate: 'August 2026',
    followersCount: 0,
    followingCount: 0,
    followingIds: [],
    followerIds: []
  }

  await supabase.from('profiles').insert([newProfile])
  return newProfile
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) return null
  return data as User
}

export async function findUserProfileByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single()
  if (error || !data) return null
  return data as User
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  await supabase.from('profiles').upsert([{
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    joinedDate: user.joinedDate,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    followingIds: user.followingIds,
    followerIds: user.followerIds,
    avatar: user.avatar,
    bio: user.bio,
    isConfirmed: user.isConfirmed
  }])
}

export async function createFirestorePost(post: Post) {
  await supabase.from('posts').insert([{
    id: post.id,
    user_id: post.userId,
    user_name: post.userName,
    user_avatar: post.userAvatar,
    content: post.content,
    image_url: post.imageUrl,
    video_url: post.videoUrl,
    youtube_id: post.youtubeId,
    category: post.category,
    likes_count: post.likesCount,
    comments_count: post.commentsCount || 0,
    shares_count: post.sharesCount || 0,
    created_at: post.createdAt
  }])
}

export async function updateFirestorePost(postId: string, updates: any) {
  await supabase.from('posts').update(updates).eq('id', postId)
}

export async function deleteFirestorePost(postId: string) {
  await supabase.from('posts').delete().eq('id', postId)
}

export async function deleteAllFirestorePosts() {
  await supabase.from('posts').delete().not('id', 'is', null)
}

export async function deleteFirestorePostsBatch(postIds: string[]) {
  await supabase.from('posts').delete().in('id', postIds)
}

export async function togglePostLikeInFirestore(postId: string, userId: string) {
  const { data } = await supabase.from('posts').select('liked_by, likes_count').eq('id', postId).single()
  if (!data) return
  
  let likedBy: string[] = data.liked_by || []
  if (likedBy.includes(userId)) {
    likedBy = likedBy.filter(id => id !== userId)
  } else {
    likedBy.push(userId)
  }

  await supabase.from('posts').update({
    liked_by: likedBy,
    likes_count: likedBy.length
  }).eq('id', postId)
}

export async function addCommentToSupabase(postId: string, comment: Comment) {
  await supabase.from('comments').insert([{
    post_id: postId,
    user_id: comment.userId,
    user_name: comment.userName,
    user_avatar: comment.userAvatar,
    content: comment.content
  }])
}

export async function addCommentToFirestore(postId: string, comment: Comment) {
  await addCommentToSupabase(postId, comment)
}

export function subscribeToAllUsers(callback: (users: User[]) => void) {
  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*')
    if (data) callback(data as User[])
  }
  fetchUsers()
  
  const channel = supabase.channel('public_profiles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
    .subscribe()
    
  return () => { supabase.removeChannel(channel) }
}

export function subscribeToUserNotifications(userId: string, callback: (notifs: any[]) => void) {
  const fetchNotifs = async () => {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) callback(data)
  }
  fetchNotifs()
  
  const channel = supabase.channel(`notifications_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifs)
    .subscribe()
    
  return () => { supabase.removeChannel(channel) }
}

export async function sendNotificationToFirestore(notif: any) {
  await supabase.from('notifications').insert([{
    user_id: notif.userId,
    sender_name: notif.senderName,
    sender_avatar: notif.senderAvatar,
    type: notif.type,
    content: notif.content,
    post_id: notif.postId,
    read: false
  }])
}

export function subscribeToPosts(callback: (posts: Post[]) => void) {
  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false })

    if (data) {
      const formattedPosts: Post[] = data.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        userName: p.user_name,
        userAvatar: p.user_avatar,
        title: p.title || '',
        category: p.category || 'Prayer Request',
        content: p.content,
        imageUrl: p.image_url,
        videoUrl: p.video_url,
        youtubeId: p.youtube_id,
        createdAt: p.created_at,
        likesCount: p.likes_count || 0,
        commentsCount: p.comments_count || 0,
        sharesCount: p.shares_count || 0,
        likedBy: p.liked_by || [],
        comments: (p.comments || []).map((c: any) => ({
          id: c.id.toString(),
          postId: c.post_id,
          userId: c.user_id,
          userName: c.user_name,
          userAvatar: c.user_avatar,
          content: c.content,
          createdAt: c.created_at,
          likes: c.likes || 0
        }))
      }))
      callback(formattedPosts)
    }
  }

  fetchPosts()

  const channel = supabase
    .channel('public_posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
