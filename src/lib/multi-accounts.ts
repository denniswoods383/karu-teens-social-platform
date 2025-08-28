// Multi-account configuration for Supabase and Cloudinary
export const SUPABASE_ACCOUNTS = [
  {
    id: 'supabase_1',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_1 || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_1 || '',
    active: true
  },
  {
    id: 'supabase_2',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_2 || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_2 || '',
    active: true
  },
  {
    id: 'supabase_3',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_3 || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_3 || '',
    active: true
  },
  {
    id: 'supabase_4',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_4 || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_4 || '',
    active: true
  },
  {
    id: 'supabase_5',
    url: process.env.NEXT_PUBLIC_SUPABASE_URL_5 || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_5 || '',
    active: true
  }
];

export const CLOUDINARY_ACCOUNTS = [
  {
    id: 'cloudinary_1',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_1 || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_1 || 'karu_uploads',
    active: true
  },
  {
    id: 'cloudinary_2',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_2 || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_2 || 'karu_uploads',
    active: true
  },
  {
    id: 'cloudinary_3',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_3 || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_3 || 'karu_uploads',
    active: true
  },
  {
    id: 'cloudinary_4',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_4 || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_4 || 'karu_uploads',
    active: true
  },
  {
    id: 'cloudinary_5',
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_5 || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_5 || 'karu_uploads',
    active: true
  }
];

// Separate Cloudinary accounts for streaming content
export const STREAMING_CLOUDINARY_ACCOUNTS = [
  {
    id: 'streaming_1',
    cloudName: process.env.NEXT_PUBLIC_STREAMING_CLOUDINARY_1 || '',
    uploadPreset: process.env.NEXT_PUBLIC_STREAMING_PRESET_1 || 'streaming_uploads',
    active: true
  },
  {
    id: 'streaming_2',
    cloudName: process.env.NEXT_PUBLIC_STREAMING_CLOUDINARY_2 || '',
    uploadPreset: process.env.NEXT_PUBLIC_STREAMING_PRESET_2 || 'streaming_uploads',
    active: true
  },
  {
    id: 'streaming_3',
    cloudName: process.env.NEXT_PUBLIC_STREAMING_CLOUDINARY_3 || '',
    uploadPreset: process.env.NEXT_PUBLIC_STREAMING_PRESET_3 || 'streaming_uploads',
    active: true
  }
];

// Account rotation logic
let currentSupabaseIndex = 0;
let currentCloudinaryIndex = 0;

export const getNextSupabaseAccount = () => {
  const activeAccounts = SUPABASE_ACCOUNTS.filter(acc => acc.active && acc.url && acc.key);
  if (activeAccounts.length === 0) return null;
  
  const account = activeAccounts[currentSupabaseIndex % activeAccounts.length];
  currentSupabaseIndex++;
  return account;
};

export const getNextCloudinaryAccount = () => {
  const activeAccounts = CLOUDINARY_ACCOUNTS.filter(acc => acc.active && acc.cloudName);
  if (activeAccounts.length === 0) return null;
  
  const account = activeAccounts[currentCloudinaryIndex % activeAccounts.length];
  currentCloudinaryIndex++;
  return account;
};

// Random account selection for load balancing
export const getRandomSupabaseAccount = () => {
  const activeAccounts = SUPABASE_ACCOUNTS.filter(acc => acc.active && acc.url && acc.key);
  if (activeAccounts.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * activeAccounts.length);
  return activeAccounts[randomIndex];
};

export const getRandomCloudinaryAccount = () => {
  const activeAccounts = CLOUDINARY_ACCOUNTS.filter(acc => acc.active && acc.cloudName);
  if (activeAccounts.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * activeAccounts.length);
  return activeAccounts[randomIndex];
};