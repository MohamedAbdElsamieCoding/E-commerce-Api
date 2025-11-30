import mongoose from "mongoose";
import { paymentTypes } from "../utils/paymentTypes.js";
import { orderStatus } from "../utils/orderStatus.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cartItems: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: 1,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    totlaOrderPrice: {
      type: Number,
      default: 0,
    },
    paymentMethodType: {
      type: String,
      enum: [paymentTypes.CARD, paymentTypes.CASH],
      default: paymentTypes.CASH,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    status: {
      type: String,
      enum: [
        orderStatus.PENDING,
        orderStatus.PROCCESSING,
        orderStatus.SHIPPED,
        orderStatus.DELIVERED,
        orderStatus.CANCELLED,
      ],
      default: orderStatus.PENDING,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
