import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import httpStatusText from "../utils/httpStatusText.js";
import { AppError } from "../utils/appError.js";

const calcTotalPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalPrice = totalPrice;
};

// Add to cart service
export const addToCartService = async (currentUser, productId) => {
  // Get product that will added
  const product = await Product.findById(productId);
  if (!product)
    throw new AppError("Product not found", 404, httpStatusText.FAIL);
  // Get cart of user  that product will added to
  let cart = await Cart.findOne({ user: currentUser._id });
  if (!cart) {
    //create cart for user
    cart = new Cart({
      user: currentUser._id,
      cartItems: [{ product: productId, price: product.price, quantity: 1 }],
    });
  } else {
    // Check if product is exist in cart
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );
    // Update quantity
    if (productIndex > -1) {
      const item = cart.cartItems[productIndex];
      item.quantity += 1;
    } else {
      // Push new item
      cart.cartItems.push({
        product: productId,
        price: product.price,
        quantity: 1,
      });
    }
  }

  calcTotalPrice(cart);
  await cart.save();

  return cart;
};

// Get user cart service
export const getLoggedUserCartService = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError(
      "cart not found for this user",
      404,
      httpStatusText.FAIL
    );
  }
  return cart;
};

// Update cart item quantity service
export const updateCartItemQuantityService = async (
  userId,
  itemId,
  quantity
) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new AppError("Cart not found", 404, httpStatusText.FAIL);
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1)
    throw new AppError("Item not found", 404, httpStatusText.FAIL);
  const item = cart.cartItems[itemIndex];
  item.quantity = quantity;
  calcTotalPrice(cart);

  await cart.save();
  return cart;
};

// Remove specific cart item service
export const removeSpecificCartItemService = async (userId, itemId) => {
  // Get specific item
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      $pull: { cartItems: { _id: itemId } },
    },
    { new: true }
  );
  if (!cart) throw new AppError("Cart not found", 404, httpStatusText.FAIL);

  calcTotalPrice(cart);
  await cart.save();
  return cart;
};

// Clear cart service
export const clearCartService = async (userId) => {
  const cart = await Cart.findOneAndDelete({ user: userId });
  if (!cart) throw new AppError("Cart not found", 404, httpStatusText.FAIL);
};
