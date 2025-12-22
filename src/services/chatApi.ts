/**
 * Chat API client for communicating with the RAG AI Agent backend
 * Based on contracts/chat-api.md specification
 */

import type { ChatRequest, ChatResponse, SourceCitation } from '../types/chat';

// Environment configuration for API base URL
// In development: http://localhost:8000
// In production: Set via environment variable or configure here
const API_BASE_URL =
  typeof window !== 'undefined' && (window as unknown as { ENV_API_URL?: string }).ENV_API_URL
    ? (window as unknown as { ENV_API_URL: string }).ENV_API_URL
    : 'http://localhost:8000';

// Request timeout in milliseconds (60 seconds to accommodate AI generation + Qdrant Cloud latency)
const REQUEST_TIMEOUT_MS = 60000;

/**
 * Custom error types for better error handling
 */
export type ChatApiErrorType = 'network' | 'timeout' | 'no_content' | 'validation' | 'server' | 'generic';

export class ChatApiError extends Error {
  type: ChatApiErrorType;
  statusCode?: number;

  constructor(message: string, type: ChatApiErrorType, statusCode?: number) {
    super(message);
    this.name = 'ChatApiError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

/**
 * Helper to create a timeout promise
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ChatApiError('Request timed out', 'timeout'));
    }, ms);
  });
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  try {
    const response = await Promise.race([
      fetch(url, options),
      createTimeoutPromise(timeoutMs),
    ]);
    return response;
  } catch (error) {
    if (error instanceof ChatApiError) {
      throw error;
    }
    // Network error (offline, DNS failure, etc.)
    throw new ChatApiError(
      'Unable to connect to the server',
      'network'
    );
  }
}

/**
 * Send a chat message to the AI agent and receive a response
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    const message =
      typeof error.detail === 'string'
        ? error.detail
        : Array.isArray(error.detail)
          ? error.detail.map((e: { msg: string }) => e.msg).join(', ')
          : 'Failed to send message';

    // Determine error type based on status code and message
    let errorType: ChatApiErrorType = 'generic';
    if (response.status === 422) {
      errorType = 'validation';
    } else if (response.status >= 500) {
      errorType = 'server';
    } else if (message.toLowerCase().includes('no relevant') || message.toLowerCase().includes('not found')) {
      errorType = 'no_content';
    }

    throw new ChatApiError(message, errorType, response.status);
  }

  const data: ChatResponse = await response.json();

  // Check for "no relevant content" in the response
  if (
    data.sources.length === 0 &&
    (data.message.toLowerCase().includes("couldn't find") ||
      data.message.toLowerCase().includes("no relevant"))
  ) {
    // Not an error per se, but mark it for special handling
    (data as ChatResponse & { noContent?: boolean }).noContent = true;
  }

  return data;
}

/**
 * Clear a conversation session on the backend
 */
export async function clearSession(sessionId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  });

  // 404 is acceptable - session may already be cleared
  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to clear session');
  }
}

/**
 * Check if the backend API is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Transform backend source format to frontend SourceCitation format
 */
export function transformSources(
  backendSources: ChatResponse['sources']
): SourceCitation[] {
  return backendSources.map((source) => ({
    chunkId: source.chunk_id,
    documentTitle: source.title || 'Untitled',
    section: source.slug || '',
    url: `/${source.slug}` || '/',
    relevanceScore: source.score,
  }));
}

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
