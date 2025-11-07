import logger from "../config/logger.js";
import httpStatusText from "../utils/httpStatusText.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const statusText = err.statusText || httpStatusText.ERROR;
  logger.error(
    `${req.id || "no id"} ${err.message} , ${req.method} , ${
      req.originalUrl
    }\n${err.stack}`
  );
  res.status(statusCode).json({
    status: statusText,
    message: err.message || httpStatusText.ERROR,
  });
};
