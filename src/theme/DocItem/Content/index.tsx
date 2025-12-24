/**
 * DocItem/Content - Swizzled component to inject PersonalizeButton and TranslateButton
 * Wraps the default DocItem content with personalization and translation functionality
 */

import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import DocItemContent from '@theme-original/DocItem/Content';
import type DocItemContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { PersonalizeButton } from '../../../components/PersonalizeButton';
import { TranslateButton } from '../../../components/TranslateButton';
import type { ChapterSlug } from '../../../types/personalization';

type Props = WrapperProps<typeof DocItemContentType>;

// Valid chapter slugs that support personalization and translation
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

export default function DocItemContentWrapper(props: Props): JSX.Element {
  const { metadata } = useDoc();
  const chapterSlug = getChapterSlug(metadata.id);

  return (
    <>
      {/* Inject PersonalizeButton and TranslateButton at the top of chapter pages */}
      {chapterSlug && (
        <div className="translation-button-group">
          <PersonalizeButton chapterSlug={chapterSlug} />
          <TranslateButton chapterSlug={chapterSlug} />
        </div>
      )}
      <DocItemContent {...props} />
    </>
  );
}
