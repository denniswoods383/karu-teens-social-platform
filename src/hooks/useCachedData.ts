import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { memoryCache, CACHE_KEYS, cacheConfig } from '../lib/cache';

// Cached profile fetcher
export const useProfile = (userId?: string) => {
  return useSWR(
    userId ? CACHE_KEYS.PROFILE(userId) : null,
    async () => {
      const cached = memoryCache.get(CACHE_KEYS.PROFILE(userId!));
      if (cached) return cached;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) memoryCache.set(CACHE_KEYS.PROFILE(userId!), data, 600);
      return data;
    },
    cacheConfig
  );
};

// Cached posts fetcher
export const usePosts = (userId?: string) => {
  return useSWR(
    CACHE_KEYS.POSTS(userId),
    async () => {
      const cached = memoryCache.get(CACHE_KEYS.POSTS(userId));
      if (cached) return cached;

      let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);

      const { data } = await query;
      if (data) memoryCache.set(CACHE_KEYS.POSTS(userId), data, 300);
      return data || [];
    },
    cacheConfig
  );
};

// Cached marketplace items
export const useMarketplace = () => {
  return useSWR(
    CACHE_KEYS.MARKETPLACE,
    async () => {
      const cached = memoryCache.get(CACHE_KEYS.MARKETPLACE);
      if (cached) return cached;

      const { data } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      
      if (data) memoryCache.set(CACHE_KEYS.MARKETPLACE, data, 600);
      return data || [];
    },
    cacheConfig
  );
};

// Cached notifications
export const useNotifications = (userId: string) => {
  return useSWR(
    userId ? CACHE_KEYS.NOTIFICATIONS(userId) : null,
    async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      return data || [];
    },
    { ...cacheConfig, refreshInterval: 10000 }
  );
};