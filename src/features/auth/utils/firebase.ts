// TODO: This file will be replaced with Supabase implementation
// Keep for reference during migration
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { securityUtils } from "./security";
import type { User, SignupFormData, LoginFormData, Genre } from "../types";

// Authentication utilities
export const authUtils = {
  // Create new user account
  async signup(data: SignupFormData): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Send email verification
      await sendEmailVerification(userCredential.user);

      return userCredential.user;
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Sign in existing user with enhanced rate limiting
  async login(data: LoginFormData): Promise<FirebaseUser> {
    // Validate email format
    if (!securityUtils.isValidEmail(data.email)) {
      throw new Error("Please enter a valid email address");
    }

    // Check rate limiting
    const rateLimitCheck = securityUtils.checkLoginRateLimit(data.email);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Too many failed login attempts. Please try again in ${rateLimitCheck.lockoutTime} minutes.`
      );
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Reset login attempts on successful login
      securityUtils.resetLoginAttempts(data.email);

      return userCredential.user;
    } catch (error) {
      // Record failed login attempt
      securityUtils.recordFailedLogin(data.email);
      throw this.normalizeAuthError(error);
    }
  },

  // Sign out current user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Send password reset email with rate limiting
  async resetPassword(email: string): Promise<void> {
    // Validate email format
    if (!securityUtils.isValidEmail(email)) {
      throw new Error("Please enter a valid email address");
    }

    // Check rate limiting
    const rateLimitCheck = securityUtils.checkPasswordResetRateLimit(email);
    if (!rateLimitCheck.allowed) {
      throw new Error(
        `Too many password reset attempts. Please try again in ${rateLimitCheck.lockoutTime} minutes.`
      );
    }

    try {
      await sendPasswordResetEmail(auth, email);
      // Record password reset attempt
      securityUtils.recordPasswordResetAttempt(email);
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Update user password with strength validation (requires recent authentication)
  async updateUserPassword(newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user");
    }

    // Validate password strength
    const passwordValidation =
      securityUtils.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password requirements not met: ${passwordValidation.feedback.join(
          ", "
        )}`
      );
    }

    try {
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Reauthenticate user with password
  async reauthenticate(password: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No authenticated user");
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      throw this.normalizeAuthError(error);
    }
  },

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Convert Firebase user to app User interface
  convertFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      emailVerified: firebaseUser.emailVerified,
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime
        ? new Date(firebaseUser.metadata.lastSignInTime)
        : new Date(),
    };
  },

  // Security validation helpers
  validateSecureConnection(): void {
    if (!securityUtils.isSecureConnection()) {
      throw new Error("Secure connection required for authentication");
    }
  },

  // Normalize Firebase Auth errors to consistent format
  normalizeAuthError(error: unknown): Error {
    if (this.isAuthError(error)) {
      return new Error(this.getAuthErrorMessage(error));
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("An unexpected error occurred. Please try again.");
  },

  // Check if error is a Firebase Auth error
  isAuthError(error: unknown): error is AuthError {
    return (
      error !== null &&
      error !== undefined &&
      typeof error === "object" &&
      "code" in error &&
      typeof (error as AuthError).code === "string" &&
      (error as AuthError).code.startsWith("auth/")
    );
  },

  // Get user-friendly error message from Firebase Auth error
  getAuthErrorMessage(error: AuthError): string {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists";
      case "auth/invalid-email":
        return "Please enter a valid email address";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled";
      case "auth/weak-password":
        return "Password should be at least 6 characters";
      case "auth/user-disabled":
        return "This account has been disabled";
      case "auth/user-not-found":
        return "No account found with this email";
      case "auth/wrong-password":
        return "Incorrect password";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later";
      case "auth/network-request-failed":
        return "Network error. Please check your connection";
      case "auth/requires-recent-login":
        return "Please log in again to complete this action";
      case "auth/invalid-credential":
        return "Invalid email or password";
      default:
        return "An unexpected error occurred. Please try again";
    }
  },
};

// Re-export enhanced profile operations
export { profileOperations as profileUtils } from "./profile-operations";

// Database utilities for genres
export const genreUtils = {
  // Get all active genres
  async getGenres(): Promise<Genre[]> {
    const q = query(collection(db, "genres"), where("isActive", "==", true));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Genre[];
  },

  // Get genre by ID
  async getGenre(genreId: string): Promise<Genre | null> {
    const docRef = doc(db, "genres", genreId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Genre;
  },
};

// Error handling utilities (for backward compatibility with existing tests)
export const errorUtils = {
  // Check if error is a Firebase Auth error
  isAuthError(error: unknown): error is AuthError {
    return authUtils.isAuthError(error);
  },

  // Get user-friendly error message from Firebase Auth error
  getAuthErrorMessage(error: AuthError): string {
    return authUtils.getAuthErrorMessage(error);
  },
};

// Session management utilities
export const sessionUtils = {
  // Check if user session is valid
  isSessionValid(): boolean {
    const user = auth.currentUser;
    return user !== null && user.emailVerified;
  },

  // Get session token for API calls
  async getSessionToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Failed to get session token:", error);
      return null;
    }
  },

  // Refresh session token
  async refreshSessionToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      return await user.getIdToken(true); // Force refresh
    } catch (error) {
      console.error("Failed to refresh session token:", error);
      return null;
    }
  },

  // Check if session token is expired
  async isTokenExpired(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return true;

    try {
      const tokenResult = await user.getIdTokenResult();
      const expirationTime = new Date(tokenResult.expirationTime);
      const now = new Date();

      // Consider token expired if it expires within the next 5 minutes
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      return expirationTime.getTime() - now.getTime() < bufferTime;
    } catch (error) {
      console.error("Failed to check token expiration:", error);
      return true;
    }
  },

  // Handle session timeout
  async handleSessionTimeout(): Promise<void> {
    try {
      await authUtils.logout();
      // Redirect to login page would be handled by the useAuth hook
    } catch (error) {
      console.error("Failed to handle session timeout:", error);
    }
  },
};
