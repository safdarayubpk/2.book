/**
 * ChatContext - Global chat state and actions provider
 * Based on contracts/components.md specification
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { ConversationSession, ChatMessage, SourceCitation } from '../types/chat';
import { useChatSession } from '../hooks/useChatSession';
import { useChatApi } from '../hooks/useChatApi';
import { ChatApiError, type ChatApiErrorType } from '../services/chatApi';

export type ErrorInfo = {
  message: string;
  type: ChatApiErrorType;
};

export interface ChatContextValue {
  // State
  isOpen: boolean;
  session: ConversationSession | null;
  isLoading: boolean;
  error: ErrorInfo | null;
  isHealthy: boolean;
  isSessionExpiring: boolean;
  timeUntilExpiry: number | null;
  lastMessage: string | null;

  // Actions
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  sendMessage: (message: string, context?: string) => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

interface ChatProviderProps {
  children: React.ReactNode;
}

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * ChatProvider component - provides chat state and actions to children
 */
export function ChatProvider({ children }: ChatProviderProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setErrorState] = useState<ErrorInfo | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [lastContext, setLastContext] = useState<string | undefined>(undefined);

  const {
    session,
    isLoading,
    isSessionExpiring,
    timeUntilExpiry,
    addMessage,
    updateSessionId,
    clearSession: clearSessionState,
    setLoading,
  } = useChatSession();

  const {
    sendMessage: apiSendMessage,
    clearSession: apiClearSession,
    isHealthy,
  } = useChatApi();

  /**
   * Open the chat panel
   */
  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the chat panel
   */
  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Toggle the chat panel
   */
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  /**
   * Send a message and handle the response
   */
  const sendMessage = useCallback(
    async (message: string, context?: string): Promise<void> => {
      // Validate message
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        setErrorState({ message: 'Please enter a message', type: 'validation' });
        return;
      }

      if (trimmedMessage.length > 500) {
        setErrorState({ message: 'Message must be 500 characters or less', type: 'validation' });
        return;
      }

      // Store for retry
      setLastMessage(trimmedMessage);
      setLastContext(context);

      // Clear any previous error
      setErrorState(null);
      setLoading(true);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: trimmedMessage,
        timestamp: Date.now(),
        highlightedContext: context,
      };
      addMessage(userMessage);

      try {
        // Send to API
        const response = await apiSendMessage({
          message: trimmedMessage,
          session_id: session?.sessionId,
          context,
        });

        // Update session ID if changed
        if (response.sessionId && response.sessionId !== session?.sessionId) {
          updateSessionId(response.sessionId);
        }

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: response.response,
          timestamp: Date.now(),
          sources: response.sources,
        };
        addMessage(assistantMessage);

        // Clear lastMessage on success
        setLastMessage(null);
        setLastContext(undefined);
      } catch (err) {
        let errorInfo: ErrorInfo;
        if (err instanceof ChatApiError) {
          errorInfo = { message: err.message, type: err.type };
        } else {
          errorInfo = {
            message: err instanceof Error ? err.message : 'Failed to send message',
            type: 'generic',
          };
        }
        setErrorState(errorInfo);
      } finally {
        setLoading(false);
      }
    },
    [session, addMessage, updateSessionId, setLoading, apiSendMessage]
  );

  /**
   * Retry the last failed message
   */
  const retryLastMessage = useCallback(async () => {
    if (lastMessage) {
      await sendMessage(lastMessage, lastContext);
    }
  }, [lastMessage, lastContext, sendMessage]);

  /**
   * Clear the current session
   */
  const clearSession = useCallback(async () => {
    // Clear backend session if we have one
    if (session?.sessionId) {
      try {
        await apiClearSession(session.sessionId);
      } catch {
        // Ignore errors - session may already be cleared
      }
    }

    // Clear local state
    clearSessionState();
  }, [session, apiClearSession, clearSessionState]);

  const value = useMemo<ChatContextValue>(
    () => ({
      isOpen,
      session,
      isLoading,
      error,
      isHealthy,
      isSessionExpiring,
      timeUntilExpiry,
      lastMessage,
      openPanel,
      closePanel,
      togglePanel,
      sendMessage,
      clearSession,
      clearError,
      retryLastMessage,
    }),
    [
      isOpen,
      session,
      isLoading,
      error,
      isHealthy,
      isSessionExpiring,
      timeUntilExpiry,
      lastMessage,
      openPanel,
      closePanel,
      togglePanel,
      sendMessage,
      clearSession,
      clearError,
      retryLastMessage,
    ]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Hook to access chat context
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
