// eslint-disable-next-line no-unused-vars
const winston = require('winston');
// eslint-disable-next-line no-unused-vars
const expressWinston = require('express-winston');

// eslint-disable-next-line no-unused-vars
const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' })
  ],
  format: winston.format.json()
});
// eslint-disable-next-line no-unused-vars
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' })
  ],
  format: winston.format.json()
});

module.exports = {
  requestLogger,
  errorLogger
};
