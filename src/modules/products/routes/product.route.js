import express from "express";
import {
  createProduct,
  getAllProducts,
} from "../controllers/product.controller.js";
import verifyToken from "../../../middlewares/verifyToken.js";
import allowedTo from "../../../middlewares/allowedTo.js";
import { userRoles } from "../../../utils/userRoles.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(verifyToken, allowedTo(userRoles.ADMIN), createProduct);

export default router;
