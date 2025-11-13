import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import { Product } from "../models/product.model.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import { userRoles } from "../../../utils/userRoles.js";
import { productStatus } from "../../../utils/productStatus.js";
import { AppError } from "../../../utils/appError.js";

// Create product by only seller
export const createProduct = asyncWrapper(async (req, res, next) => {
  const { name, description, price, category, stock, images } = req.body;
  if ((!name, !description, !price, !category, !stock, !images))
    return next(new AppError("Fields are required", 400, httpStatusText.ERROR));
  // Adding fields into models
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images,
    seller: req.currentUser.id,
  });

  res.status(201).json({ status: httpStatusText.SUCCESS, data: product });
});

export const requestProductEdit = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const updates = req.body;
  const product = await Product.findById(productId);
  if (!product)
    return next(new AppError("Product not found", 404, httpStatusText.FAIL));
});

// Get all products
export const getAllProducts = asyncWrapper(async (req, res, next) => {
  const products = await Product.find();
  if (!products)
    return next(new AppError("Products not found", 404, httpStatusText.FAIL));

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: products,
  });
});
