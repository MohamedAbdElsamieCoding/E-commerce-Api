import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import User from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];
  if (!authHeader)
    return next(new AppError("Unauthorized", 401, httpStatusText.FAIL));
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return next(
        new AppError(
          "The user belonging to this token no longer exists",
          401,
          httpStatusText.FAIL
        )
      );
    req.currentUser = user;
    next();
  } catch (err) {
    return next(new AppError("invalid Token", 403, httpStatusText.FAIL));
  }
};
export default verifyToken;
