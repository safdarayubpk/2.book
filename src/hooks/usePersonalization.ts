/**
 * usePersonalization Hook
 * Manages personalization state for chapter content
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { personalizeContent, PersonalizeApiError } from '../services/personalizationApi';
import type {
  PersonalizationState,
  initialPersonalizationState,
  ChapterSlug,
  UserProfile,
} from '../types/personalization';

interface UsePersonalizationReturn extends PersonalizationState {
  personalize: (chapterSlug: ChapterSlug, currentContent: string) => Promise<void>;
  restoreOriginal: () => void;
  clearError: () => void;
}

export function usePersonalization(): UsePersonalizationReturn {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<PersonalizationState>({
    isPersonalized: false,
    isLoading: false,
    error: null,
    originalContent: null,
    personalizedContent: null,
    profileSummary: null,
  });

  const personalize = useCallback(
    async (chapterSlug: ChapterSlug, currentContent: string) => {
      // Must be authenticated
      if (!isAuthenticated || !user) {
        setState((prev) => ({
          ...prev,
          error: 'Please sign in to personalize content',
        }));
        return;
      }

      // Must have profile data
      if (!user.programmingLevel || !user.hardwareBackground || !user.learningGoals?.length) {
        setState((prev) => ({
          ...prev,
          error: 'Please complete your profile to personalize content',
        }));
        return;
      }

      // Store original content before personalizing
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        originalContent: prev.originalContent || currentContent,
      }));

      try {
        // Build user profile for API
        const userProfile: UserProfile = {
          programming_level: user.programmingLevel,
          hardware_background: user.hardwareBackground,
          learning_goals: user.learningGoals,
        };

        const response = await personalizeContent({
          chapter_slug: chapterSlug,
          user_profile: userProfile,
        });

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isPersonalized: true,
          personalizedContent: response.personalized_content,
          profileSummary: response.metadata.profile_summary,
        }));
      } catch (error) {
        let errorMessage = 'Failed to personalize content. Please try again.';

        if (error instanceof PersonalizeApiError) {
          switch (error.type) {
            case 'timeout':
              errorMessage = 'Personalization timed out. Please try again.';
              break;
            case 'network':
              errorMessage = 'Unable to connect to the server. Please check your connection.';
              break;
            case 'unauthorized':
              errorMessage = 'Please sign in to personalize content.';
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
      isPersonalized: false,
      personalizedContent: null,
      profileSummary: null,
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
    personalize,
    restoreOriginal,
    clearError,
  };
}
