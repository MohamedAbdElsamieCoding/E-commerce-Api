import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import User from "../models/user.model.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import { AppError } from "../../../utils/appError.js";

//get all users controller by admin
export const getAllUsers = asyncWrapper(async (req, res, next) => {
  // get all users using user model
  const users = await User.find().select("-password");
  if (!users)
    return next(new AppError("No users found", 404, httpStatusText.FAIL));
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: users,
  });
});

//update user by admin
export const updateUser = asyncWrapper(async (req, res, next) => {
  //get user by his id
  const { id } = req.params;
  const updateData = { ...req.body };
  if (req.file) return (updateData.profileImage = req.file.path);
  const updated = await User.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select("-password");
  if (!updated)
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  res.status(200).json({ status: httpStatusText.SUCCESS, data: updated });
});

//delete user by admin
export const deleteUser = asyncWrapper(async (req, res, next) => {
  //get user by his id
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted)
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "User deleted successfully" },
  });
});

//get current user profile
export const getProfile = asyncWrapper(async (req, res, next) => {
  const user = req.currentUser;
  if (!user)
    return next(new AppError("No user found", 404, httpStatusText.FAIL));
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: user,
  });
});
