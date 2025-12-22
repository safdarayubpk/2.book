/**
 * HighlightAsk - Container component for text selection and Ask AI workflow
 * Tasks T026, T027, T029, T032
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useTextSelection } from '../../hooks/useTextSelection';
import HighlightButton from './HighlightButton';
import styles from './styles.module.css';

interface Position {
  top: number;
  left: number;
}

/**
 * Calculate button position based on selection rect
 * Desktop: below selection, Mobile: above selection
 * Clamps to viewport boundaries
 * Uses viewport-relative coordinates for fixed positioning
 */
function calculateButtonPosition(
  rect: DOMRect,
  buttonWidth: number = 100,
  buttonHeight: number = 44
): Position {
  const isMobile = window.innerWidth < 768;
  const padding = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top: number;
  let left: number;

  // rect is already viewport-relative (from getBoundingClientRect)
  // For fixed positioning, we use these values directly

  if (isMobile) {
    // Mobile: position above the selection
    top = rect.top - buttonHeight - padding;
    // If too close to top of viewport, put below instead
    if (top < padding) {
      top = rect.bottom + padding;
    }
  } else {
    // Desktop: position below the selection
    top = rect.bottom + padding;
    // If too close to bottom of viewport, put above instead
    if (top + buttonHeight > viewportHeight - padding) {
      top = rect.top - buttonHeight - padding;
    }
  }

  // Center horizontally on selection
  left = rect.left + rect.width / 2 - buttonWidth / 2;

  // Clamp left edge to viewport
  if (left < padding) {
    left = padding;
  }

  // Clamp right edge to viewport
  if (left + buttonWidth > viewportWidth - padding) {
    left = viewportWidth - buttonWidth - padding;
  }

  // Final clamp: ensure top stays within viewport
  if (top < padding) {
    top = padding;
  }
  if (top + buttonHeight > viewportHeight - padding) {
    top = viewportHeight - buttonHeight - padding;
  }

  return { top, left };
}

/**
 * Check if selection is within documentation content (not in chat panel, etc.)
 */
function isValidSelectionLocation(selection: Selection): boolean {
  const anchorNode = selection.anchorNode;
  if (!anchorNode) return false;

  // Get the element containing the selection
  const element =
    anchorNode.nodeType === Node.TEXT_NODE
      ? anchorNode.parentElement
      : (anchorNode as Element);

  if (!element) return false;

  // Check if selection is inside excluded areas
  const excludedSelectors = [
    '.chat-panel',
    '[data-chat-exclude]',
    '.highlight-ask',
    '.navbar',
    '.menu__list',
    'input',
    'textarea',
    'button',
    '[role="navigation"]',
  ];

  for (const selector of excludedSelectors) {
    if (element.closest(selector)) {
      return false;
    }
  }

  // Allow selection in content areas - be more lenient
  // Check for common Docusaurus content containers
  const contentSelectors = [
    'article',
    'main',
    '.markdown',
    '.docMainContainer',
    '[class*="docItemContainer"]',
    '.theme-doc-markdown',
    '.col--9', // Common Docusaurus layout column
    '.container',
  ];

  for (const selector of contentSelectors) {
    if (element.closest(selector)) {
      return true;
    }
  }

  // If we can't find a known container, check if it's just body content
  // This allows selection on simpler pages
  return element.closest('body') !== null && !element.closest('header') && !element.closest('footer');
}

/**
 * HighlightAsk component
 * Listens for text selection and shows Ask AI button
 */
