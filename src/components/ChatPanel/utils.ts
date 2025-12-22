/**
 * Chat panel utilities - Citation parsing
 * Task T020
 */

import type { SourceCitation } from '../../types/chat';

export interface ParsedCitation {
  type: 'text' | 'citation';
  content: string;
  citationIndex?: number;
}

/**
 * Parse message content to extract citation markers [1], [2], etc.
 * Returns an array of text and citation parts for rendering
 */
export function parseCitations(content: string): ParsedCitation[] {
  const parts: ParsedCitation[] = [];
  const citationRegex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = citationRegex.exec(content)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add the citation
    parts.push({
      type: 'citation',
      content: match[0],
      citationIndex: parseInt(match[1], 10),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last citation
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  // If no citations found, return the whole content as text
  if (parts.length === 0) {
    parts.push({
      type: 'text',
      content,
    });
  }

  return parts;
}

/**
 * Get relevance label based on score
 */
export function getRelevanceLabel(score: number): string {
  if (score >= 0.9) return 'High relevance';
  if (score >= 0.7) return 'Medium relevance';
  return 'Related';
}

/**
 * Get relevance color class based on score
 */
export function getRelevanceClass(score: number): string {
  if (score >= 0.9) return 'high';
  if (score >= 0.7) return 'medium';
  return 'low';
}

/**
 * Format timestamp as relative time or absolute time
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }

  // For older messages, show time
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Extract slug from a URL for display
 * e.g., "/docs/chapter-1/introduction#section" -> "#section"
 */
export function extractSlug(url: string): string {
  if (!url) return '';

  // Extract hash/anchor if present
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    return url.slice(hashIndex);
  }

  // Extract last path segment
  const segments = url.split('/').filter(Boolean);
  if (segments.length > 0) {
    return '/' + segments[segments.length - 1];
  }

  return '';
}
