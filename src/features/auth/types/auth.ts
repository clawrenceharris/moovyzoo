import { z } from 'zod'

// Core User interface from Firebase Auth
export interface User {
  uid: string
  email: string
  emailVerified: boolean
  createdAt: Date
  lastLoginAt: Date
}

// Authentication state interface
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Signup form data
export interface SignupData {
  email: string
  password: string
}

// Login form data
export interface LoginData {
  email: string
  password: string
}

// Zod validation schemas
export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Type inference from schemas
export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
