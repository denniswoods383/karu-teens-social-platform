import { supabase } from './supabase';

// SWR fetcher functions
export const fetcher = async (key: string) => {
  const [table, ...params] = key.split(':');
  
  switch (table) {
    case 'posts':
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return posts;
      
    case 'stories':
      const { data: stories } = await supabase
        .from('stories')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
      return stories;
      
    case 'marketplace':
      const { data: items } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(12);
      return items;
      
    case 'profile':
      const [, userId] = params;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return profile;
      
    default:
      throw new Error(`Unknown table: ${table}`);
  }
};

// SWR configuration
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 30000, // 30 seconds
  dedupingInterval: 5000, // 5 seconds
};