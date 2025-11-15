import httpStatusText from "../../../utils/httpStatusText.js";
import { AppError } from "../../../utils/appError.js";
import User from "../../users/models/user.model.js";
import { userRoles } from "../../../utils/userRoles.js";
import { generateJwt } from "../../../utils/generateJwt.js";
import { sendEmail } from "../../../utils/sendEmail.js";
import { generateAndSaveOtp } from "../services/otp.service.js";

import bcrypt from "bcrypt";

// Registration service
export const registerUserService = async (userData, file) => {
  // Business logic for registering a user
  const { firstName, lastName, email, password, role } = userData;
  if (!firstName || !lastName || !email || !password)
    throw new AppError("Fields are required", 400, httpStatusText.ERROR);
  // Checking if user is existed
  const existingUser = await User.findOne({ email: email });
  if (existingUser) throw new AppError("email is already registered");
  // hash password for security
  const hashedPassword = await bcrypt.hash(password, 10);
  // Save new user in DB
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || userRoles.USER,
    profileImage: file ? file.path : null,
    coverImage: file ? file.path : null,
  });

  await newUser.save();

  return newUser;
};

// Login service
export const loginUserService = async (email, password) => {
  if (!email || !password)
    throw new AppError(
      "Email and Password are required",
      400,
      httpStatusText.ERROR
    );

  // Checking if user is existed
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("Invalid email or password");
  if (!password)
    throw new AppError("Invalid email or password", 400, httpStatusText.FAIL);

  // Creating accessToken and refreshToken
  const accessToken = generateJwt(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    "15m"
  );
  const refreshToken = generateJwt(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    process.env.JWT_REFRESH_SECRET,
    "7d"
  );
  // Save refreshToken in model
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

// Update profile service
export const updateUserService = async (userId, updates) => {
  const allowedUpdates = ["firstName", "lastName", "email"];
  // Checking if user is existed
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, httpStatusText.ERROR);
  // Get updates and change it in DB
  allowedUpdates.forEach((field) => {
    if (updates[field]) {
      user[field] = updates[field];
    }
  });
  await user.save();

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };
};

// Delete account service
export const deleteAccountService = async (userId) => {
  // Checking if user is existed and delete it
  const user = await User.findByIdAndDelete(userId);
  if (!user)
    throw new AppError("User not found or deleted", 404, httpStatusText.FAIL);
  return {
    message: "User deleted successfully",
  };
};

// Change password service
export const changePasswordService = async (
  oldPassword,
  newPassword,
  confirmNewPassword,
  userId
) => {
  // Checking if user is existed
  if (!oldPassword || !newPassword || !confirmNewPassword)
    throw new AppError("fields are required", 404, httpStatusText.ERROR);

  // Get current user
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, httpStatusText.ERROR);

  // check if old user is correct
  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordCorrect)
    throw new AppError("Invalid old password", 400, httpStatusText.ERROR);
  if (newPassword !== confirmNewPassword)
    throw new AppError("Passwords do not match", 400, httpStatusText.ERROR);
  // if all correct password will save
  user.password = newPassword;
  await user.save();

  return {
    message: "Password changed successfully",
  };
};

// Forgot password service
export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email: email });
  if (!user) throw new AppError("Invalid Email", 400, httpStatusText.FAIL);

  // Create reset code for email , hashed reset code
  const otpCode = generateAndSaveOtp(user._id);
  // Send reset password to email
  try {
    const message = `Hi ${user.firstName}.\nWe received a request to reset the password for your account at Mine market.\nYour password reset code is:< ${otpCode}>\nPlease use this code within the next 10 minutes to reset your password.\nIf you did not request a password reset, please ignore this email — your account will remain secure.\nThank you,\nThe Mine Market Support Team`;
    await sendEmail({
      email: user.email,
      subject: "Your password reset code {valid for 10min}",
      message,
    });
    return { message: "Reset code sent successfully" };
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    throw new AppError("Something is wrong", 500, httpStatusText.ERROR);
  }
};

// Verify reset code service
export const verifyResetCodeService = async (email, resetCode) => {
  if (!email || !resetCode) throw new AppError("Fields are required");

  // Checking if reset code matching with sent code
  const user = await User.findOne({
    email: email,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError("Reset code is invalid or expired");

  const isMatch = await bcrypt.compare(resetCode, user.passwordResetCode);
  if (!isMatch)
    throw new AppError(
      "Invalid or expired reset code. Please request a new one",
      400
    );

  // Reset code verified true
  user.passwordResetVerified = true;
  await user.save();

  return { message: "Reset code verified successfully" };
};

// Reset password service
export const resetPasswordService = async (email, newPassword) => {
  // Checking if user is existed
  const user = await User.findOne({ email: email });
  if (!user) throw new AppError("Invalid email", 404);
  if (!user.passwordResetVerified)
    throw new AppError("Reset code not verified", 400);

  //put new password instead of old password
  user.password = newPassword;
  user.passwordResetVerified = false;
  await user.save();

  //if all done =>{generate token}
  const token = generateJwt(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    "15m"
  );
  return token;
};

// Logout service
export const logoutService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404, httpStatusText.ERROR);
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  // Clear tokens from cookies (optional but recommended if you use cookies)
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return { message: "Logged out successfully" };
};

// Refresh access token service
export const refreshAccessTokenService = async (refreshToken) => {
  if (!refreshToken)
    throw new AppError("Refresh token required", 400, httpStatusText.FAIL);
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    // Generate new access token
    const newAccessToken = generateJwt(
      {
        id: decoded.id || decoded._id,
        email: decoded.email,
      },
      process.env.JWT_SECRET_KEY,
      "15m"
    );

    return newAccessToken;
  } catch (err) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      httpStatusText.FAIL
    );
  }
};
