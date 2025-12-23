/**
 * SignupForm Component
 * 2-step signup form with background questions for personalization
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { SignUpData, ProgrammingLevel, HardwareBackground, LearningGoal } from '../../types/auth';
import styles from './AuthForms.module.css';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const PROGRAMMING_LEVELS: { value: ProgrammingLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner (< 1 year)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)' },
  { value: 'advanced', label: 'Advanced (3+ years)' },
];

const HARDWARE_BACKGROUNDS: { value: HardwareBackground; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'hobbyist', label: 'Hobbyist (Arduino, Raspberry Pi)' },
  { value: 'professional', label: 'Professional (Industrial robotics)' },
];

const LEARNING_GOALS: { value: LearningGoal; label: string }[] = [
  { value: 'career_transition', label: 'Career Transition' },
  { value: 'academic', label: 'Academic Study' },
  { value: 'personal', label: 'Personal Interest' },
  { value: 'upskilling', label: 'Professional Upskilling' },
];

export default function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signUp, error, clearError, isLoading } = useAuth();
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Step 2 fields
  const [programmingLevel, setProgrammingLevel] = useState<ProgrammingLevel>('beginner');
  const [hardwareBackground, setHardwareBackground] = useState<HardwareBackground>('none');
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);

  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoalChange = (goal: LearningGoal) => {
    setLearningGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (learningGoals.length === 0) {
      setLocalError('Please select at least one learning goal');
      return;
    }

    const data: SignUpData = {
      email,
      password,
      name: name || undefined,
      programmingLevel,
      hardwareBackground,
      learningGoals,
    };

    try {
      await signUp(data);
      onSuccess?.();
    } catch {
      // Error is handled by context
    }
  };

  const displayError = localError || error;

  return (
    <div>
      {/* Step Indicator */}
      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`} />
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`} />
      </div>

      {displayError && <div className={styles.error}>{displayError}</div>}

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="signup-name">Name (optional)</label>
            <input
              id="signup-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Continue
          </button>

          {onSwitchToLogin && (
            <p className={styles.toggleLink}>
              Already have an account?{' '}
              <a onClick={onSwitchToLogin}>Sign in</a>
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className={styles.form}>
          <p className={styles.sectionTitle}>Help us personalize your experience</p>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="programming-level">
              Programming Experience
            </label>
            <select
              id="programming-level"
              className={styles.select}
              value={programmingLevel}
              onChange={(e) => setProgrammingLevel(e.target.value as ProgrammingLevel)}
            >
              {PROGRAMMING_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="hardware-background">
              Hardware/Robotics Background
            </label>
            <select
              id="hardware-background"
              className={styles.select}
              value={hardwareBackground}
              onChange={(e) => setHardwareBackground(e.target.value as HardwareBackground)}
            >
              {HARDWARE_BACKGROUNDS.map((bg) => (
                <option key={bg.value} value={bg.value}>
                  {bg.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Learning Goals (select all that apply)</label>
            <div className={styles.checkboxGroup}>
              {LEARNING_GOALS.map((goal) => (
                <label key={goal.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={learningGoals.includes(goal.value)}
                    onChange={() => handleGoalChange(goal.value)}
                  />
                  {goal.label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
