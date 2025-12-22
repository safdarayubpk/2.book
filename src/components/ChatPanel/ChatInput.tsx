/**
 * ChatInput - Text input for chat messages
 * Task T014
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MAX_MESSAGE_LENGTH } from '../../types/chat';
import styles from './ChatInput.styles.module.css';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * ChatInput component
 * Textarea with 500 char limit, Enter to submit, Shift+Enter for newline
 */
export default function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Type your question...',
}: ChatInputProps): React.ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      // Enforce max length
      if (newValue.length <= MAX_MESSAGE_LENGTH) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter (without Shift)
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSubmit();
        }
      }
    },
    [value, disabled, onSubmit]
  );

  const handleSubmitClick = useCallback(() => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  }, [value, disabled, onSubmit]);

  const charCount = value.length;
  const isNearLimit = charCount >= MAX_MESSAGE_LENGTH - 50;
  const isAtLimit = charCount >= MAX_MESSAGE_LENGTH;

  return (
    <div className={`${styles.inputContainer} ${isFocused ? styles.focused : ''}`}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Chat message input"
        aria-describedby="char-counter"
      />
      <div className={styles.footer}>
        <span
          id="char-counter"
          className={`${styles.charCounter} ${isNearLimit ? styles.nearLimit : ''} ${isAtLimit ? styles.atLimit : ''}`}
        >
          {charCount}/{MAX_MESSAGE_LENGTH}
        </span>
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSubmitClick}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
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
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
