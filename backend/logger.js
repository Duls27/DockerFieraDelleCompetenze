// logger.js
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// ─── Rotazione automatica ───
const fileRotate = new transports.DailyRotateFile({
  dirname: 'logs',                  // cartella (creata se non esiste)
  filename: 'fdc-%DATE%.log',       // p.es: fdc-2025-06-25.log
  datePattern: 'YYYY-MM-DD',        // nuovo file ogni giorno
  maxSize: '100k',                  // max 100 KB per file
  maxFiles: '7d',                   // conserva solo 7 giorni
  zippedArchive: true               // comprimi i log più vecchi
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    fileRotate,
    // Mostra sul terminale solo in sviluppo
    new transports.Console({ silent: process.env.NODE_ENV === 'production' })
  ]
});

module.exports = logger;
