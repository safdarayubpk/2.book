/**
 * ChatMessage - Individual message display component
 * Task T016
 */

import React, { useCallback } from 'react';
import type { ChatMessage as ChatMessageType, SourceCitation } from '../../types/chat';
import { isUserMessage, isAssistantMessage, hasHighlightContext } from '../../types/chat';
import { parseCitations, formatTimestamp, truncateText } from './utils';
import SourcesList from './SourcesList';
import styles from './ChatMessage.styles.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
  onCitationClick?: (citationIndex: number) => void;
  onSourceClick?: (source: SourceCitation) => void;
}

/**
 * ChatMessage component
 * Renders user/assistant messages with styling, timestamps, and citation parsing
 */
export default function ChatMessage({
  message,
  onCitationClick,
  onSourceClick,
}: ChatMessageProps): React.ReactElement {
  const isUser = isUserMessage(message);
  const isAssistant = isAssistantMessage(message);
  const hasContext = hasHighlightContext(message);

  const handleCitationClick = useCallback(
    (citationIndex: number) => {
      if (onCitationClick) {
        onCitationClick(citationIndex);
      }
    },
    [onCitationClick]
  );

  // Parse content for citations if assistant message
  const parsedContent = isAssistant
    ? parseCitations(message.content)
    : [{ type: 'text' as const, content: message.content }];

  return (
    <div
      className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}
      role="listitem"
    >
      {/* Highlighted context for user messages */}
      {hasContext && (
        <div className={styles.highlightContext}>
          <span className={styles.contextLabel}>Context:</span>
          <span className={styles.contextText}>
            "{truncateText(message.highlightedContext, 150)}"
          </span>
        </div>
      )}

      {/* Message bubble */}
      <div className={styles.messageBubble}>
        {/* Message content with citations */}
        <div className={styles.messageContent}>
          {parsedContent.map((part, index) => {
            if (part.type === 'citation' && part.citationIndex !== undefined) {
              return (
                <button
                  key={index}
                  type="button"
                  className={styles.citationLink}
                  onClick={() => handleCitationClick(part.citationIndex!)}
                  title={`View source ${part.citationIndex}`}
                  data-citation-index={part.citationIndex}
                  aria-label={`Citation ${part.citationIndex}, click to view source`}
                >
                  {part.content}
                </button>
              );
            }
            return <span key={index}>{part.content}</span>;
          })}
        </div>

        {/* Timestamp */}
        <span className={styles.timestamp}>{formatTimestamp(message.timestamp)}</span>
      </div>

      {/* Sources list for assistant messages */}
      {isAssistant && message.sources && message.sources.length > 0 && (
        <SourcesList sources={message.sources} onSourceClick={onSourceClick} />
      )}
    </div>
  );
}
