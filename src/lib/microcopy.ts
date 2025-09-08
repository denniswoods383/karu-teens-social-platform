// Centralized microcopy for consistent, encouraging messaging

export const microcopy = {
  // Authentication
  auth: {
    loginSuccess: 'Welcome back! 🎉',
    loginError: 'Email or password is incorrect (try resetting your password).',
    emailNotConfirmed: 'Please check your email and click the confirmation link first.',
    magicLinkSent: 'Check your email! We sent you a magic link 📧',
    magicLinkError: 'Unable to send magic link. Please check your email address and try again.',
    socialLoginError: 'Social login failed. Please try again or use email instead.',
    connectionError: 'Connection issue. Please check your internet and try again.',
    signupSuccess: 'Account created! Welcome to KaruTeens 🎓',
    passwordResetSent: 'Password reset link sent! Check your email 📬',
    passwordResetError: 'Unable to send reset link. Please check your email address.',
  },

  // Posts & Content
  posts: {
    createSuccess: 'Post shared! Your content is now live for everyone to see ✨',
    createError: 'Unable to share post. Please check your connection and try again.',
    deleteSuccess: 'Post deleted successfully',
    deleteError: 'Unable to delete post. Please try again.',
    likeError: 'Unable to like post. Please try again.',
    commentSuccess: 'Comment added! 💬',
    commentError: 'Unable to add comment. Please try again.',
    emptyContent: 'Please write something or add a file to share',
    rateLimitError: 'You\'re posting too quickly! Please wait a moment before sharing again.',
  },

  // Groups
  groups: {
    joinSuccess: 'Welcome to the group! 🎉 You\'ll get notified about new sessions.',
    joinError: 'Unable to join group. Please try again.',
    leaveSuccess: 'You\'ve left the group',
    leaveError: 'Unable to leave group. Please try again.',
    createSuccess: 'Study group created! Invite your classmates to join 📚',
    createError: 'Unable to create group. Please try again.',
  },

  // Profile
  profile: {
    updateSuccess: 'Profile updated! Your changes are now visible to others ✅',
    updateError: 'Unable to update profile. Please try again.',
    photoUploadSuccess: 'Profile photo updated! Looking great 📸',
    photoUploadError: 'Unable to upload photo. Please try a smaller file.',
    followSuccess: 'Now following! You\'ll see their posts in your feed 👥',
    followError: 'Unable to follow user. Please try again.',
    unfollowSuccess: 'Unfollowed successfully',
  },

  // Messages
  messages: {
    sendSuccess: 'Message sent! 💬',
    sendError: 'Unable to send message. Please check your connection.',
    deleteSuccess: 'Message deleted',
    deleteError: 'Unable to delete message. Please try again.',
    typingIndicator: 'is typing...',
    onlineStatus: 'Online now',
    lastSeen: 'Last seen',
  },

  // Notifications
  notifications: {
    markReadSuccess: 'All notifications marked as read ✅',
    markReadError: 'Unable to update notifications. Please try again.',
    settingsUpdated: 'Notification preferences updated 🔔',
    settingsError: 'Unable to update settings. Please try again.',
  },

  // File Upload
  files: {
    uploadSuccess: 'File uploaded successfully! 📎',
    uploadError: 'Upload failed. Please try a smaller file or check your connection.',
    sizeError: 'File too large. Please choose a file under 10MB.',
    typeError: 'File type not supported. Please use images, PDFs, or documents.',
    dragDropHint: '💡 Drag files, paste images, or click to browse',
  },

  // Search
  search: {
    noResults: 'No results found. Try different keywords or check spelling.',
    searching: 'Searching...',
    recentSearches: 'Recent searches',
    popularSearches: 'Popular among students',
    clearHistory: 'Clear search history',
  },

  // General UI
  ui: {
    loading: 'Loading...',
    saving: 'Saving...',
    saved: 'Saved!',
    retry: 'Try again',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    more: 'More',
    less: 'Less',
    showMore: 'Show more',
    showLess: 'Show less',
    viewAll: 'View all',
    seeMore: 'See more',
    loadMore: 'Load more',
    refresh: 'Refresh',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    done: 'Done',
    skip: 'Skip',
    continue: 'Continue',
    getStarted: 'Get started',
    learnMore: 'Learn more',
    comingSoon: 'Coming soon! 🚀',
    maintenance: 'We\'re making improvements. Please try again in a few minutes.',
  },

  // Placeholders
  placeholders: {
    email: 'Enter your university email',
    password: 'Enter your password',
    name: 'Your full name',
    bio: 'Tell other students about yourself...',
    search: 'Search posts, people, groups...',
    message: 'Type a message...',
    comment: 'Add a thoughtful comment...',
    groupName: 'Name your study group',
    groupDescription: 'What will you study together?',
  },

  // Success messages
  success: {
    generic: 'Success! ✅',
    welcome: 'Welcome to KaruTeens! 🎓',
    accountCreated: 'Account created successfully!',
    profileCompleted: 'Profile setup complete! You\'re ready to connect with students.',
    firstPost: 'Great first post! Your classmates will love this content.',
    firstFollow: 'Nice! Following others helps you discover great content.',
    firstGroup: 'Awesome! Study groups are the best way to learn together.',
  },

  // Error messages
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Connection issue. Please check your internet and try again.',
    server: 'Our servers are busy. Please try again in a moment.',
    notFound: 'Content not found. It may have been deleted.',
    unauthorized: 'Please log in to continue.',
    forbidden: 'You don\'t have permission to do that.',
    validation: 'Please check your input and try again.',
    timeout: 'Request timed out. Please try again.',
  }
};

// Helper function to get contextual error message
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  const message = error?.message || '';
  
  // Authentication errors
  if (message.includes('Invalid login credentials')) {
    return microcopy.auth.loginError;
  }
  if (message.includes('Email not confirmed')) {
    return microcopy.auth.emailNotConfirmed;
  }
  if (message.includes('network') || message.includes('fetch')) {
    return microcopy.errors.network;
  }
  if (message.includes('timeout')) {
    return microcopy.errors.timeout;
  }
  
  return microcopy.errors.generic;
};

// Helper function for encouraging button text
export const getActionText = (action: string, loading: boolean = false): string => {
  const actions: Record<string, { normal: string; loading: string }> = {
    login: { normal: 'Sign In', loading: 'Signing you in...' },
    signup: { normal: 'Join KaruTeens', loading: 'Creating your account...' },
    post: { normal: '✨ Share with Students', loading: '🚀 Sharing with your community...' },
    comment: { normal: 'Add Comment', loading: 'Adding comment...' },
    follow: { normal: 'Follow', loading: 'Following...' },
    join: { normal: 'Join Now', loading: 'Joining...' },
    save: { normal: 'Save Changes', loading: 'Saving...' },
    upload: { normal: 'Upload File', loading: 'Uploading...' },
    send: { normal: 'Send Message', loading: 'Sending...' },
  };
  
  const actionConfig = actions[action];
  if (!actionConfig) return loading ? 'Loading...' : action;
  
  return loading ? actionConfig.loading : actionConfig.normal;
};