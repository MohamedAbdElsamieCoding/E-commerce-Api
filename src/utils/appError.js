import httpStatusText from "./httpStatusText.js";

export class AppError extends Error {
  constructor(message, statusCode, statusText) {
    super(message);
    this.statusCode = statusCode || 500;
    this.statusText = statusText || httpStatusText.ERROR;
  }
}
