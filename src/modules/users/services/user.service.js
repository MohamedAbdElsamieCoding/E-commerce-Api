import User from "../models/user.model.js";
import { AppError } from "../../../utils/appError.js";
import httpStatusText from "../../../utils/httpStatusText.js";

// Get all users by admin service
export const getAllUsersService = async () => {
  // Get all users using user model
  const users = await User.find().select("-password");
  if (!users) throw new AppError("No users found", 404, httpStatusText.FAIL);

  return users;
};

// Update user by admin service
export const updateUserService = async (userId, updateData) => {
  if (updateData.file) {
    updateData.profileImage = updateData.file.path;
    delete updateData.file;
  }
  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
  }).select("-password");
  // Checking if user is existed
  if (!updatedUser)
    throw new AppError("User not found", 404, httpStatusText.FAIL);
  return updatedUser;
};

// Delete user by admin service
export const deleteUserService = async (userId) => {
  const deleted = await User.findByIdAndDelete(userId);
  if (!deleted) throw new AppError("User not found", 404, httpStatusText.FAIL);
  return { message: "User deleted successfully" };
};

// Get current user profile
export const getProfileService = async (user) => {
  if (!user) throw new AppError("No user found", 404, httpStatusText.FAIL);
  return user;
};
