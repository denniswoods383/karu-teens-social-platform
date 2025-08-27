import { createClient } from '@supabase/supabase-js';
import { getNextSupabaseAccount, getRandomSupabaseAccount } from './multi-accounts';

// Create multiple Supabase clients
const supabaseClients = new Map();

export const getSupabaseClient = (strategy: 'rotation' | 'random' = 'rotation') => {
  const account = strategy === 'rotation' ? getNextSupabaseAccount() : getRandomSupabaseAccount();
  
  if (!account) {
    throw new Error('No active Supabase accounts available');
  }

  // Return cached client or create new one
  if (!supabaseClients.has(account.id)) {
    const client = createClient(account.url, account.key);
    supabaseClients.set(account.id, client);
  }

  return supabaseClients.get(account.id);
};

// Fallback to primary account for critical operations
export const getPrimarySupabaseClient = () => {
  const primaryAccount = getNextSupabaseAccount();
  if (!primaryAccount) {
    throw new Error('No Supabase accounts configured');
  }

  if (!supabaseClients.has(primaryAccount.id)) {
    const client = createClient(primaryAccount.url, primaryAccount.key);
    supabaseClients.set(primaryAccount.id, client);
  }

  return supabaseClients.get(primaryAccount.id);
};

// Retry mechanism with different accounts
export const executeWithRetry = async (operation: (client: any) => Promise<any>, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const client = getSupabaseClient('random');
      return await operation(client);
    } catch (error) {
      lastError = error;
      console.warn(`Supabase operation failed, attempt ${i + 1}/${maxRetries}:`, error);
    }
  }
  
  throw lastError;
};