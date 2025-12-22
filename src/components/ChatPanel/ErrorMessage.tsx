/**
 * ErrorMessage - Friendly error display with retry functionality
 * Task T044
 */

import React from 'react';
import styles from './ErrorMessage.styles.module.css';

export type ErrorType = 'network' | 'timeout' | 'no_content' | 'validation' | 'session_expired' | 'generic';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Get friendly error message based on error type
 */
function getFriendlyMessage(type: ErrorType, message: string): string {
  switch (type) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection.';
    case 'timeout':
      return 'The request took too long. The server might be busy.';
    case 'no_content':
      return "I couldn't find relevant content for your question. Try rephrasing or asking about a different topic.";
    case 'validation':
      return message;
    case 'session_expired':
      return 'Your session has expired. Starting a new conversation.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
}

/**
 * Get suggestion based on error type
 */
function getSuggestion(type: ErrorType): string | null {
  switch (type) {
    case 'network':
      return 'Check your connection and try again.';
    case 'timeout':
      return 'Try again or simplify your question.';
    case 'no_content':
      return 'Try asking about topics covered in the textbook.';
    case 'session_expired':
      return null;
    default:
      return null;
  }
}

/**
 * ErrorMessage component
 * Displays friendly error messages with retry option
 */
export default function ErrorMessage({
  message,
  type = 'generic',
  onRetry,
  onDismiss,
}: ErrorMessageProps): React.ReactElement {
  const friendlyMessage = getFriendlyMessage(type, message);
  const suggestion = getSuggestion(type);
  const showRetry = type !== 'validation' && type !== 'session_expired' && onRetry;

  return (
    <div
      className={`${styles.errorContainer} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.errorIcon} aria-hidden="true">
        {type === 'no_content' ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      <div className={styles.errorContent}>
        <p className={styles.errorMessage}>{friendlyMessage}</p>
        {suggestion && <p className={styles.errorSuggestion}>{suggestion}</p>}
      </div>

      <div className={styles.errorActions}>
        {showRetry && (
          <button
            type="button"
            className={styles.retryButton}
            onClick={onRetry}
            aria-label="Retry sending message"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className={styles.dismissButton}
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
