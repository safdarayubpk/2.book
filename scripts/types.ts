/**
 * TypeScript interfaces for the RAG content ingestion pipeline
 */

/**
 * Represents a single markdown file from the /docs directory
 */
export interface Document {
  /** Relative path from repo root (e.g., docs/chapter-1/index.md) */
  path: string;
  /** Document title from frontmatter or derived from filename */
  title: string;
  /** URL-friendly identifier (e.g., chapter-1-index) */
  slug: string;
  /** Sequential document number (1, 2, 3...) based on sorted order */
  docNumber: number;
  /** Original markdown content */
  rawContent: string;
  /** Text with markdown syntax removed */
  cleanContent: string;
}

/**
 * Represents a segment of clean text from a document, ready for embedding
 */
export interface Chunk {
  /** Stable unique identifier (format: doc-NNN-NNNN) */
  chunk_id: string;
  /** Clean, readable prose content */
  text: string;
  /** Path to source document */
  source_path: string;
  /** Document slug */
  slug: string;
  /** Document title */
  title: string;
  /** 1-based position within document */
  order_index: number;
}

/**
 * Represents the complete output of the ingestion pipeline
 */
export interface ChunkCollection {
  /** Array of all chunks from all documents */
  chunks: Chunk[];
  /** Optional pipeline metadata for debugging */
  metadata?: {
    /** ISO timestamp of generation */
    generated_at: string;
    /** Number of documents processed */
    total_documents: number;
    /** Number of chunks created */
    total_chunks: number;
    /** Pipeline version string */
    version: string;
  };
}
