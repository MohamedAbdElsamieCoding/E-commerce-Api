import asyncWrapper from "../middlewares/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";
import {
  changePasswordService,
  forgotPasswordService,
  loginUserService,
  logoutService,
  refreshAccessTokenService,
  registerUserService,
  resetPasswordService,
  updateUserService,
  verifyResetCodeService,
} from "../services/auth.service.js";

// Registration Controller
export const register = asyncWrapper(async (req, res, next) => {
  const newUser = await registerUserService(req.body, req.file);
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});

// Login Controller
export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken } = await loginUserService(email, password);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Logged in successfully",
      data: { accessToken: accessToken, refreshToken: refreshToken },
    },
  });
});

// Update user information in profile
export const updateProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;

  const updatedUser = await updateUserService(userId, req.body);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: updatedUser,
    },
  });
});

// Delete profile from DB
export const deleteAccount = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;
  const result = await deleteAccountService(userId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// Change password controller
export const changePassword = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const result = await changePasswordService(
    oldPassword,
    newPassword,
    confirmNewPassword,
    userId
  );
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// Forgot password controller
export const forgotPassword = asyncWrapper(async (req, res, next) => {
  //check if email is existing
  const { email } = req.body;
  const result = await forgotPasswordService(email);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// Verify reset code controller
export const verifyResetCode = asyncWrapper(async (req, res, next) => {
  const { email, resetCode } = req.body;
  const result = await verifyResetCodeService(email, resetCode);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: result,
  });
});

// Reset password controller
export const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const result = await resetPasswordService(email, newPassword);
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { token: token } });
});

// Logout controller
export const logout = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;

  const result = logoutService(userId);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    result,
  });
});

// Refresh access token controller
export const refreshAccessToken = asyncWrapper(async (req, res, next) => {
  const { refreshToken } = req.body;

  const newAccessToken = await refreshAccessTokenService(refreshToken);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { accessToken: newAccessToken },
  });
});
