import { supabase } from './supabase';

export const rateLimitErrors = {
  posts: 'Rate limit exceeded: Maximum 10 posts per hour',
  messages: 'Rate limit exceeded: Maximum 100 messages per hour', 
  follows: 'Rate limit exceeded: Maximum 50 follows per day'
};

export async function checkRateLimit(type: 'posts' | 'messages' | 'follows'): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const now = new Date();
  const timeLimit = type === 'follows' ? 24 : 1; // hours
  const maxCount = type === 'posts' ? 10 : type === 'messages' ? 100 : 50;
  
  const table = type === 'follows' ? 'follows' : type;
  const userField = type === 'posts' ? 'author_id' : type === 'messages' ? 'sender_id' : 'follower_id';
  
  const { count } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(userField, user.id)
    .gte('created_at', new Date(now.getTime() - timeLimit * 60 * 60 * 1000).toISOString());
    
  return (count || 0) < maxCount;
}