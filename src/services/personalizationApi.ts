/**
 * Personalization API client for content personalization
 * Based on contracts/personalize-api.yaml specification
 */

import type {
  PersonalizeRequest,
  PersonalizeResponse,
  PersonalizeError,
} from '../types/personalization';

// API base URL - same as chat API
const API_BASE_URL =
  typeof window !== 'undefined' && (window as unknown as { ENV_API_URL?: string }).ENV_API_URL
    ? (window as unknown as { ENV_API_URL: string }).ENV_API_URL
    : 'https://safdarayub-book-rag-api.hf.space';

// Timeout for personalization requests (30 seconds as per spec)
const PERSONALIZE_TIMEOUT_MS = 30000;

/**
 * Custom error types for personalization
 */
export type PersonalizeApiErrorType =
  | 'network'
  | 'timeout'
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'server'
  | 'generic';

export class PersonalizeApiError extends Error {
  type: PersonalizeApiErrorType;
  statusCode?: number;

  constructor(message: string, type: PersonalizeApiErrorType, statusCode?: number) {
    super(message);
    this.name = 'PersonalizeApiError';
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
      reject(new PersonalizeApiError('Personalization timed out. Please try again.', 'timeout'));
    }, ms);
  });
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = PERSONALIZE_TIMEOUT_MS
): Promise<Response> {
  try {
    const response = await Promise.race([
      fetch(url, options),
      createTimeoutPromise(timeoutMs),
    ]);
    return response;
  } catch (error) {
    if (error instanceof PersonalizeApiError) {
      throw error;
    }
    throw new PersonalizeApiError(
      'Unable to connect to the server',
      'network'
    );
  }
}

/**
 * Personalize chapter content based on user profile
 */
export async function personalizeContent(
  request: PersonalizeRequest
): Promise<PersonalizeResponse> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/personalize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: PersonalizeError = await response.json().catch(() => ({
      error: 'unknown',
      message: 'Unknown error occurred',
    }));

    // Map status codes to error types
    let errorType: PersonalizeApiErrorType = 'generic';
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

    throw new PersonalizeApiError(error.message, errorType, response.status);
  }

  const data: PersonalizeResponse = await response.json();
  return data;
}

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
