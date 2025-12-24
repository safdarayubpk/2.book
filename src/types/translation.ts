/**
 * Translation Types
 * Types for Urdu translation feature (013-urdu-translation)
 */

import type { ChapterSlug } from './personalization';

/**
 * Request payload for translation API
 */
export interface TranslateRequest {
  chapter_id: ChapterSlug;
  user_id: string;
}

/**
 * Response from translation API
 */
export interface TranslateResponse {
  chapter_id: string;
  original_title: string;
  translated_title: string;
  translated_content: string;
  source_language: 'en';
  target_language: 'ur';
  translated_at: string;
}

/**
 * Error response from translation API
 */
export interface TranslateError {
  error: 'validation_error' | 'unauthorized' | 'not_found' | 'translation_failed' | 'timeout';
  message: string;
}

/**
 * Frontend state for translation feature
 */
export interface TranslationState {
  isLoading: boolean;
  isTranslated: boolean;
  error: string | null;
  originalContent: string | null;
  translatedContent: string | null;
  translatedTitle: string | null;
}

/**
 * Initial state for translation
 */
export const initialTranslationState: TranslationState = {
  isLoading: false,
  isTranslated: false,
  error: null,
  originalContent: null,
  translatedContent: null,
  translatedTitle: null,
};
