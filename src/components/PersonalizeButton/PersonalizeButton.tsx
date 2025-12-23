/**
 * PersonalizeButton Component
 * Button to personalize chapter content based on user profile
 */

import React, { useState, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAuth } from '../../context/AuthContext';
import { usePersonalization } from '../../hooks/usePersonalization';
import AuthModal from '../auth/AuthModal';
import type { ChapterSlug } from '../../types/personalization';
import styles from './PersonalizeButton.module.css';

interface PersonalizeButtonProps {
  chapterSlug: ChapterSlug;
  onContentChange?: (content: string | null, isPersonalized: boolean) => void;
  currentContent?: string;
}

// Sparkle icon for personalize button
const SparkleIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Check icon for personalized banner
const CheckIcon = () => (
  <svg className={styles.bannerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Error icon
const ErrorIcon = () => (
  <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// X icon for dismiss
const XIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function PersonalizeButtonContent({
  chapterSlug,
  onContentChange,
  currentContent = '',
}: PersonalizeButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const {
    isPersonalized,
    isLoading,
    error,
    personalizedContent,
    profileSummary,
    personalize,
    restoreOriginal,
    clearError,
  } = usePersonalization();

  // Handle personalize button click
  const handlePersonalize = useCallback(async () => {
    if (!isAuthenticated) {
      setShowGuestPrompt(true);
      return;
    }

    await personalize(chapterSlug, currentContent);
  }, [isAuthenticated, personalize, chapterSlug, currentContent]);

  // Handle restore original
  const handleRestore = useCallback(() => {
    restoreOriginal();
    if (onContentChange) {
      onContentChange(null, false);
    }
  }, [restoreOriginal, onContentChange]);

  // Handle sign up click from guest prompt
  const handleSignUpClick = useCallback(() => {
    setShowGuestPrompt(false);
    setShowAuthModal(true);
  }, []);

  // Notify parent of content changes
  React.useEffect(() => {
    if (onContentChange && isPersonalized && personalizedContent) {
      onContentChange(personalizedContent, true);
    }
  }, [onContentChange, isPersonalized, personalizedContent]);

  return (
    <div className={styles.container}>
      {/* Personalized content banner */}
      {isPersonalized && profileSummary && (
        <div className={styles.banner}>
          <CheckIcon />
          <span className={styles.bannerText}>
            Content adapted for your level: {profileSummary}
          </span>
        </div>
      )}

      {/* Button wrapper */}
      <div className={styles.buttonWrapper}>
        {isPersonalized ? (
          <>
            <button
              className={styles.restoreButton}
              onClick={handleRestore}
              type="button"
            >
              Show Original
            </button>
            <button
              className={styles.personalizeButton}
              onClick={handlePersonalize}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Personalizing...
                </>
              ) : (
                <>
                  <SparkleIcon />
                  Personalize Again
                </>
              )}
            </button>
          </>
        ) : (
          <button
            className={`${styles.personalizeButton} ${isLoading ? styles.loading : ''}`}
            onClick={handlePersonalize}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Personalizing...
              </>
            ) : (
              <>
                <SparkleIcon />
                Personalize for Me
              </>
            )}
          </button>
        )}
      </div>

      {/* Guest prompt */}
      {showGuestPrompt && !isAuthenticated && (
        <div className={styles.guestPrompt}>
          <p className={styles.guestPromptText}>
            Sign up to personalize content based on your programming level and learning goals.
          </p>
          <span className={styles.signUpLink} onClick={handleSignUpClick}>
            Create an account to get started
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className={styles.error}>
          <ErrorIcon />
          <span>{error}</span>
          <button
            className={styles.dismissError}
            onClick={clearError}
            aria-label="Dismiss error"
            type="button"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Auth Modal for guest signup */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialView="signup"
      />
    </div>
  );
}

// Wrap in BrowserOnly to avoid SSR issues
export default function PersonalizeButton(props: PersonalizeButtonProps) {
  return (
    <BrowserOnly fallback={<div className={styles.container} />}>
      {() => <PersonalizeButtonContent {...props} />}
    </BrowserOnly>
  );
}

export { PersonalizeButton };
