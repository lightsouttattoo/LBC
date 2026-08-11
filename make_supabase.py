code = """import { createClient } from '@supabase/supabase-js';
import { Post, Comment, User } from '../types';

const SUPABASE_URL = 'https://jsdsamkehoddpgmrukam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzZHNhbWtlaG9kZHBnbXJ1a2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNzgyOTcsImV4cCI6MjEwMDk1NDI5N30.WCX1X0FDM6y2yAmRLMYf1PrDlkswjQJGDnf8W6wbuAs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function loginWithEmail(email: string, pass: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error || !data.user) {
    console.error('Login error:', error?.message);
    return null;
  }
  return await fetchUserProfile(data.user.id);
}

export async function registerWithEmail(email: string, pass: string, name: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: { data: { display_name: name } }
  });

  if (error || !data.user) {
    console.error('Registration error:', error?.message);
    return null;
  }

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
  };

  await supabase.from('profiles').insert([newProfile]);
  return newProfile;
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as User;
}

export function subscribeToPosts(onPostsUpdate: (posts: Post[]) => void) {
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      onPostsUpdate(data as Post[]);
    }
  };

  fetchPosts();

  const channel = supabase
    .channel('public_posts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchPosts)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function addCommentToSupabase(postId: string, comment: Comment) {
  const { error } = await supabase.from('comments').insert([{
    post_id: postId,
    user_id: comment.userId,
    user_name: comment.userName,
    user_avatar: comment.userAvatar,
    content: comment.content
  }]);

  if (error) {
    console.error('Failed to add comment:', error.message);
  }
}
"""

with open('src/lib/supabase.ts', 'w') as f:
    f.write(code)

print("Successfully wrote src/lib/supabase.ts!")
