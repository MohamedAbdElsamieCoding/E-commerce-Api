import express from "express";
import {
  approveProduct,
  createProduct,
  getAllApprovedProducts,
  getProductById,
  rejectProduct,
  requestProductEdit,
} from "../controllers/product.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import allowedTo from "../middlewares/allowedTo.js";
import { userRoles } from "../utils/userRoles.js";

const router = express.Router();

// Public
router.get("/", getAllApprovedProducts);
router.get("/:productId", getProductById);

// Seller
router.post("/", verifyToken, allowedTo(userRoles.SELLER), createProduct);

router.patch(
  "/edit/:productId",
  verifyToken,
  allowedTo(userRoles.SELLER),
  requestProductEdit
);

// Admin
router.put(
  "/approve/:productId",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  approveProduct
);

router.put(
  "/reject/:productId",
  verifyToken,
  allowedTo(userRoles.ADMIN),
  rejectProduct
);
export default router;
