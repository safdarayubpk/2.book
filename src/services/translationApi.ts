/**
 * Translation API client for Urdu translation
 * Based on contracts/translate-api.yaml specification
 * Feature: 013-urdu-translation
 */

import type {
  TranslateRequest,
  TranslateResponse,
  TranslateError,
} from '../types/translation';

// API base URL - same as chat/personalization API
const API_BASE_URL =
  typeof window !== 'undefined' && (window as unknown as { ENV_API_URL?: string }).ENV_API_URL
    ? (window as unknown as { ENV_API_URL: string }).ENV_API_URL
    : 'https://safdarayub-book-rag-api.hf.space';

// Timeout for translation requests (60 seconds to handle cold starts and long content)
const TRANSLATE_TIMEOUT_MS = 60000;

/**
 * Custom error types for translation
 */
export type TranslateApiErrorType =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'server'
  | 'generic';

export class TranslateApiError extends Error {
  type: TranslateApiErrorType;
  statusCode?: number;

  constructor(message: string, type: TranslateApiErrorType, statusCode?: number) {
    super(message);
    this.name = 'TranslateApiError';
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
      reject(new TranslateApiError('Translation timed out. Please try again.', 'timeout'));
    }, ms);
  });
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = TRANSLATE_TIMEOUT_MS
): Promise<Response> {
  try {
    const response = await Promise.race([
      fetch(url, options),
      createTimeoutPromise(timeoutMs),
    ]);
    return response;
  } catch (error) {
    if (error instanceof TranslateApiError) {
      throw error;
    }
    throw new TranslateApiError(
      'Unable to connect to the server',
      'network'
    );
  }
}

/**
 * Translate chapter content to Urdu
 */
export async function translateContent(
  request: TranslateRequest
): Promise<TranslateResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: TranslateError = await response.json().catch(() => ({
      error: 'translation_failed',
      message: 'Unknown error occurred',
    }));

    // Map status codes to error types
    let errorType: TranslateApiErrorType = 'generic';
    switch (response.status) {
      case 400:
        errorType = 'validation';
        break;
      case 401:
        errorType = 'unauthorized';
        break;
      case 404:
        errorType = 'not_found';
        break;
      case 504:
        errorType = 'timeout';
        break;
      default:
        if (response.status >= 500) {
          errorType = 'server';
        }
    }

    throw new TranslateApiError(error.message, errorType, response.status);
  }

  const data: TranslateResponse = await response.json();
  return data;
}

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
