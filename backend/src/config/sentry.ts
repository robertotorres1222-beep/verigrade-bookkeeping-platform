// Sentry Error Tracking Configuration
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
      profilesSampleRate: 1.0, // Profile 100% of transactions
      integrations: [
        new ProfilingIntegration(),
      ],
      beforeSend(event, hint) {
        // Don't send test errors
        if (process.env.NODE_ENV !== 'production') {
          return null;
        }
        return event;
      },
    });

    console.log('✅ Sentry initialized for error tracking');
  } else {
    console.log('ℹ️  Sentry not initialized (no DSN or not in production)');
  }
}

export { Sentry };

