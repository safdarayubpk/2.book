/**
 * DocItem/Layout - Swizzled component to inject PersonalizeButton
 * Wraps the default DocItem layout with personalization functionality
 */

import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';
import { PersonalizeButton } from '../../../components/PersonalizeButton';
import type { ChapterSlug } from '../../../types/personalization';

type Props = WrapperProps<typeof DocItemLayoutType>;

// Valid chapter slugs that support personalization
const VALID_CHAPTER_SLUGS: ChapterSlug[] = [
  'intro',
  'chapter-1',
  'chapter-2',
  'chapter-3',
  'chapter-4',
  'chapter-5',
  'chapter-6',
];

/**
 * Extract chapter slug from doc metadata
 */
function getChapterSlug(docId: string): ChapterSlug | null {
  // docId format: "chapter-1/index" or "intro"
  const slug = docId.split('/')[0];

  if (VALID_CHAPTER_SLUGS.includes(slug as ChapterSlug)) {
    return slug as ChapterSlug;
  }

  return null;
}

export default function DocItemLayoutWrapper(props: Props): JSX.Element {
  const { metadata } = useDoc();
  const chapterSlug = getChapterSlug(metadata.id);

  return (
    <>
      {/* Inject PersonalizeButton at the top of chapter pages */}
      {chapterSlug && (
        <div style={{ marginBottom: '1rem' }}>
          <PersonalizeButton chapterSlug={chapterSlug} />
        </div>
      )}
      <DocItemLayout {...props} />
    </>
  );
}