export default function HighlightAsk(): React.ReactElement | null {
  const { openPanel, sendMessage } = useChatContext();
  const { selection, clearSelection } = useTextSelection();
  const [position, setPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Store the selection text when button becomes visible - prevents loss on click
  const savedSelectionRef = useRef<string | null>(null);
  const isInteractingRef = useRef(false);
  // Store original selection rect for repositioning
  const selectionRectRef = useRef<DOMRect | null>(null);

  // Update position when selection changes
  useEffect(() => {
    // Don't update visibility while user is interacting with the button
    if (isInteractingRef.current) {
      return;
    }

    if (selection && selection.text.trim().length >= 3) {
      // Check if selection is in valid location
      const windowSelection = window.getSelection();
      if (windowSelection && isValidSelectionLocation(windowSelection)) {
        // Save the rect for later repositioning
        selectionRectRef.current = selection.rect;
        const newPosition = calculateButtonPosition(selection.rect);
        setPosition(newPosition);
        setIsVisible(true);
        setIsExpanded(false); // Reset expanded state for new selection
        // Save the selection text for later use
        savedSelectionRef.current = selection.text;
      } else {
        setIsVisible(false);
        savedSelectionRef.current = null;
        selectionRectRef.current = null;
      }
    } else {
      // Only hide if we're not interacting and no saved selection
      if (!isInteractingRef.current) {
        setIsVisible(false);
        savedSelectionRef.current = null;
        selectionRectRef.current = null;
      }
    }
  }, [selection]);

  // Handle click outside to close - use mouseup to avoid interfering with button clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click target is inside our container
      const target = e.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) {
        // Click is inside our button - don't close
        return;
      }

      // Check if click is on the highlight-ask container or its children
      const targetElement = e.target as Element;
      if (targetElement.closest && targetElement.closest('.highlightAskContainer')) {
        return;
      }

      // Click is outside - reset all state properly
      isInteractingRef.current = false;
      savedSelectionRef.current = null;
      selectionRectRef.current = null;
      setIsVisible(false);
      setIsExpanded(false);
      clearSelection();
    };

    if (isVisible) {
      // Use mouseup and add a small delay to let the click complete
      const timeoutId = setTimeout(() => {
        document.addEventListener('mouseup', handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mouseup', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [isVisible, clearSelection]);

  // Handle scroll to reposition or hide
  useEffect(() => {
    const handleScroll = () => {
      if (selection && isVisible) {
        // Recalculate position or hide if selection is no longer valid
        const windowSelection = window.getSelection();
        if (windowSelection && windowSelection.toString().trim()) {
          const range = windowSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const newPosition = calculateButtonPosition(rect);
          setPosition(newPosition);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [selection, isVisible]);

  // Handle ask action
  const handleAsk = useCallback(
    (question?: string) => {
      // Use saved selection if current selection is lost
      const selectedText = selection?.text?.trim() || savedSelectionRef.current?.trim();
      if (!selectedText) return;

      // Build the message with context
      let message: string;

      if (question) {
        // User provided a follow-up question
        message = question;
      } else {
        // Default question about the selection
        message = `Can you explain this: "${selectedText}"`;
      }

      // Open panel and send message with highlighted context
      openPanel();
      sendMessage(message, selectedText);

      // Clear selection state
      isInteractingRef.current = false;
      savedSelectionRef.current = null;
      setIsVisible(false);
      clearSelection();

      // Clear browser selection
      window.getSelection()?.removeAllRanges();
    },
    [selection, openPanel, sendMessage, clearSelection]
  );

  // Handle close - must reset all state properly
  const handleClose = useCallback(() => {
    // Reset interaction state first
    isInteractingRef.current = false;
    savedSelectionRef.current = null;
    selectionRectRef.current = null;
    // Then clear visibility and selection
    setIsVisible(false);
    setIsExpanded(false);
    clearSelection();
    // Clear browser selection after a small delay to allow state to settle
    setTimeout(() => {
      window.getSelection()?.removeAllRanges();
    }, 10);
  }, [clearSelection]);

  // Handle expand change from HighlightButton - reposition for expanded size
  const handleExpandChange = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
    if (expanded && selectionRectRef.current) {
      // Recalculate position for expanded state (larger button)
      const expandedHeight = 180; // Approximate expanded height
      const expandedWidth = 300; // Approximate expanded width
      const newPosition = calculateButtonPosition(
        selectionRectRef.current,
        expandedWidth,
        expandedHeight
      );
      setPosition(newPosition);
    } else if (!expanded && selectionRectRef.current) {
      // Reset to small button position
      const newPosition = calculateButtonPosition(selectionRectRef.current);
      setPosition(newPosition);
    }
  }, []);

  // Get the text to display - use saved if current is lost
  const displayText = selection?.text || savedSelectionRef.current || '';

  // Don't render if not visible or no text to show
  if (!isVisible || !displayText || !position) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={styles.highlightAskContainer}
      data-highlight-ask="true"
      style={{
        top: position.top,
        left: position.left,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        isInteractingRef.current = true;
      }}
      onMouseEnter={() => {
        isInteractingRef.current = true;
      }}
    >
      <HighlightButton
        selectedText={displayText}
        onAsk={handleAsk}
        onClose={handleClose}
        onExpandChange={handleExpandChange}
      />
    </div>
  );
}
