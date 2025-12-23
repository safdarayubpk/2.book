/**
 * Personalization Types
 * Types for content personalization feature
 */

import type { ProgrammingLevel, HardwareBackground, LearningGoal } from './auth';

/**
 * User profile data required for personalization
 */
export interface UserProfile {
  programming_level: ProgrammingLevel;
  hardware_background: HardwareBackground;
  learning_goals: LearningGoal[];
}

/**
 * Valid chapter slugs for personalization
 */
export type ChapterSlug =
  | 'intro'
  | 'chapter-1'
  | 'chapter-2'
  | 'chapter-3'
  | 'chapter-4'
  | 'chapter-5'
  | 'chapter-6';

/**
 * Request payload for personalization API
 */
export interface PersonalizeRequest {
  chapter_slug: ChapterSlug;
  user_profile: UserProfile;
}

/**
 * Metadata about the personalization process
 */
export interface PersonalizeMetadata {
  processing_time_ms: number;
  tokens_used: number;
  profile_summary: string;
}

/**
 * Response from personalization API
 */
export interface PersonalizeResponse {
  chapter_slug: string;
  original_title: string;
  personalized_content: string;
  metadata: PersonalizeMetadata;
}

/**
 * Error response from personalization API
 */
export interface PersonalizeError {
  error: string;
  message: string;
}

/**
 * Frontend state for personalization feature
 */
export interface PersonalizationState {
  isPersonalized: boolean;
  isLoading: boolean;
  error: string | null;
  originalContent: string | null;
  personalizedContent: string | null;
  profileSummary: string | null;
}

/**
 * Initial state for personalization
 */
export const initialPersonalizationState: PersonalizationState = {
  isPersonalized: false,
  isLoading: false,
  error: null,
  originalContent: null,
  personalizedContent: null,
  profileSummary: null,
};
