/**
 * Chunking logic for the RAG content ingestion pipeline
 *
 * Implements paragraph-first chunking with sentence fallback
 * to create semantically coherent chunks of 400-600 tokens.
 */

import { estimateTokens } from './utils';

const MIN_TOKENS = 400;
const MAX_TOKENS = 600;

/**
 * Split text into paragraphs (separated by double newlines)
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Split text into sentences using common sentence boundaries
 */
export function splitIntoSentences(text: string): string[] {
  // Split on period, question mark, or exclamation mark followed by space or end
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

/**
 * Chunk a document into segments of approximately 400-600 tokens
 *
 * Algorithm:
 * 1. Split text into paragraphs
 * 2. Accumulate paragraphs until reaching 400 tokens
 * 3. Stop before exceeding 600 tokens
 * 4. If a paragraph would exceed the limit, split by sentences
 * 5. Handle edge cases (short documents, long paragraphs)
 */
export function chunkDocument(cleanContent: string): string[] {
  const paragraphs = splitIntoParagraphs(cleanContent);
  const chunks: string[] = [];

  let currentChunk: string[] = [];
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // Case 1: Adding this paragraph would exceed MAX_TOKENS
    if (currentTokens + paragraphTokens > MAX_TOKENS) {
      // If current chunk has enough content, finalize it
      if (currentTokens >= MIN_TOKENS) {
        chunks.push(currentChunk.join('\n\n'));
        currentChunk = [];
        currentTokens = 0;
      }

      // If paragraph itself exceeds MAX_TOKENS, split by sentences
      if (paragraphTokens > MAX_TOKENS) {
        const sentenceChunks = chunkBySentences(paragraph, currentChunk, currentTokens);

        // Add all complete chunks
        for (let i = 0; i < sentenceChunks.length - 1; i++) {
          chunks.push(sentenceChunks[i]);
        }

        // Keep the last one as the current working chunk
        const lastChunk = sentenceChunks[sentenceChunks.length - 1];
        if (lastChunk) {
          currentChunk = [lastChunk];
          currentTokens = estimateTokens(lastChunk);
        } else {
          currentChunk = [];
          currentTokens = 0;
        }
      } else {
        // Paragraph fits, add to new chunk
        currentChunk.push(paragraph);
        currentTokens = paragraphTokens;
      }
    }
    // Case 2: Adding this paragraph keeps us under MAX_TOKENS
    else {
      currentChunk.push(paragraph);
      currentTokens += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  return chunks;
}

/**
 * Chunk by sentences when a paragraph is too long
 */
function chunkBySentences(
  paragraph: string,
  existingChunk: string[],
  existingTokens: number
): string[] {
  const sentences = splitIntoSentences(paragraph);
  const chunks: string[] = [];

  let currentChunk = existingChunk.length > 0 ? existingChunk.join('\n\n') : '';
  let currentTokens = existingTokens;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    // If adding this sentence would exceed MAX_TOKENS
    if (currentTokens + sentenceTokens > MAX_TOKENS && currentTokens >= MIN_TOKENS) {
      chunks.push(currentChunk);
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      // Add sentence to current chunk
      if (currentChunk.length > 0) {
        currentChunk += ' ' + sentence;
      } else {
        currentChunk = sentence;
      }
      currentTokens += sentenceTokens;
    }
  }

  // Add remaining content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}
