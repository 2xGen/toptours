/**
 * Logger utility - removes console statements in production
 * Use this instead of console.log/error/warn for better performance
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    // In production, you might want to send errors to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

// For server-side code, you can also use:
// if (process.env.NODE_ENV === 'development') console.log(...)

