/**
 * SourcesList - Display source citations for AI responses
 * Task T018
 */

import React, { useState, useCallback } from 'react';
import Link from '@docusaurus/Link';
import type { SourceCitation } from '../../types/chat';
import { getRelevanceLabel, getRelevanceClass, truncateText, extractSlug } from './utils';
import styles from './SourcesList.styles.module.css';

interface SourcesListProps {
  sources: SourceCitation[];
  onSourceClick?: (source: SourceCitation) => void;
}

/**
 * SourcesList component
 * Collapsible list with relevance indicators and clickable links
 */
export default function SourcesList({
  sources,
  onSourceClick,
}: SourcesListProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSourceClick = useCallback(
    (source: SourceCitation, e: React.MouseEvent) => {
      if (onSourceClick) {
        e.preventDefault();
        onSourceClick(source);
      }
    },
    [onSourceClick]
  );

  if (!sources || sources.length === 0) {
    return null;
  }

  // Sort sources by relevance score (highest first)
  const sortedSources = [...sources].sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  return (
    <div className={styles.sourcesContainer}>
      <button
        type="button"
        className={styles.sourcesHeader}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls="sources-list"
      >
        <span className={styles.sourcesTitle}>
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Sources ({sources.length})
        </span>
        <svg
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
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
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <ul id="sources-list" className={styles.sourcesList}>
          {sortedSources.map((source, index) => (
            <li key={source.chunkId} className={styles.sourceItem}>
              <Link
                to={source.url}
                className={styles.sourceLink}
                onClick={(e) => handleSourceClick(source, e)}
                data-source-index={index + 1}
              >
                <span className={styles.sourceIndex}>[{index + 1}]</span>
                <div className={styles.sourceContent}>
                  <span className={styles.sourceTitle}>
                    {truncateText(source.documentTitle, 50)}
                  </span>
                  <div className={styles.sourceMeta}>
                    <span className={styles.sourceSection}>
                      {truncateText(source.section, 30)}
                    </span>
                    {source.url && (
                      <span className={styles.sourceSlug}>
                        {extractSlug(source.url)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.relevanceInfo}>
                  <span
                    className={`${styles.relevanceBadge} ${styles[getRelevanceClass(source.relevanceScore)]}`}
                  >
                    {getRelevanceLabel(source.relevanceScore)}
                  </span>
                  <span className={styles.relevanceScore}>
                    {Math.round(source.relevanceScore * 100)}%
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
