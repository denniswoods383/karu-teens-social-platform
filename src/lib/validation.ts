import { z } from 'zod';

// Post validation
export const postSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  media_urls: z.array(z.string().url()).optional(),
});

// Message validation
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  receiver_id: z.string().uuid('Invalid receiver ID'),
  file_url: z.string().url().optional(),
  file_type: z.string().optional(),
  file_name: z.string().optional(),
});

// Story validation
export const storySchema = z.object({
  content: z.string().max(500, 'Story content too long'),
  media_url: z.string().url().optional(),
  media_type: z.enum(['text', 'image', 'video']).default('text'),
  category: z.enum(['study', 'campus', 'achievement', 'social']).default('social'),
});

// Marketplace item validation
export const marketplaceItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  price: z.number().min(0, 'Price must be positive').max(10000, 'Price too high'),
  category: z.enum(['textbooks', 'electronics', 'furniture', 'clothing', 'other']),
  condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).optional(),
  location: z.string().max(100, 'Location too long').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images').optional(),
});

// Profile validation
export const profileSchema = z.object({
  username: z.string().min(3, 'Username too short').max(30, 'Username too long').regex(/^[a-zA-Z0-9_]+$/, 'Invalid username'),
  full_name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

// Comment validation
export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
  post_id: z.string().uuid('Invalid post ID'),
});

// Report validation
export const reportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'misinformation', 'other']),
  details: z.string().max(1000, 'Details too long').optional(),
  reported_post_id: z.string().uuid().optional(),
  reported_user_id: z.string().uuid().optional(),
});

// Feedback validation
export const feedbackSchema = z.object({
  type: z.enum(['feedback', 'complaint']),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  anonymous: z.boolean().default(false),
  name: z.string().max(100, 'Name too long').optional(),
  email: z.string().email('Invalid email').optional(),
});

// Validation helper
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors.map(e => e.message) };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};