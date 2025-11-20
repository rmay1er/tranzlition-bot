import pino from 'pino';

// Создание логгера с красивым форматированием
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      customColors: 'info:blue,warn:yellow,error:red,debug:green,fatal:magenta',
    },
  },
});

// Дополнительные методы для удобства
export const log = {
  info: (message: string, data?: any) => logger.info(data, message),
  warn: (message: string, data?: any) => logger.warn(data, message),
  error: (message: string, data?: any) => logger.error(data, message),
  debug: (message: string, data?: any) => logger.debug(data, message),
  fatal: (message: string, data?: any) => logger.fatal(data, message),
};

export default logger;
