import { setupWorker } from 'msw';
import { gamificationHandlers } from './gamification-handlers';

// MSW service worker setup
export const worker = setupWorker(...gamificationHandlers);

// Start worker
export const startWorker = async () => {
  if (typeof window !== 'undefined') {
    return worker.start({
      onUnhandledRequest: 'warn',
    });
  }
};