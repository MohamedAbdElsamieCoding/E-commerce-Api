import bcrypt from "bcrypt";
import User from "../../users/models/user.model.js";
import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import { AppError } from "../../../utils/appError.js";
import { userRoles } from "../../../utils/userRoles.js";
import { generateJwt } from "../../../utils/generateJwt.js";
import { sendEmail } from "../../../utils/sendEmail.js";
import { generateAndSaveOtp } from "../services/otp.service.js";

// Registration Controller
export const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  if (!firstName || !lastName || !email || !password || !role)
    return next(new AppError("Fields are required", 400, httpStatusText.ERROR));
  const existingUser = await User.findOne({ email: email });
  if (existingUser) return next(new AppError("email is already registered"));
  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    role: role || userRoles.USER,
  });

  await newUser.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});
// Login Controller
export const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(
      new AppError("Email and Password are required", 400, httpStatusText.ERROR)
    );
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new AppError("Invalid email or password"));
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword)
    return next(
      new AppError("Invalid email or password", 400, httpStatusText.FAIL)
    );
  const accessToken = generateJwt(
    {
      email: user.email,
      id: user._id,
    },
    process.env.JWT_SECRET_KEY,
    "15m"
  );
  const refreshToken = generateJwt(
    {
      email: user.email,
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    "7d"
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Logged in successfully",
      data: { accessToken: accessToken, refreshToken: refreshToken },
    },
  });
});
// update user information in profile
export const updateProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;
  const allowedUpdates = ["firstName", "lastName", "email"];
  const user = await User.findById(userId);
  if (!user)
    return next(new AppError("User not found", 404, httpStatusText.ERROR));
  allowedUpdates.forEach((field) => {
    if (req.body[field]) {
      user[field] = req.body[field];
    }
  });

  await user.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    },
  });
});
//delete profile from db
export const deleteAccount = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;
  const user = await User.findByIdAndDelete(userId);

  if (!user)
    return next(new AppError("User not found", 404, httpStatusText.FAIL));
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Account deleted successfully",
    },
  });
});
// change password controller
export const changePassword = asyncWrapper(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmNewPassword)
    return next(new AppError("fields are required", 404, httpStatusText.ERROR));
  //get current user
  const userId = req.currentUser.id || req.currentUser._id;
  const user = await User.findById(userId);
  if (!user)
    return next(new AppError("User not found", 404, httpStatusText.ERROR));
  // check if old user is correct
  const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isOldPasswordCorrect)
    return next(
      new AppError("Invalid old password", 400, httpStatusText.ERROR)
    );
  if (newPassword !== confirmNewPassword)
    return new AppError("Passwords do not match", 400, httpStatusText.ERROR);

  user.password = newPassword;
  await user.save();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Password changed successfully" },
  });
});
//forgot password controller
export const forgotPassword = asyncWrapper(async (req, res, next) => {
  //check if email is existing
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user)
    return next(new AppError("Invalid Email", 400, httpStatusText.FAIL));

  //create reset code for email , hashed reset code
  const otpCode = generateAndSaveOtp(user._id);
  //send reset password to email
  try {
    const message = `Hi ${user.firstName}.\nWe received a request to reset the password for your account at Mine market.\nYour password reset code is:< ${otpCode}>\nPlease use this code within the next 10 minutes to reset your password.\nIf you did not request a password reset, please ignore this email — your account will remain secure.\nThank you,\nThe Mine Market Support Team`;
    await sendEmail({
      email: user.email,
      subject: "Your password reset code {valid for 10min}",
      message,
    });
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Reset code sent successfully" },
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new AppError("Something is wrong", 500, httpStatusText.ERROR));
  }
});
// verify reset code controller
export const verifyResetCode = asyncWrapper(async (req, res, next) => {
  const { email, resetCode } = req.body;
  if (!resetCode || !email) return next(new AppError("Fields are required"));
  //checking if reset code matching with sent code
  const user = await User.findOne({
    email: email,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Reset code is invalid or expired"));

  const isMatch = await bcrypt.compare(resetCode, user.passwordResetCode);
  if (!isMatch)
    return next(
      new AppError(
        "Invalid or expired reset code. Please request a new one",
        400
      )
    );

  // reset code verified true
  user.passwordResetVerified = true;

  await user.save();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Reset code verified successfully" },
  });
});
// reset password controller
export const resetPassword = asyncWrapper(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return next(new AppError("Invalid email"), 404);
  if (!user.passwordResetVerified)
    return next(new AppError("Reset code not verified", 400));

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

  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { token: token } });
});
// logout controller
export const logout = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser.id || req.currentUser._id;
  const user = await User.findById(userId);
  if (!user)
    return next(new AppError("User not found", 404, httpStatusText.ERROR));
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  // Clear tokens from cookies (optional but recommended if you use cookies)
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
// refresh access token controller
export const refreshAccessToken = asyncWrapper(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return next(
      new AppError("Refresh token required", 400, httpStatusText.FAIL)
    );
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    //generate new access token
    const newAccessToken = generateJwt(
      {
        id: decoded.id || decoded._id,
        email: decoded.email,
      },
      process.env.JWT_SECRET_KEY,
      "15m"
    );
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { accessToken: newAccessToken },
    });
  } catch (err) {
    return next(
      new AppError("Invalid or expired refresh token", 401, httpStatusText.FAIL)
    );
  }
});
