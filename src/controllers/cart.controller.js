import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import httpStatusText from "../utils/httpStatusText.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import { AppError } from "../utils/appError.js";

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalPrice = totalPrice;
};

// Add to cart controller
export const addToCart = asyncWrapper(async (req, res, next) => {
  // Get product that will added
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product)
    return next(new AppError("Product not found", 404, httpStatusText.FAIL));
  // Get cart of user  that product will added to
  const user = req.currentUser._id;
  let cart = await Cart.findOne({ user: user });
  if (!cart) {
    //create cart for user
    cart = new Cart({
      user: req.currentUser._id,
      cartItems: [{ product: productId, price: product.price }],
    });
  } else {
    // Check if product is exist in cart
    const poductIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );
    // Update quantity
    if (poductIndex > -1) {
      const item = cart.cartItems[poductIndex];
      item.quantity += 1;
    } else {
      // Push new item
      cart.cartItems.push({
        product: productId,
        price: product.price,
      });
    }
  }

  calcTotalPrice(cart);
  await cart.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Product added to cart",
    data: { cart },
  });
});

// Get user cart controller
export const getLoggedUserCart = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser._id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(
      new AppError("cart not found for this user", 404, httpStatusText.FAIL)
    );
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { cart },
  });
});

// Update cart item quantity controller
export const updateCartItemQuantity = asyncWrapper(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  // Get cart
  const userId = req.currentUser._id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404, httpStatusText.FAIL));
  }
  // Get product
  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );
  // Update quantity
  if (cartIndex === -1)
    return next(new AppError("Item not found", 404, httpStatusText.FAIL));
  const item = cart.cartItems[itemIndex];
  item.quantity = quantity;
  calcTotalPrice(cart);
  // Save cart
  await cart.save();
  // Return response
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { cart } });
});

// Remove specific cart item controller
export const removeSpecificCartItem = asyncWrapper(async (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.currentUser._id;
  // Get specific item
  const cart = await Cart.findOneAndUpdate(
    { user: req.currentUser._id },
    {
      $pull: { cartItems: { _id: itemId } },
    },
    { new: true }
  );
  if (!cart)
    return next(new AppError("Cart not found", 404, httpStatusText.FAIL));

  calcTotalPrice(cart);
  await cart.save();

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { cart } });
});

// Clear cart controller
export const clearCart = asyncWrapper(async (req, res, next) => {
  const userId = req.currentUser._id;
  const cart = await Cart.findOneAndDelete({ user: userId });
  if (!cart)
    return next(new AppError("Cart not found", 404, httpStatusText.FAIL));
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      message: "Cart cleared successfully",
    },
  });
});
