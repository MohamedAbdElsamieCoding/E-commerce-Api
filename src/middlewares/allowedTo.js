import { AppError } from "../utils/appError.js";
const allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    next();
  };
};
export default allowedTo;
