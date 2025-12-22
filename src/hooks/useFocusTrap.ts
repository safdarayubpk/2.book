/**
 * useFocusTrap - Trap focus within a container element
 * Task T053
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export interface UseFocusTrapOptions {
  enabled?: boolean;
  returnFocusOnDeactivate?: boolean;
}

/**
 * Hook to trap focus within a container
 */
export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = {}
): React.RefObject<T> {
  const { enabled = true, returnFocusOnDeactivate = true } = options;
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
  }, []);

  // Store previous focus and focus first element when enabled
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Slight delay to ensure element is visible
      requestAnimationFrame(() => {
        focusableElements[0]?.focus();
      });
    }

    // Return focus when deactivated
    return () => {
      if (returnFocusOnDeactivate && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [enabled, returnFocusOnDeactivate, getFocusableElements]);

  // Handle Tab key cycling
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: cycle backwards
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: cycle forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, getFocusableElements]);

  return containerRef;
}
