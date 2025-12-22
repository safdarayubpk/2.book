/**
 * useChatSession hook - Manages chat session state with sessionStorage persistence
 * Based on data-model.md and contracts/components.md specifications
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  ConversationSession,
  ChatMessage,
  StoredSession,
} from '../types/chat';
import {
  STORAGE_KEY,
  SESSION_TIMEOUT_MS,
  MAX_MESSAGES,
  isSessionValid,
} from '../types/chat';

// Warn when 5 minutes left before session timeout
const SESSION_WARNING_MS = 5 * 60 * 1000;

export interface UseChatSessionReturn {
  session: ConversationSession | null;
  isLoading: boolean;
  error: string | null;
  isSessionExpiring: boolean;
  timeUntilExpiry: number | null;
  addMessage: (message: ChatMessage) => void;
  updateSessionId: (sessionId: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load session from sessionStorage
 */
function loadSession(): ConversationSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: StoredSession = JSON.parse(stored);

    // Check if session is expired
    if (!isSessionValid(session as ConversationSession)) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session as ConversationSession;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save session to sessionStorage
 */
function saveSession(session: ConversationSession): void {
  if (typeof window === 'undefined') return;

  try {
    const stored: StoredSession = {
      sessionId: session.sessionId,
      messages: session.messages,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Failed to save session to sessionStorage:', error);
  }
}

/**
 * Create a new session
 */
function createNewSession(sessionId?: string): ConversationSession {
  const now = Date.now();
  return {
    sessionId: sessionId || `session_${now}_${Math.random().toString(36).substring(2, 9)}`,
    messages: [],
    createdAt: now,
    lastActivity: now,
  };
}

/**
 * Hook for managing chat session state with persistence
 */
export function useChatSession(): UseChatSessionReturn {
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionExpiring, setIsSessionExpiring] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);

  // Load session from storage on mount
  useEffect(() => {
    const loaded = loadSession();
    if (loaded) {
      setSession(loaded);
    }
  }, []);

  // Save session to storage whenever it changes
  useEffect(() => {
    if (session) {
      saveSession(session);
    }
  }, [session]);

  // Check session expiration status periodically
  useEffect(() => {
    if (!session) {
      setIsSessionExpiring(false);
      setTimeUntilExpiry(null);
      return;
    }

    const checkExpiration = () => {
      const now = Date.now();
      const expiryTime = session.lastActivity + SESSION_TIMEOUT_MS;
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        // Session has expired
        setIsSessionExpiring(false);
        setTimeUntilExpiry(0);
        // Clear the expired session
        setSession(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(STORAGE_KEY);
        }
      } else if (remaining <= SESSION_WARNING_MS) {
        // Session is about to expire
        setIsSessionExpiring(true);
        setTimeUntilExpiry(remaining);
      } else {
        setIsSessionExpiring(false);
        setTimeUntilExpiry(remaining);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 30 seconds
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [session]);

  /**
   * Add a message to the session
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setSession((prev) => {
      // Ensure message has an ID
      const messageWithId: ChatMessage = {
        ...message,
        id: message.id || generateMessageId(),
        timestamp: message.timestamp || Date.now(),
      };

      if (!prev) {
        // Create new session if none exists
        const newSession = createNewSession();
        return {
          ...newSession,
          messages: [messageWithId],
          lastActivity: Date.now(),
        };
      }

      // Add message to existing session, respecting max limit
      let messages = [...prev.messages, messageWithId];
      if (messages.length > MAX_MESSAGES) {
        // Remove oldest messages to stay within limit
        messages = messages.slice(messages.length - MAX_MESSAGES);
      }

      return {
        ...prev,
        messages,
        lastActivity: Date.now(),
      };
    });
  }, []);

  /**
   * Update the session ID (when backend returns a new session ID)
   */
  const updateSessionId = useCallback((sessionId: string) => {
    setSession((prev) => {
      if (!prev) {
        return createNewSession(sessionId);
      }
      return {
        ...prev,
        sessionId,
        lastActivity: Date.now(),
      };
    });
  }, []);

  /**
   * Clear the current session
   */
  const clearSession = useCallback(() => {
    setSession(null);
    setError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * Set loading state
   */
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  /**
   * Set error state
   */
  const setErrorState = useCallback((err: string | null) => {
    setError(err);
  }, []);

  return {
    session,
    isLoading,
    error,
    isSessionExpiring,
    timeUntilExpiry,
    addMessage,
    updateSessionId,
    clearSession,
    setLoading: setLoadingState,
    setError: setErrorState,
  };
}
