import express from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  updateProfile,
  verifyResetCode,
  deleteAccount,
  changePassword,
  refreshAccessToken,
  logout,
} from "../controllers/auth.controller.js";
import verifyToken from "../../../middlewares/verifyToken.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").post(refreshAccessToken);

router.route("/updateProfile").patch(verifyToken, updateProfile);
router.route("/logout").post(verifyToken, logout);
router.route("/deleteAccount").delete(verifyToken, deleteAccount);

router.route("/changePassword").patch(verifyToken, changePassword);
router.route("/forgotPassword").post(forgotPassword);
router.route("/verifyResetCode").post(verifyResetCode);
router.route("/resetPassword").put(resetPassword);

export default router;
