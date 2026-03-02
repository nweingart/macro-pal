const LOG_PREFIX = '[MacroPal]';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const formatMessage = (level: LogLevel, tag: string, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  return `${timestamp} ${LOG_PREFIX} [${level.toUpperCase()}] [${tag}] ${message}`;
};

export const logger = {
  debug: (tag: string, message: string, data?: unknown) => {
    console.log(formatMessage('debug', tag, message), data !== undefined ? data : '');
  },
  info: (tag: string, message: string, data?: unknown) => {
    console.log(formatMessage('info', tag, message), data !== undefined ? data : '');
  },
  warn: (tag: string, message: string, data?: unknown) => {
    console.warn(formatMessage('warn', tag, message), data !== undefined ? data : '');
  },
  error: (tag: string, message: string, data?: unknown) => {
    console.error(formatMessage('error', tag, message), data !== undefined ? data : '');
  },
};
