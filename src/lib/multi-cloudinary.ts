import { getNextCloudinaryAccount, getRandomCloudinaryAccount } from './multi-accounts';

export const uploadToMultiCloudinary = async (file: File, strategy: 'rotation' | 'random' = 'rotation') => {
  const account = strategy === 'rotation' ? getNextCloudinaryAccount() : getRandomCloudinaryAccount();
  
  if (!account) {
    throw new Error('No active Cloudinary accounts available');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', account.uploadPreset);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${account.cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  );
  
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return {
    ...result,
    account_used: account.id
  };
};

// Retry mechanism with different Cloudinary accounts
export const uploadWithRetry = async (file: File, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadToMultiCloudinary(file, 'random');
    } catch (error) {
      lastError = error;
      console.warn(`Cloudinary upload failed, attempt ${i + 1}/${maxRetries}:`, error);
    }
  }
  
  throw lastError;
};

// Batch upload with load balancing
export const uploadMultipleFiles = async (files: File[]) => {
  const uploadPromises = files.map(file => uploadWithRetry(file));
  return Promise.all(uploadPromises);
};