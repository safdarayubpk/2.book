/**
 * TranslateButton Component
 * Button to translate chapter content to Urdu
 * Feature: 013-urdu-translation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import AuthModal from '../auth/AuthModal';
import type { ChapterSlug } from '../../types/personalization';
import styles from './TranslateButton.module.css';

interface TranslateButtonProps {
  chapterSlug: ChapterSlug;
  onContentChange?: (content: string | null, isTranslated: boolean) => void;
  currentContent?: string;
}

// Simple markdown to HTML converter for translated content
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks (preserve them as-is)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\s*[-*]\s(.*)$/gm, '<li>$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines in paragraphs
    .replace(/\n/g, '<br/>');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';

  // Clean up list items into proper lists
  html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

  return html;
}

// Globe/Translate icon
const TranslateIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
  </svg>
);

// Check icon for translated banner
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

function TranslateButtonContent({
  chapterSlug,
  onContentChange,
  currentContent = '',
}: TranslateButtonProps) {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const {
    isTranslated,
    isLoading,
    error,
    translatedContent,
    translatedTitle,
    translate,
    restoreOriginal,
    clearError,
  } = useTranslation();

  // Handle translate button click
  const handleTranslate = useCallback(async () => {
    if (!isAuthenticated) {
      setShowGuestPrompt(true);
      return;
    }

    await translate(chapterSlug, currentContent);
  }, [isAuthenticated, translate, chapterSlug, currentContent]);

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
    if (onContentChange && isTranslated && translatedContent) {
      onContentChange(translatedContent, true);
    }
  }, [onContentChange, isTranslated, translatedContent]);

  return (
    <div className={styles.container}>
      {/* Translated content banner */}
      {isTranslated && (
        <div className={styles.banner} dir="rtl">
          <CheckIcon />
          <span className={styles.bannerText}>
            مواد اردو میں ترجمہ شدہ ہے (Content translated to Urdu)
          </span>
        </div>
      )}

      {/* Button wrapper */}
      <div className={styles.buttonWrapper}>
        {isTranslated ? (
          <>
            <button
              className={styles.restoreButton}
              onClick={handleRestore}
              type="button"
            >
              Show Original
            </button>
            <button
              className={styles.translateButton}
              onClick={handleTranslate}
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Translating...
                </>
              ) : (
                <>
                  <TranslateIcon />
                  Translate Again
                </>
              )}
            </button>
          </>
        ) : (
          <button
            className={`${styles.translateButton} ${isLoading ? styles.loading : ''}`}
            onClick={handleTranslate}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Translating...
              </>
            ) : (
              <>
                <TranslateIcon />
                Translate to Urdu
              </>
            )}
          </button>
        )}
      </div>

      {/* Guest prompt */}
      {showGuestPrompt && !isAuthenticated && (
        <div className={styles.guestPrompt}>
          <p className={styles.guestPromptText}>
            Sign up to translate content to Urdu.
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

      {/* Display translated content when available */}
      {isTranslated && translatedContent && (
        <div
          className="urdu-content markdown"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(translatedContent) }}
        />
      )}
    </div>
  );
}

// Wrap in BrowserOnly to avoid SSR issues
export default function TranslateButton(props: TranslateButtonProps) {
  return (
    <BrowserOnly fallback={<div className={styles.container} />}>
      {() => <TranslateButtonContent {...props} />}
    </BrowserOnly>
  );
}

export { TranslateButton };
