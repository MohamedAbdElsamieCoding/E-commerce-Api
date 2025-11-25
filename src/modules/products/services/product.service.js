import { Product } from "../models/product.model.js";
import httpStatusText from "../../../utils/httpStatusText.js";
import { productStatus } from "../../../utils/productStatus.js";
import { AppError } from "../../../utils/appError.js";
import cacheService from "../services/cache.service.js";

// Create product by only seller service
export const createProductService = async (currentUserId, productData) => {
  const { name, description, price, category, stock, images } = productData;

  if (!name || !description || !price || !category || !stock || !images)
    throw new AppError("Fields are required", 400, httpStatusText.ERROR);

  // Adding fields into models
  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images,
    seller: currentUserId,
  });

  // Disable cache after adding product
  await cacheService.del("allApprovedProducts");

  return product;
};

// Request product edit by seller service
export const requestProductEditService = async (
  productId,
  updates,
  currentUserId
) => {
  const product = await Product.findById(productId);

  if (!product)
    throw new AppError("Product not found", 404, httpStatusText.FAIL);

  if (product.seller.toString() !== currentUserId.toString())
    throw new AppError("Unauthorized", 403, httpStatusText.FAIL);

  product.editedData = updates;
  product.status = productStatus.PENDING;

  await product.save();
  return true;
};

// Approved product edit by admin (new or edited) service
export const approveProductService = async (productId) => {
  const product = await Product.findById(productId);
  if (!product)
    throw new AppError("product not found", 404, httpStatusText.FAIL);

  // Checking if status of is pending for edit
  if (product.status === productStatus.EDITEDPENDING) product.applyEdits();

  // If product new apply it
  product.status = productStatus.APPROVED;
  product.rejectionReason = null;

  // Disable cache after approval
  await cacheService.del("allApprovedProducts");

  await product.save();

  return true;
};

//Rejected product by admin (new or edited) service
export const rejectProductService = async (productId, reason) => {
  const product = await Product.findById(productId);

  if (!product)
    throw new AppError("product not found", 404, httpStatusText.FAIL);

  product.status = productStatus.REJECTED;
  product.rejectionReason = reason || "No reason provided";

  await product.save();

  return true;
};

// Get all approved products for public service
export const getAllApprovedProductsService = async () => {
  const cacheKey = "allApprovedProducts";
  // Check cache
  const cachedProducts = await cacheService.get(cacheKey);
  if (cachedProducts) return cachedProducts;

  // Query DB
  const products = await Product.find({
    status: productStatus.APPROVED,
  })
    .populate("seller", "firstName lastName email")
    .populate("category", "name");

  if (!products)
    throw new AppError("Products not found", 404, httpStatusText.FAIL);

  // Save to cache for 10m
  await cacheService.set(cacheKey, products, 600);

  return products;
};

// Get product by id service
export const getProductByIdService = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    status: productStatus.APPROVED,
  })
    .populate("seller", "firstName lastName email")
    .populate("category", "name");

  if (!product)
    throw new AppError("Product not found", 404, httpStatusText.FAIL);

  return product;
};
