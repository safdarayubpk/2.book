/**
 * Signup Form Component with Background Questions
 * Copy this to src/components/auth/SignupForm.tsx
 */
import React, { useState } from 'react';
import styles from './AuthForms.module.css';

interface SignupData {
  email: string;
  password: string;
  name: string;
  programmingLevel: string;
  hardwareBackground: string;
  learningGoals: string[];
}

interface SignupFormProps {
  onSignup: (data: SignupData) => Promise<void>;
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSignup, onSwitchToLogin }: SignupFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    name: '',
    programmingLevel: '',
    hardwareBackground: '',
    learningGoals: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoalsChange = (goal: string) => {
    const goals = formData.learningGoals.includes(goal)
      ? formData.learningGoals.filter(g => g !== goal)
      : [...formData.learningGoals, goal];
    setFormData({ ...formData, learningGoals: goals });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSignup(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>Create Account</h2>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {step === 1 && (
          <>
            <div className={styles.field}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className={styles.stepInfo}>
              Help us personalize your learning experience
            </p>

            <div className={styles.field}>
              <label htmlFor="programmingLevel">Programming Experience</label>
              <select
                id="programmingLevel"
                name="programmingLevel"
                value={formData.programmingLevel}
                onChange={handleChange}
                required
              >
                <option value="">Select your level</option>
                <option value="beginner">Beginner (&lt; 1 year)</option>
                <option value="intermediate">Intermediate (1-3 years)</option>
                <option value="advanced">Advanced (3+ years)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="hardwareBackground">Hardware/Robotics Background</label>
              <select
                id="hardwareBackground"
                name="hardwareBackground"
                value={formData.hardwareBackground}
                onChange={handleChange}
                required
              >
                <option value="">Select your background</option>
                <option value="none">None</option>
                <option value="hobbyist">Hobbyist (Arduino, Raspberry Pi)</option>
                <option value="professional">Professional Experience</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>Learning Goals (select all that apply)</label>
              <div className={styles.checkboxGroup}>
                {[
                  { value: 'career_transition', label: 'Career Transition' },
                  { value: 'academic', label: 'Academic Study' },
                  { value: 'personal', label: 'Personal Interest' },
                  { value: 'upskilling', label: 'Professional Upskilling' },
                ].map(({ value, label }) => (
                  <label key={value} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.learningGoals.includes(value)}
                      onChange={() => handleGoalsChange(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Creating...' : step === 1 ? 'Continue' : 'Create Account'}
        </button>

        {step === 2 && (
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setStep(1)}
          >
            Back
          </button>
        )}
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className={styles.link}>
          Sign in
        </button>
      </p>
    </div>
  );
}
