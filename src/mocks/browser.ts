import { setupWorker } from 'msw/browser';

import { allHandlers } from './handlers';

// MSW service worker setup
export const worker = setupWorker(...allHandlers);

// Start worker
export const startWorker = async () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return worker.start({
      onUnhandledRequest: 'warn',
    });
  }
};