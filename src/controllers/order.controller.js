import httpStatusText from "../utils/httpStatusText.js";
import { AppError } from "../utils/appError.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import Order from "../models/order.model.js";
import cacheService from "../services/cache.service.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import {
  createOrderService,
  getAllOrdersService,
  getSpecificOrderService,
} from "../services/order.service.js";

// Create order controller
export const createOrder = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const { cartId, shippingAddress } = req.body;
  const order = await createOrderService(userId, cartId, shippingAddress);
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { order },
  });
});

// Get all orders controller
export const getAllOrders = asyncWrapper(async (req, res, next) => {
  const { userId } = req.params;
  const orders = await getAllOrdersService(userId);

  res.status(200).json({ status: httpStatusText.SUCCESS, data: { orders } });
});

// Get specific order controller
export const getSpecificOrder = asyncWrapper(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await getSpecificOrderService(orderId);
  res.status(200).json({ status: httpStatusText.SUCCESS, data: { order } });
});
