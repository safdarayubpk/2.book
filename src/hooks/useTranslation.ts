/**
 * useTranslation Hook
 * Manages translation state for chapter content
 * Feature: 013-urdu-translation
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { translateContent, TranslateApiError } from '../services/translationApi';
import type { TranslationState, initialTranslationState } from '../types/translation';
import type { ChapterSlug } from '../types/personalization';

interface UseTranslationReturn extends TranslationState {
  translate: (chapterSlug: ChapterSlug, currentContent: string) => Promise<void>;
  restoreOriginal: () => void;
  clearError: () => void;
}

export function useTranslation(): UseTranslationReturn {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<TranslationState>({
    isLoading: false,
    isTranslated: false,
    error: null,
    originalContent: null,
    translatedContent: null,
    translatedTitle: null,
  });

  const translate = useCallback(
    async (chapterSlug: ChapterSlug, currentContent: string) => {
      // Must be authenticated
      if (!isAuthenticated || !user) {
        setState((prev) => ({
          ...prev,
          error: 'Please sign in to translate content',
        }));
        return;
      }

      // Store original content before translating
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        originalContent: prev.originalContent || currentContent,
      }));

      try {
        const response = await translateContent({
          chapter_id: chapterSlug,
          user_id: user.id,
        });

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isTranslated: true,
          translatedContent: response.translated_content,
          translatedTitle: response.translated_title,
        }));
      } catch (error) {
        let errorMessage = 'Failed to translate content. Please try again.';

        if (error instanceof TranslateApiError) {
          switch (error.type) {
            case 'timeout':
              errorMessage = 'Translation timed out. Please try again.';
              break;
            case 'network':
              errorMessage = 'Unable to connect to the server. Please check your connection.';
              break;
            case 'unauthorized':
              errorMessage = 'Please sign in to translate content.';
              break;
            case 'not_found':
              errorMessage = 'Chapter content not found.';
              break;
            default:
              errorMessage = error.message;
          }
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [isAuthenticated, user]
  );

  const restoreOriginal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isTranslated: false,
      translatedContent: null,
      translatedTitle: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    translate,
    restoreOriginal,
    clearError,
  };
}
