import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface ChapterInfo {
  slug: string;
  title: string;
}

const chapters: ChapterInfo[] = [
  { slug: '/docs/chapter-1', title: 'Chapter 1: Introduction to Physical AI' },
  { slug: '/docs/chapter-2', title: 'Chapter 2: Humanoid Robot Architecture' },
  { slug: '/docs/chapter-3', title: 'Chapter 3: Perception & Sensing' },
  { slug: '/docs/chapter-4', title: 'Chapter 4: Motion & Control' },
  { slug: '/docs/chapter-5', title: 'Chapter 5: Learning & Adaptation' },
  { slug: '/docs/chapter-6', title: 'Chapter 6: Applications & Future' },
];

interface ChapterNavProps {
  currentChapter: number; // 1-6
}

export default function ChapterNav({ currentChapter }: ChapterNavProps): React.ReactElement {
  const currentIndex = currentChapter - 1;
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <nav className={styles.chapterNav} aria-label="Chapter navigation">
      <div className={styles.navContainer}>
        {prevChapter ? (
          <Link to={prevChapter.slug} className={styles.navButton}>
            <span className={styles.navLabel}>Previous</span>
            <span className={styles.navTitle}>{prevChapter.title}</span>
          </Link>
        ) : (
          <div className={styles.navPlaceholder} />
        )}

        {nextChapter ? (
          <Link to={nextChapter.slug} className={styles.navButton}>
            <span className={styles.navLabel}>Next</span>
            <span className={styles.navTitle}>{nextChapter.title}</span>
          </Link>
        ) : (
          <Link to="/docs/intro" className={styles.navButton}>
            <span className={styles.navLabel}>Finished!</span>
            <span className={styles.navTitle}>Back to Introduction</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
