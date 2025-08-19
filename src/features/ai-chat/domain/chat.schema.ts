import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  role: z.enum(['user', 'assistant']),
  timestamp: z.date(),
  image: z.object({
    url: z.string().url(),
    alt: z.string(),
    size: z.number().positive()
  }).optional(),
  status: z.enum(['sending', 'sent', 'error'])
});

export const ChatStateSchema = z.object({
  messages: z.array(MessageSchema),
  isLoading: z.boolean(),
  error: z.string().nullable(),
  conversationId: z.string().nullable()
});

export const StarterPromptSchema = z.object({
  id: z.string(),
  category: z.enum(['creative', 'analytical', 'educational', 'casual']),
  title: z.string().min(1, 'Title is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  icon: z.string()
});

export const ImageAttachmentSchema = z.object({
  file: z.instanceof(File),
  preview: z.string().url(),
  isValid: z.boolean(),
  error: z.string().optional()
});

export const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  image: z.instanceof(File).optional()
});

// Image validation schema
export const ImageFileSchema = z.instanceof(File)
  .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
  .refine(
    (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
    'File must be a valid image format (JPEG, PNG, GIF, WebP)'
  );

export type MessageType = z.infer<typeof MessageSchema>;
export type ChatStateType = z.infer<typeof ChatStateSchema>;
export type StarterPromptType = z.infer<typeof StarterPromptSchema>;
export type ImageAttachmentType = z.infer<typeof ImageAttachmentSchema>;
export type ChatInputType = z.infer<typeof ChatInputSchema>;