import mongoose from "mongoose";
import { productStatus } from "../../../utils/productStatus.js";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      min: 0,
      default: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        productStatus.APPROVED,
        productStatus.PENDING,
        productStatus.REJECTED,
        productStatus.EDITEDPENDING,
      ],
      default: productStatus.PENDING,
    },
    editedData: {
      type: Object,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.methods.applyEdits = function () {
  if (this.editedData) {
    Object.assign(this, this.editedData);
    this.editedData = null;
  }
};

export const Product = mongoose.model("Product", productSchema);
