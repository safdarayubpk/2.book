/**
 * useTextSelection hook - Text selection detection with debouncing
 * Based on research.md and contracts/components.md specifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TextSelection } from '../types/chat';

export interface UseTextSelectionReturn {
  selection: TextSelection | null;
  clearSelection: () => void;
}

const DEBOUNCE_MS = 300;
const MIN_SELECTION_LENGTH = 3;

/**
 * Check if an element is within the documentation content area
 * Excludes chat panel and other non-content areas
 */
function isInDocContent(element: Node | null): boolean {
  if (!element) return false;

  let current: Node | null = element;
  while (current) {
    if (current instanceof Element) {
      // Exclude chat panel and other UI elements
      if (
        current.classList.contains('chat-panel') ||
        current.classList.contains('chat-toggle') ||
        current.classList.contains('highlight-ask') ||
        current.closest('[data-chat-exclude]')
      ) {
        return false;
      }

      // Include if in main content area
      if (
        current.classList.contains('markdown') ||
        current.classList.contains('theme-doc-markdown') ||
        current.tagName === 'ARTICLE' ||
        current.closest('article') ||
        current.closest('.docMainContainer') ||
        current.closest('[class*="docItemContainer"]')
      ) {
        return true;
      }
    }
    current = current.parentNode;
  }

  // Default to true if we can't determine (safer for basic pages)
  return true;
}

/**
 * Get current text selection with metadata
 */
function getTextSelection(): TextSelection | null {
  if (typeof window === 'undefined') return null;

  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;

  const text = selection.toString().trim();
  if (text.length < MIN_SELECTION_LENGTH) return null;

  try {
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Check if selection is in doc content
    if (!isInDocContent(container)) return null;

    const rect = range.getBoundingClientRect();

    return {
      text,
      rect,
      sourceUrl: window.location.pathname,
    };
  } catch {
    return null;
  }
}

/**
 * Hook for detecting and managing text selection
 */
export function useTextSelection(): UseTextSelectionReturn {
  const [selection, setSelection] = useState<TextSelection | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSelectionRef = useRef<string>('');

  /**
   * Clear the current selection
   */
  const clearSelection = useCallback(() => {
    setSelection(null);
    lastSelectionRef.current = '';
  }, []);

  /**
   * Handle selection change with debouncing
   */
  const handleSelectionChange = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the selection update
    debounceTimerRef.current = setTimeout(() => {
      const newSelection = getTextSelection();

      // Only update if selection text changed
      const newText = newSelection?.text || '';
      if (newText !== lastSelectionRef.current) {
        lastSelectionRef.current = newText;
        setSelection(newSelection);
      }
    }, DEBOUNCE_MS);
  }, []);

  /**
   * Handle mouse/touch down - prepare for potential selection clear
   */
  const handlePointerDown = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // If clicking on the highlight button, don't interfere with selection
      const target = event.target as Element;
      if (
        target.closest('[data-highlight-ask]') ||
        target.closest('.highlight-ask')
      ) {
        // Don't clear the debounce timer - keep the selection active
        return;
      }

      // Clear debounce timer if clicking elsewhere (will be re-evaluated on mouseup)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    []
  );

  /**
   * Handle mouse up - check for new selection
   */
  const handleMouseUp = useCallback(() => {
    handleSelectionChange();
  }, [handleSelectionChange]);

  // Set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for selection changes (covers both mouse and touch)
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchend', handleMouseUp);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('touchstart', handlePointerDown);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleSelectionChange, handleMouseUp, handlePointerDown]);

  return {
    selection,
    clearSelection,
  };
}
