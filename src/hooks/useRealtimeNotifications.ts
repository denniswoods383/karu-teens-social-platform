import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useSupabase';
import { showMessageNotification, showFollowNotification, showInfoNotification } from '../components/notifications/InAppNotification';

export function useRealtimeNotifications(isPublicPage = false) {
  const { user } = useAuth();

  useEffect(() => {
    if (isPublicPage || !user) return;

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('posts-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        const newPost = payload.new;
        if (newPost.user_id !== user.id) {
          showInfoNotification('📝 New post shared!', 'Check out what your comrades are sharing');
        }
      })
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        const newMessage = payload.new;
        if (newMessage.receiver_id === user.id) {
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();
          
          showMessageNotification(
            sender?.name || 'Someone',
            newMessage.content,
            newMessage.conversation_id,
            sender?.avatar_url
          );
        }
      })
      .subscribe();

    // Subscribe to new follows (temporarily disabled due to RLS issues)
    // const followsChannel = supabase
    //   .channel('follows-notifications')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'follows'
    //   }, (payload) => {
    //     const newFollow = payload.new;
    //     if (newFollow.following_id === user.id) {
    //       addNotification('👥 Someone followed you!', 'success');
    //     }
    //   })
    //   .subscribe();

    // Subscribe to new users
    const usersChannel = supabase
      .channel('users-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        const newUser = payload.new;
        if (newUser.id !== user.id) {
          showInfoNotification('🎓 New student joined!', `Welcome ${newUser.name || 'a new comrade'} to KaruTeens!`);
        }
      })
      .subscribe();

    return () => {
      postsChannel.unsubscribe();
      messagesChannel.unsubscribe();
      // followsChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, [user, isPublicPage]);
}