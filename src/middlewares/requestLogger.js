import onFinished from "on-finished";
import logger from "../config/logger.js";
import httpStatusText from "../utils/httpStatusText.js";
import { randomUUID } from "crypto";

export const requestLogger = (req, res, next) => {
  const id = randomUUID();
  const start = Date.now();

  req.id = id;
  res.setHeader("x-request-id", id);
  logger.http(`[${id}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  onFinished(res, () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;
    const statusType =
      statusCode >= 400 ? httpStatusText.ERROR : httpStatusText.SUCCESS;
    const msg = `[${id}] ${method} ${originalUrl} →${statusType} (${statusCode}) [${duration}] `;

    if (statusCode >= 400) {
      logger.error(msg);
    } else {
      logger.http(msg);
    }
  });
  next();
};
