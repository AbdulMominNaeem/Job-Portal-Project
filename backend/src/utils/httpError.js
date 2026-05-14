class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (message, details) => new HttpError(400, message, details);
const unauthorized = (message = 'Unauthorized') => new HttpError(401, message);
const forbidden = (message = 'Forbidden') => new HttpError(403, message);
const notFound = (message = 'Not Found') => new HttpError(404, message);
const conflict = (message = 'Conflict') => new HttpError(409, message);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
