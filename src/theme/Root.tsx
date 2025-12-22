/**
 * Root - Docusaurus theme root wrapper
 * Tasks T021, T031, T056
 */

import React, { lazy, Suspense } from 'react';
import { ChatProvider } from '../context/ChatContext';
import ChatToggle from '../components/ChatToggle';

// Lazy-load heavy components for bundle optimization (T056)
const ChatPanel = lazy(() => import('../components/ChatPanel'));
const HighlightAsk = lazy(() => import('../components/HighlightAsk'));

interface RootProps {
  children: React.ReactNode;
}

/**
 * Root component wrapper for Docusaurus
 * Wraps the entire application with global providers and UI components
 */
export default function Root({ children }: RootProps): React.ReactElement {
  return (
    <ChatProvider>
      {children}
      <ChatToggle />
      <Suspense fallback={null}>
        <ChatPanel />
        <HighlightAsk />
      </Suspense>
    </ChatProvider>
  );
}
