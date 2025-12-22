/**
 * useChatApi hook - API communication wrapper with health check
 * Based on contracts/chat-api.md and contracts/components.md specifications
 */

import { useState, useEffect, useCallback } from 'react';
import type { ChatRequest, ChatResponse, SourceCitation } from '../types/chat';
import {
  sendChatMessage as apiSendMessage,
  clearSession as apiClearSession,
  checkHealth,
  transformSources,
} from '../services/chatApi';

export interface UseChatApiReturn {
  sendMessage: (request: ChatRequest) => Promise<{
    response: string;
    sessionId: string;
    sources: SourceCitation[];
    tokensUsed: number;
    responseTimeMs: number;
  }>;
  clearSession: (sessionId: string) => Promise<void>;
  isHealthy: boolean;
  isCheckingHealth: boolean;
}

/**
 * Hook for API communication with health monitoring
 */
export function useChatApi(): UseChatApiReturn {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(true);

  // Check health on mount
  useEffect(() => {
    let mounted = true;

    const checkApiHealth = async () => {
      setIsCheckingHealth(true);
      try {
        const healthy = await checkHealth();
        if (mounted) {
          setIsHealthy(healthy);
        }
      } catch {
        if (mounted) {
          setIsHealthy(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingHealth(false);
        }
      }
    };

    checkApiHealth();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Send a chat message to the backend
   */
  const sendMessage = useCallback(
    async (request: ChatRequest): Promise<{
      response: string;
      sessionId: string;
      sources: SourceCitation[];
      tokensUsed: number;
      responseTimeMs: number;
    }> => {
      const response: ChatResponse = await apiSendMessage(request);

      return {
        response: response.message,
        sessionId: response.session_id,
        sources: transformSources(response.sources),
        tokensUsed: response.metadata?.tokens_used || 0,
        responseTimeMs: response.metadata?.response_time_ms || 0,
      };
    },
    []
  );

  /**
   * Clear a session on the backend
   */
  const clearSession = useCallback(async (sessionId: string): Promise<void> => {
    await apiClearSession(sessionId);
  }, []);

  return {
    sendMessage,
    clearSession,
    isHealthy,
    isCheckingHealth,
  };
}
