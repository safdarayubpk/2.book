/**
 * ChatPanel - Main chat drawer/panel component
 * Tasks T012, T022, T023
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useHistory } from '@docusaurus/router';
import { useChatContext } from '../../context/ChatContext';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { SourceCitation } from '../../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ErrorMessage from './ErrorMessage';
import styles from './styles.module.css';

/**
 * Loading spinner component
 */
function LoadingIndicator(): React.ReactElement {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingDots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <span className={styles.loadingText}>Thinking...</span>
    </div>
  );
}

/**
 * Session expiration warning component
 */
function SessionExpirationWarning({
  timeUntilExpiry,
}: {
  timeUntilExpiry: number | null;
}): React.ReactElement | null {
  if (timeUntilExpiry === null) return null;

  const minutes = Math.ceil(timeUntilExpiry / 60000);

  return (
    <div className={styles.expirationWarning} role="alert">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>
        Session expires in {minutes} minute{minutes !== 1 ? 's' : ''}. Send a
        message to extend.
      </span>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState(): React.ReactElement {
  return (
    <div className={styles.emptyState}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <h3>Ask a Question</h3>
      <p>
        Type your question below to get AI-powered answers from the textbook content.
      </p>
    </div>
  );
}

/**
 * ChatPanel component
 * Slide-in drawer with messages, input, and loading states
 */
export default function ChatPanel(): React.ReactElement | null {
  const history = useHistory();
  const {
    isOpen,
    closePanel,
    session,
    isLoading,
    error,
    sendMessage,
    clearSession,
    clearError,
    retryLastMessage,
    isSessionExpiring,
    timeUntilExpiry,
  } = useChatContext();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Focus trap for accessibility
  const panelRef = useFocusTrap<HTMLDivElement>({
    enabled: isOpen,
    returnFocusOnDeactivate: true,
  });

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages]);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

  // Handle citation click - scroll to sources
  const handleCitationClick = useCallback((citationIndex: number) => {
    // Find the source element and scroll to it
    const sourcesList = document.getElementById('sources-list');
    if (sourcesList) {
      const sourceItems = sourcesList.querySelectorAll('li');
      const targetSource = sourceItems[citationIndex - 1];
      if (targetSource) {
        targetSource.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight briefly
        targetSource.classList.add(styles.highlighted);
        setTimeout(() => {
          targetSource.classList.remove(styles.highlighted);
        }, 2000);
      }
    }
  }, []);

  // Handle source click - navigate to documentation with smooth scroll
  const handleSourceClick = useCallback(
    (source: SourceCitation) => {
      const url = source.url;

      // Check if URL has an anchor
      const hashIndex = url.indexOf('#');
      if (hashIndex !== -1) {
        const path = url.slice(0, hashIndex);
        const anchor = url.slice(hashIndex + 1);

        // If on the same page, just scroll to anchor
        if (
          path === window.location.pathname ||
          path === '' ||
          window.location.pathname.endsWith(path)
        ) {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Optionally close the panel on mobile
            if (window.innerWidth < 768) {
              closePanel();
            }
            return;
          }
        }
      }

      // Navigate to the source URL using Docusaurus router
      history.push(url);

      // If has anchor, scroll after navigation
      if (hashIndex !== -1) {
        const anchor = url.slice(hashIndex + 1);
        // Slight delay to allow page to render
        setTimeout(() => {
          const element = document.getElementById(anchor);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }

      // Optionally close the panel on mobile
      if (window.innerWidth < 768) {
        closePanel();
      }
    },
    [history, closePanel]
  );

  if (!isOpen) {
    return null;
  }

  const messages = session?.messages || [];
  const hasMessages = messages.length > 0;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={styles.backdrop}
        onClick={closePanel}
        aria-hidden="true"
      />
      {/* Chat panel */}
      <div
        ref={panelRef}
        className={`${styles.chatPanel} chat-panel`}
        role="dialog"
        aria-label="Chat panel"
        aria-modal="true"
        data-chat-exclude="true"
      >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Ask AI</h2>
        <div className={styles.headerActions}>
          {hasMessages && (
            <button
              type="button"
              className={styles.newChatButton}
              onClick={clearSession}
              aria-label="Start new conversation"
              title="New conversation"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className={styles.closeButton}
            onClick={closePanel}
            aria-label="Close chat"
          >
            <svg
              width="20"
              height="20"
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
        </div>
      </div>

      {/* Session expiration warning */}
      {isSessionExpiring && hasMessages && (
        <SessionExpirationWarning timeUntilExpiry={timeUntilExpiry} />
      )}

      {/* Messages area */}
      <div className={styles.messagesContainer} role="log" aria-live="polite">
        {!hasMessages && !isLoading && <EmptyState />}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCitationClick={handleCitationClick}
            onSourceClick={handleSourceClick}
          />
        ))}

        {isLoading && <LoadingIndicator />}

        {error && (
          <ErrorMessage
            message={error.message}
            type={error.type}
            onRetry={retryLastMessage}
            onDismiss={clearError}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isLoading}
        placeholder="Type your question..."
      />
    </div>
    </>
  );
}
