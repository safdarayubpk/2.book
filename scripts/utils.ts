/**
 * Utility functions for the RAG content ingestion pipeline
 */

/**
 * Estimate the number of tokens in a text string.
 * Uses word count × 1.33 as an approximation suitable for embedding models.
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length * 1.33);
}

/**
 * Generate a URL-friendly slug from a file path.
 * Removes docs/ prefix and .md extension, replaces path separators with hyphens.
 *
 * @param filePath - The relative file path (e.g., docs/chapter-1/index.md)
 * @returns URL-friendly slug (e.g., chapter-1-index)
 */
export function generateSlug(filePath: string): string {
  return filePath
    .replace(/^docs\//, '')  // Remove docs/ prefix
    .replace(/\.md$/, '')    // Remove .md extension
    .replace(/\//g, '-')     // Replace path separators with hyphens
    .toLowerCase();
}

/**
 * Generate a stable chunk ID based on document number and chunk index.
 * Format: doc-NNN-NNNN (e.g., doc-001-0001)
 *
 * @param docNumber - The document number (1-based)
 * @param chunkIndex - The chunk index within the document (1-based)
 * @returns Stable chunk ID
 */
export function generateChunkId(docNumber: number, chunkIndex: number): string {
  const docPart = docNumber.toString().padStart(3, '0');
  const chunkPart = chunkIndex.toString().padStart(4, '0');
  return `doc-${docPart}-${chunkPart}`;
}
