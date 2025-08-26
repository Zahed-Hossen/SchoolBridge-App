/**
 * Error codes and their corresponding user-friendly messages
 */
export const ERROR_CODES = {
  // Authentication errors (1000-1099)
  AUTH_INVALID_CREDENTIALS: {
    code: 1001,
    message: 'Invalid email or password. Please try again.',
  },
  AUTH_UNAUTHORIZED: {
    code: 1002,
    message: 'You are not authorized to access this resource.',
  },
  AUTH_SESSION_EXPIRED: {
    code: 1003,
    message: 'Your session has expired. Please log in again.',
  },

  // Validation errors (1100-1199)
  VALIDATION_ERROR: {
    code: 1101,
    message: 'Validation failed. Please check your input.',
  },

  // Resource errors (1200-1299)
  RESOURCE_NOT_FOUND: {
    code: 1201,
    message: 'The requested resource was not found.',
  },
  RESOURCE_EXISTS: {
    code: 1202,
    message: 'A resource with this identifier already exists.',
  },

  // Permission errors (1300-1399)
  PERMISSION_DENIED: {
    code: 1301,
    message: 'You do not have permission to perform this action.',
  },

  // Server errors (1400-1499)
  INTERNAL_SERVER_ERROR: {
    code: 1401,
    message: 'An unexpected error occurred. Please try again later.',
  },
  SERVICE_UNAVAILABLE: {
    code: 1403,
    message: 'The service is currently unavailable. Please try again later.',
  },
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(error, context = {}) {
    const errorInfo =
      typeof error === 'string'
        ? { message: error }
        : error.response?.data || error;

    const { code, message, details } = errorInfo;

    super(message || ERROR_CODES.INTERNAL_SERVER_ERROR.message);
    this.name = 'ApiError';
    this.code = code || ERROR_CODES.INTERNAL_SERVER_ERROR.code;
    this.details = details || {};
    this.context = context;
    this.status = error.response?.status;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Checks if the error is a specific type
   * @param {number|string} errorCode - The error code to check against
   * @returns {boolean} True if the error matches the code
   */
  is(errorCode) {
    return this.code === errorCode || this.status === errorCode;
  }

  /**
   * Gets a user-friendly error message
   * @returns {string} User-friendly error message
   */
  getUserMessage() {
    // Find a matching error code with a friendly message
    const matchedError = Object.values(ERROR_CODES).find(
      (err) => err.code === this.code,
    );

    return (
      matchedError?.message || this.message || 'An unexpected error occurred.'
    );
  }

  /**
   * Logs the error with context
   */
  log() {
    console.error(`[${this.name}] ${this.code}: ${this.message}`, {
      details: this.details,
      context: this.context,
      stack: this.stack,
    });
  }
}

/**
 * Handles API errors consistently
 * @param {Error|Object} error - The error object
 * @param {Object} context - Additional context about where the error occurred
 * @throws {ApiError} A standardized error object
 */
export const handleApiError = (error, context = {}) => {
  // If it's already an ApiError, just re-throw it
  if (error instanceof ApiError) {
    error.context = { ...error.context, ...context };
    error.log();
    throw error;
  }

  // Handle network errors (no response at all)
  if (error.message === 'Network Error' || !error.response) {
    const networkError = new ApiError(
      {
        code: 'NETWORK_ERROR',
        message:
          'Unable to connect to the server. Please check your internet connection.',
      },
      context,
    );
    networkError.log();
    throw networkError;
  }

  // Handle HTTP errors (4xx, 5xx) and always surface backend error message if present
  const { status, data } = error.response;
  // Prefer backend error message if available
  let backendMessage = data?.message || data?.error || error.message;
  // If backend returns a string as data, use it
  if (!backendMessage && typeof data === 'string') backendMessage = data;
  const apiError = new ApiError(
    {
      code: data?.code || `HTTP_${status}`,
      message: backendMessage,
      details: data?.errors || {},
      status,
    },
    context,
  );

  apiError.log();
  throw apiError;
};

/**
 * Wraps an async function with error handling
 * @param {Function} fn - The async function to wrap
 * @param {Object} options - Options for error handling
 * @param {Function} options.onError - Custom error handler
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (typeof options.onError === 'function') {
        return options.onError(error);
      }
      throw handleApiError(error, { function: fn.name });
    }
  };
};

/**
 * Creates an error boundary component for React
 * @param {Object} options - Error boundary options
 * @returns {React.Component} An error boundary component
 */
export const createErrorBoundary = (options = {}) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
      this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError(error) {
      return {
        hasError: true,
        error: error instanceof ApiError ? error : new ApiError(error),
      };
    }

    componentDidCatch(error, errorInfo) {
      // Log the error to an error reporting service
      console.error('Error Boundary caught an error:', error, errorInfo);

      if (options.onError) {
        options.onError(error, errorInfo);
      }
    }

    resetError() {
      this.setState({ hasError: false, error: null });
      if (options.onReset) {
        options.onReset();
      }
    }

    render() {
      if (this.state.hasError) {
        return options.fallback ? (
          options.fallback({
            error: this.state.error,
            resetError: this.resetError,
          })
        ) : (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error.getUserMessage()}</p>
            <button onClick={this.resetError}>Try again</button>
          </div>
        );
      }

      return this.props.children;
    }
  };
};
