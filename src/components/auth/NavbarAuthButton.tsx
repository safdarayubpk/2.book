/**
 * NavbarAuthButton Component
 * Shows Sign In/Sign Up for guests, user dropdown for authenticated users
 */

import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';
import styles from './NavbarAuthButton.module.css';

function NavbarAuthButtonContent() {
  const { user, isLoading, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<'login' | 'signup'>('login');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openModal = (view: 'login' | 'signup') => {
    setModalView(view);
    setIsModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  if (isLoading) {
    return <div className={styles.loading}>...</div>;
  }

  if (user) {
    return (
      <div className={styles.userMenu}>
        <button
          className={styles.userButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <span className={styles.avatar}>
            {(user.name || user.email)[0].toUpperCase()}
          </span>
          <span className={styles.userName}>
            {user.name || user.email.split('@')[0]}
          </span>
          <span className={styles.dropdownArrow}>
            {isDropdownOpen ? '\u25B2' : '\u25BC'}
          </span>
        </button>

        {isDropdownOpen && (
          <>
            <div
              className={styles.dropdownBackdrop}
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <strong>{user.name || 'User'}</strong>
                <span className={styles.dropdownEmail}>{user.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={styles.authButtons}>
        <button
          className={styles.signInButton}
          onClick={() => openModal('login')}
        >
          Sign In
        </button>
        <button
          className={styles.signUpButton}
          onClick={() => openModal('signup')}
        >
          Sign Up
        </button>
      </div>

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialView={modalView}
      />
    </>
  );
}

export default function NavbarAuthButton() {
  return (
    <BrowserOnly fallback={<div className={styles.loading}>...</div>}>
      {() => <NavbarAuthButtonContent />}
    </BrowserOnly>
  );
}
