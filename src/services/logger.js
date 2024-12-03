const LOG_LEVELS = {
  ERROR: '❌ ERROR',
  INFO: '✅ INFO',
  WARN: '⚠️ WARN',
  DEBUG: '🔍 DEBUG',
};

export const logger = {
  info: (message, data = null) => {
    console.log(
      `${LOG_LEVELS.INFO}: ${message}${
        data ? '\n' + JSON.stringify(data, null, 2) : ''
      }`
    );
  },

  error: (message, error = null) => {
    console.error(
      `${LOG_LEVELS.ERROR}: ${message}${error ? '\n' + error.stack : ''}`
    );
  },

  warn: (message, data = null) => {
    console.warn(
      `${LOG_LEVELS.WARN}: ${message}${
        data ? '\n' + JSON.stringify(data, null, 2) : ''
      }`
    );
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(
        `${LOG_LEVELS.DEBUG}: ${message}${
          data ? '\n' + JSON.stringify(data, null, 2) : ''
        }`
      );
    }
  },
};
