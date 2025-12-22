/**
 * Chat types for the AI chat interface
 * Based on data-model.md specification
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface SourceCitation {
  /** Unique identifier for the chunk */
  chunkId: string;
  /** Display title of the source document */
  documentTitle: string;
  /** Section within the document */
  section: string;
  /** URL path to navigate to this section */
  url: string;
  /** Relevance score (0-1) */
  relevanceScore: number;
}

export interface ChatMessage {
  /** Unique identifier for this message */
  id: string;
  /** Who sent this message */
  role: MessageRole;
  /** Message content (may contain citation markers like [1]) */
  content: string;
  /** Timestamp when message was created */
  timestamp: number;
  /** Sources referenced in this message (assistant messages only) */
  sources?: SourceCitation[];
  /** Highlighted text context (user messages with highlight-to-ask only) */
  highlightedContext?: string;
}

export interface ConversationSession {
  /** Session ID (UUID from backend) */
  sessionId: string;
  /** All messages in this conversation */
  messages: ChatMessage[];
  /** When session was created */
  createdAt: number;
  /** Last activity timestamp (for timeout) */
  lastActivity: number;
}

export interface TextSelection {
  /** The selected text content */
  text: string;
  /** Bounding rectangle for positioning the Ask AI button */
  rect: DOMRect;
  /** Source page URL where selection was made */
  sourceUrl: string;
}

// API Request/Response Types

export interface ChatRequest {
  /** User's question or message */
  message: string;
  /** Optional session ID for multi-turn conversations */
  session_id?: string;
  /** Optional highlighted text context */
  context?: string;
}

export interface ChatResponse {
  /** AI-generated response text */
  message: string;
  /** Session ID (new or existing) */
  session_id: string;
  /** Source citations from backend */
  sources: Array<{
    chunk_id: string;
    title: string;
    slug: string;
    score: number;
  }>;
  /** Response metadata */
  metadata: {
    response_time_ms: number;
    tokens_used: number;
    context_chunks: number;
  };
}

export interface ErrorResponse {
  /** Error details */
  detail: string | Array<{ msg: string; type: string }>;
}

// State Types

export interface ChatPanelState {
  /** Whether the chat panel is open */
  isOpen: boolean;
  /** Current session (null if no active session) */
  session: ConversationSession | null;
  /** Whether an API request is in progress */
  isLoading: boolean;
  /** Current error message (null if no error) */
  error: string | null;
  /** Draft message being typed */
  inputValue: string;
}

export interface HighlightState {
  /** Current text selection (null if nothing selected) */
  selection: TextSelection | null;
  /** Whether the Ask AI button is visible */
  isButtonVisible: boolean;
  /** Optional follow-up question for highlight-to-ask */
  followUpQuestion: string;
}

// Type Guards

export function isUserMessage(msg: ChatMessage): boolean {
  return msg.role === 'user';
}

export function isAssistantMessage(msg: ChatMessage): boolean {
  return msg.role === 'assistant';
}

export function hasHighlightContext(
  msg: ChatMessage
): msg is ChatMessage & { highlightedContext: string } {
  return msg.role === 'user' && typeof msg.highlightedContext === 'string';
}

export function isSessionValid(session: ConversationSession): boolean {
  const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  return Date.now() - session.lastActivity < TIMEOUT_MS;
}

// Storage Schema

export interface StoredSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastActivity: number;
}

export const STORAGE_KEY = 'chat_session';
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const MAX_MESSAGES = 20; // 10 turns
export const MAX_MESSAGE_LENGTH = 500;
