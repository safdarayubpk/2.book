/**
 * Authentication Types
 * Types for user authentication and personalization
 */

export type ProgrammingLevel = 'beginner' | 'intermediate' | 'advanced';
export type HardwareBackground = 'none' | 'hobbyist' | 'professional';
export type LearningGoal = 'career_transition' | 'academic' | 'personal' | 'upskilling';

export interface User {
  id: string;
  email: string;
  name?: string;
  programmingLevel?: ProgrammingLevel;
  hardwareBackground?: HardwareBackground;
  learningGoals?: LearningGoal[];
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  programmingLevel: ProgrammingLevel;
  hardwareBackground: HardwareBackground;
  learningGoals: LearningGoal[];
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface SessionResponse {
  session: {
    user: User;
  } | null;
}

export interface AuthError {
  error: string;
  detail?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}
