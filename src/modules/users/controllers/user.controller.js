import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import {
  deleteUserService,
  getAllUsersService,
  updateUserService,
  getProfileService,
} from "../services/user.service.js";

// Get all users controller by admin
export const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await getAllUsersService();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: users,
  });
});

// Update user by admin
export const updateUser = asyncWrapper(async (req, res, next) => {
  //get user by his id
  const { id } = req.params;
  const updateData = { ...req.body };
  if (req.file) {
    updateData.file = req.body;
  }
  const updatedUser = await updateUserService(id, updateData);
  res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedUser });
});

// Delete user by admin
export const deleteUser = asyncWrapper(async (req, res, next) => {
  // Get user by his id
  const { id } = req.params;
  const result = await deleteUserService(id);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// Get current user profile
export const getProfile = asyncWrapper(async (req, res, next) => {
  const user = req.currentUser;
  const result = getProfileService(user);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});
