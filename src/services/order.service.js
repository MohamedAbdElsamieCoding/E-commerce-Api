import httpStatusText from "../utils/httpStatusText.js";
import { AppError } from "../utils/appError.js";
import Order from "../models/order.model.js";
import cacheService from "../services/cache.service.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

// Create order service
export const createOrderService = async (userId, cartId, shippingAddress) => {
  const cart = await Cart.findById(cartId);
  if (!cart) throw new AppError("Cart not found", 404, httpStatusText.FAIL);
  const totalOrderPrice = cart.totalPrice;
  const order = await Order.create({
    user: userId,
    cartItems: cart.cartItems,
    totalOrderPrice,
    shippingAddress,
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption);

    // 5. Clear Cart
    await Cart.findByIdAndDelete(cartId);
  }

  const cacheKey = `user:${userId}:orders`;
  await cacheService.del(cacheKey);

  return order;
};

// Get all orders service
export const getAllOrdersService = async (userId) => {
  // Get cached orders
  const cacheKey = `user:${userId}:orders`;
  const cachedOrders = await cacheService.get(cacheKey);
  if (cachedOrders) return cachedOrders;

  // Get all orders
  const orders = await Order.find({ user: userId });
  if (!orders || orders.length === 0)
    throw new AppError("No orders found", 404, httpStatusText.FAIL);

  await cacheService.set(cacheKey, orders);

  return orders;
};

// Get specific order service
export const getSpecificOrderService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError("Order not found", 404, httpStatusText.FAIL);
  return order;
};
