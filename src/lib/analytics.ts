declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export const trackEvent = (event: string, props?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible(event, { props });
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.plausible) {
    window.plausible('pageview', { props: { url } });
  }
};

export const events = {
  POST_CREATED: 'Post Created',
  MESSAGE_SENT: 'Message Sent',
  STORY_CREATED: 'Story Created',
  MARKETPLACE_ITEM_CREATED: 'Marketplace Item Created',
  USER_FOLLOWED: 'User Followed',
  SEARCH_PERFORMED: 'Search Performed'
};