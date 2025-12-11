import React from 'react';
import styles from './styles.module.css';

/**
 * ProgressIndicator Component
 *
 * Displays reading progress for the textbook.
 * Currently stubbed - full functionality requires auth feature.
 *
 * @see README.md for API interface expected from auth feature
 */

export interface ProgressData {
  /** Total number of chapters in the textbook */
  totalChapters: number;
  /** Number of chapters the user has completed */
  completedChapters: number;
  /** Array of chapter IDs that have been completed */
  completedChapterIds: string[];
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

interface ProgressIndicatorProps {
  /** Progress data from auth system (optional - uses stub if not provided) */
  progress?: ProgressData;
  /** Display variant */
  variant?: 'compact' | 'full';
  /** Show login prompt when not authenticated */
  showLoginPrompt?: boolean;
}

// Stubbed progress data for unauthenticated users
const stubbedProgress: ProgressData = {
  totalChapters: 6,
  completedChapters: 0,
  completedChapterIds: [],
  isAuthenticated: false,
};

export default function ProgressIndicator({
  progress = stubbedProgress,
  variant = 'full',
  showLoginPrompt = true,
}: ProgressIndicatorProps): React.ReactElement {
  const { totalChapters, completedChapters, isAuthenticated } = progress;
  const percentage = totalChapters > 0
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  if (!isAuthenticated && showLoginPrompt) {
    return (
      <div className={styles.progressContainer}>
        <div className={styles.loginPrompt}>
          <span className={styles.loginIcon}>📚</span>
          <span className={styles.loginText}>
            Login to track your reading progress
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={styles.progressCompact}>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className={styles.progressText}>
          {completedChapters}/{totalChapters}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        <span className={styles.progressLabel}>Your Progress</span>
        <span className={styles.progressPercentage}>{percentage}%</span>
      </div>
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBar}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className={styles.progressDetails}>
        {completedChapters} of {totalChapters} chapters completed
      </div>
    </div>
  );
}

// Named export for use in other components
export { ProgressIndicator };
