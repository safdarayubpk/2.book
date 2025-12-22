/**
 * HighlightButton - "Ask AI" button that appears near text selection
 * Tasks T024, T028
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './styles.module.css';

interface HighlightButtonProps {
  selectedText: string;
  onAsk: (question?: string) => void;
  onClose: () => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

/**
 * Truncate text for preview display
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * HighlightButton component
 * Shows "Ask AI" button, expands to show input for optional follow-up question
 */
export default function HighlightButton({
  selectedText,
  onAsk,
  onClose,
  onExpandChange,
}: HighlightButtonProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when expanded and notify parent
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const handleButtonClick = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const handleSubmit = useCallback(() => {
    onAsk(question.trim() || undefined);
    setQuestion('');
    setIsExpanded(false);
  }, [question, onAsk]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
          setQuestion('');
        } else {
          onClose();
        }
      }
    },
    [isExpanded, handleSubmit, onClose]
  );

  const handleClose = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      setQuestion('');
    } else {
      onClose();
    }
  }, [isExpanded, onClose]);

  // Simple collapsed button
  if (!isExpanded) {
    return (
      <button
        type="button"
        className={styles.askButton}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-label="Ask AI about selected text"
      >
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Ask AI
      </button>
    );
  }

  // Expanded with input
  return (
    <div
      className={`${styles.askButton} ${styles.askButtonExpanded}`}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Ask AI about selected text"
    >
      {/* Header */}
      <div className={styles.expandedHeader}>
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className={styles.expandedLabel}>Ask about selection</span>
        <button
          type="button"
          className={styles.closeExpandedButton}
          onClick={handleClose}
          aria-label="Close"
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
      </div>

      {/* Selected text preview */}
      <div className={styles.selectedTextPreview}>
        "{truncateText(selectedText, 120)}"
      </div>

      {/* Input and submit */}
      <div className={styles.questionInputContainer}>
        <input
          ref={inputRef}
          type="text"
          className={styles.questionInput}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Add a question (optional)..."
          maxLength={200}
          aria-label="Optional follow-up question"
        />
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleSubmit}
          aria-label="Submit question"
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
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
