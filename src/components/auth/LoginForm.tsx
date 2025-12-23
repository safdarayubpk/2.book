/**
 * LoginForm Component
 * Simple email/password login form
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { SignInData } from '../../types/auth';
import styles from './AuthForms.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const { signIn, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    const data: SignInData = { email, password };

    try {
      await signIn(data);
      onSuccess?.();
    } catch {
      // Error is handled by context
    }
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {displayError && <div className={styles.error}>{displayError}</div>}

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="login-email">Email</label>
        <input
          id="login-email"
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
        <label className={styles.label} htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className={`${styles.button} ${styles.buttonPrimary}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className={styles.spinner} />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {onSwitchToSignup && (
        <p className={styles.toggleLink}>
          Don't have an account?{' '}
          <a onClick={onSwitchToSignup}>Create one</a>
        </p>
      )}
    </form>
  );
}
