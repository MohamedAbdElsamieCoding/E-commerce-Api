import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
import httpStatusText from "../utils/httpStatusText.js";

const verifyToken = (req, res, next) => {
  const authHeaders =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeaders || !authHeaders.startWith("Bearer "))
    return next(new AppError("Unauthorized", 401, httpStatusText.FAIL));
  const token = authHeaders.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.currentUser = decoded;
    next();
  } catch (err) {
    return next(new AppError("invalid Token", 403, httpStatusText.FAIL));
  }
};
export default verifyToken;
