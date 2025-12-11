import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ProgressIndicator from '@site/src/components/ProgressIndicator';

import styles from './index.module.css';

const chapters = [
  {
    number: 1,
    title: 'Introduction to Physical AI',
    description: 'Understanding what makes Physical AI different from traditional AI and why it matters for robotics.',
    slug: '/docs/chapter-1',
  },
  {
    number: 2,
    title: 'Humanoid Robot Architecture',
    description: 'The building blocks of humanoid robots: sensors, actuators, and control systems.',
    slug: '/docs/chapter-2',
  },
  {
    number: 3,
    title: 'Perception & Sensing',
    description: 'How robots see, feel, and understand their environment through sensors and perception algorithms.',
    slug: '/docs/chapter-3',
  },
  {
    number: 4,
    title: 'Motion & Control',
    description: 'Making robots move naturally and precisely through walking, grasping, and whole-body coordination.',
    slug: '/docs/chapter-4',
  },
  {
    number: 5,
    title: 'Learning & Adaptation',
    description: 'Teaching robots to improve through experience using reinforcement learning and imitation learning.',
    slug: '/docs/chapter-5',
  },
  {
    number: 6,
    title: 'Applications & Future',
    description: 'Real-world uses of Physical AI and humanoid robotics, plus emerging trends and ethical considerations.',
    slug: '/docs/chapter-6',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Reading
          </Link>
        </div>
      </div>
    </header>
  );
}

function TableOfContents() {
  return (
    <section className={styles.tableOfContents}>
      <div className="container">
        <Heading as="h2" className={styles.tocTitle}>
          Table of Contents
        </Heading>
        <p className={styles.tocSubtitle}>
          6 chapters, approximately 45 minutes total reading time
        </p>
        <div className={styles.progressWrapper}>
          <ProgressIndicator />
        </div>
        <div className={styles.chapterList}>
          {chapters.map((chapter) => (
            <Link
              key={chapter.number}
              to={chapter.slug}
              className={styles.chapterCard}
            >
              <div className={styles.chapterNumber}>
                Chapter {chapter.number}
              </div>
              <Heading as="h3" className={styles.chapterTitle}>
                {chapter.title}
              </Heading>
              <p className={styles.chapterDescription}>
                {chapter.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Mobile-Friendly</Heading>
              <p>
                Read comfortably on any device. Optimized for mobile with fast loading times.
              </p>
            </div>
          </div>
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">6 Chapters</Heading>
              <p>
                Comprehensive coverage from fundamentals to real-world applications of Physical AI.
              </p>
            </div>
          </div>
          <div className={clsx('col col--4')}>
            <div className="text--center padding-horiz--md">
              <Heading as="h3">Quick Read</Heading>
              <p>
                Each chapter takes under 7 minutes to read. Complete the textbook in under 45 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="An interactive textbook for Physical AI and Humanoid Robotics">
      <HomepageHeader />
      <main>
        <Features />
        <TableOfContents />
      </main>
    </Layout>
  );
}
