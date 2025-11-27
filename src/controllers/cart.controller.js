import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import {
  addToCartService,
  clearCartService,
  getLoggedUserCartService,
  removeSpecificCartItemService,
  updateCartItemQuantityService,
} from "../services/cart.service.js";

// Add to cart controller
export const addToCart = asyncWrapper(async (req, res, next) => {
  // Get product that will added
  const { productId } = req.body;
  const cart = await addToCartService(req.currentUser, productId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Product added to cart",
    data: { cart },
  });
});

// Get user cart controller
export const getLoggedUserCart = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser._id;
  const cart = await getLoggedUserCartService(userId);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { cart },
  });
});

// Update cart item quantity controller
export const updateCartItemQuantity = asyncWrapper(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.currentUser._id;
  const cart = await updateCartItemQuantityService(userId, itemId, quantity);

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { cart } });
});

// Remove specific cart item controller
export const removeSpecificCartItem = asyncWrapper(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.currentUser._id;
  const cart = await removeSpecificCartItemService(userId, itemId);

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { cart } });
});

// Clear cart controller
export const clearCart = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser._id;
  await clearCartService(userId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Cart cleared successfully",
    },
  });
});
