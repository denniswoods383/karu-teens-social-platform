interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userId?: string;
  timestamp: string;
}

export const logError = async (error: Error, context?: Record<string, any>) => {
  const errorLog: ErrorLog = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userId: context?.userId,
    timestamp: new Date().toISOString()
  };

  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Send to error tracking service
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...errorLog, context })
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};

export const setupErrorTracking = () => {
  window.addEventListener('error', (event) => {
    logError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), { type: 'unhandledrejection' });
  });
};