#!/usr/bin/env npx ts-node

/**
 * Book Content Ingestion Script for RAG Pipeline
 *
 * Reads all Docusaurus markdown files, strips markdown syntax,
 * chunks content, and outputs structured JSON for embedding.
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import stripMarkdown from 'strip-markdown';
import remarkStringify from 'remark-stringify';
import { Document, Chunk, ChunkCollection } from './types';
import { estimateTokens, generateSlug, generateChunkId } from './utils';
import { chunkDocument } from './chunker';

const DOCS_DIR = path.join(process.cwd(), 'docs');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'chunks.json');

/**
 * Recursively discover all markdown files in a directory
 */
function discoverMarkdownFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      discoverMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Store relative path from repo root
      const relativePath = path.relative(process.cwd(), fullPath);
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Extract title from frontmatter or derive from filename
 */
function extractTitle(frontmatter: Record<string, unknown>, filePath: string): string {
  // Try frontmatter title first
  if (frontmatter.title && typeof frontmatter.title === 'string') {
    return frontmatter.title;
  }

  // Fall back to filename-based title
  const filename = path.basename(filePath, '.md');
  if (filename === 'index') {
    // Use parent directory name for index files
    const parentDir = path.basename(path.dirname(filePath));
    return parentDir
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Load and parse a markdown document
 */
function loadDocument(filePath: string, docNumber: number): Document {
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = fs.readFileSync(fullPath, 'utf-8');

  // Parse frontmatter
  const { data: frontmatter, content: rawContent } = matter(fileContent);

  // Extract title
  const title = extractTitle(frontmatter, filePath);

  // Generate slug
  const slug = generateSlug(filePath);

  return {
    path: filePath,
    title,
    slug,
    docNumber,
    rawContent,
    cleanContent: '', // Will be filled in by stripMarkdown
  };
}

/**
 * Strip markdown syntax from content using remark
 */
async function stripMarkdownContent(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(stripMarkdown, {
      remove: ['heading', 'blockquote', 'list', 'listItem', 'code', 'html', 'thematicBreak']
    })
    .use(remarkStringify)
    .process(content);

  return String(result);
}

/**
 * Normalize whitespace in text
 */
function normalizeWhitespace(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n')  // Collapse multiple newlines
    .replace(/[ \t]+/g, ' ')      // Collapse multiple spaces
    .trim();
}

/**
 * Build chunk with full metadata
 */
function buildChunkMetadata(
  text: string,
  doc: Document,
  chunkIndex: number
): Chunk {
  return {
    chunk_id: generateChunkId(doc.docNumber, chunkIndex),
    text,
    source_path: doc.path,
    slug: doc.slug,
    title: doc.title,
    order_index: chunkIndex,
  };
}

/**
 * Build the complete chunk collection
 */
function buildChunkCollection(chunks: Chunk[], totalDocs: number): ChunkCollection {
  return {
    chunks,
    metadata: {
      generated_at: new Date().toISOString(),
      total_documents: totalDocs,
      total_chunks: chunks.length,
      version: '1.0.0',
    },
  };
}

/**
 * Write output to JSON file
 */
function writeOutput(collection: ChunkCollection): void {
  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(collection, null, 2), 'utf-8');
}

/**
 * Main pipeline function
 */
async function main(): Promise<void> {
  console.log('Starting content ingestion...\n');

  // Step 1: Discover markdown files
  console.log('Discovering markdown files in /docs...');
  const files = discoverMarkdownFiles(DOCS_DIR);

  // Sort alphabetically for deterministic ordering
  files.sort((a, b) => a.localeCompare(b));

  console.log(`Found ${files.length} markdown files:\n`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  console.log();

  // Step 2: Load and process each document
  const allChunks: Chunk[] = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const docNumber = i + 1;

    console.log(`Processing [${docNumber}/${files.length}]: ${filePath}`);

    // Load document
    const doc = loadDocument(filePath, docNumber);
    console.log(`  Title: "${doc.title}"`);

    // Strip markdown
    const cleanedContent = await stripMarkdownContent(doc.rawContent);
    doc.cleanContent = normalizeWhitespace(cleanedContent);

    // Skip if no content after cleaning
    if (!doc.cleanContent || doc.cleanContent.length < 10) {
      console.log('  Skipped: No content after cleaning');
      continue;
    }

    // Chunk the document
    const textChunks = chunkDocument(doc.cleanContent);
    console.log(`  Chunks: ${textChunks.length}`);

    // Build chunk metadata
    for (let j = 0; j < textChunks.length; j++) {
      const chunk = buildChunkMetadata(textChunks[j], doc, j + 1);
      allChunks.push(chunk);
    }
  }

  // Step 3: Build and write output
  console.log('\nBuilding output...');
  const collection = buildChunkCollection(allChunks, files.length);
  writeOutput(collection);

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Documents processed: ${files.length}`);
  console.log(`Total chunks created: ${allChunks.length}`);
  console.log(`Output written to: ${OUTPUT_FILE}`);
  console.log('\nDone!');
}

// Run the pipeline
main().catch((error) => {
  console.error('Error during ingestion:', error);
  process.exit(1);
});
