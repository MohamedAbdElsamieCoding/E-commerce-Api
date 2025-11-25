import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
} from "../controllers/category.controller.js";
import allowedTo from "../../../middlewares/allowedTo.js";
import verifyToken from "../../../middlewares/verifyToken.js";
import { userRoles } from "../../../utils/userRoles.js";

const router = express.Router();

// Admin category routes
router.route("/").post(verifyToken, allowedTo(userRoles.ADMIN), createCategory);
router
  .route("/:categoryId")
  .put(verifyToken, allowedTo(userRoles.ADMIN), updateCategory)
  .delete(verifyToken, allowedTo(userRoles.ADMIN), deleteCategory);

// User category routes
router.route("/").get(getAllCategories);
router.route("/:categoryId").get(getCategoryById);

export default router;
