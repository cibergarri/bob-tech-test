import winston from 'winston';

const logLevel = process.env.LOG_LEVEL;
const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const errorFileTransport = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
});

const combinedFileTransport = new winston.transports.File({
  filename: 'logs/combined.log',
  level: logLevel,
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.label({ label: 'app log:' }),
    winston.format.timestamp(),
    winston.format.splat(),
    myFormat,
  ),
  level: logLevel });

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.label({ label: 'app log:' }),
    winston.format.timestamp(),
    winston.format.splat(),
    myFormat,
  ),
  transports: [
    ...(process.env.NODE_ENV !== 'TEST' && [errorFileTransport]),
    ...(process.env.NODE_ENV !== 'TEST' && [combinedFileTransport]),
    ...(process.env.NODE_ENV !== 'PROD' && [consoleTransport]),
  ],
});
