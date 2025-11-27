import asyncWrapper from "../middlewares/asyncWrapper.js";
import httpStatusText from "../utils/httpStatusText.js";
import {
  approveProductService,
  createProductService,
  getAllApprovedProductsService,
  getProductByIdService,
  rejectProductService,
  requestProductEditService,
} from "../services/product.service.js";

// Create product by only seller
export const createProduct = asyncWrapper(async (req, res, next) => {
  const { currentId } = req.currentUser.id || req.currentUser._id;
  const product = await createProductService(currentId, req.body);
  res.status(201).json({ status: httpStatusText.SUCCESS, data: product });
});

// Request product edit by seller
export const requestProductEdit = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const updates = req.body;

  await requestProductEditService(productId, updates, req.currentUser.id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Edit request sent to admin",
  });
});

// Approved product edit by admin (new or edited)
export const approveProduct = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  await approveProductService(productId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Product approved successfully" },
  });
});

//Rejected product by admin (new or edited)
export const rejectProduct = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;
  const { reason } = req.body;

  await rejectProductService(productId, reason);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Product rejected" },
  });
});

// Get all approved products for public
export const getAllApprovedProducts = asyncWrapper(async (req, res, next) => {
  const products = await getAllApprovedProductsService();
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: products,
  });
});
// Get product by id
export const getProductById = asyncWrapper(async (req, res, next) => {
  const { productId } = req.params;

  const product = await getProductByIdService(productId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: product,
  });
});
