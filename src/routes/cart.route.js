import express from "express";
import {
  addToCart,
  getLoggedUserCart,
  updateCartItemQuantity,
  removeSpecificCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.route("/").get(getLoggedUserCart).post(addToCart).delete(clearCart);

router
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeSpecificCartItem);

export default router;
