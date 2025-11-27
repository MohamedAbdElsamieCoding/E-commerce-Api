import express from "express";
import {
  deleteUser,
  getAllUsers,
  getProfile,
  updateUser,
} from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

//admin routes
router.route("/").get(verifyToken, allowedTo(userRoles.ADMIN), getAllUsers);
router
  .route("/:id")
  .put(
    verifyToken,
    allowedTo(userRoles.ADMIN),
    upload.single("file"),
    updateUser
  )
  .delete(verifyToken, allowedTo(userRoles.ADMIN), deleteUser);

// user routes
router.route("/me").get(verifyToken, getProfile);

export default router;
