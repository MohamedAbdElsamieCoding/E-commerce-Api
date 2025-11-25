import httpStatusText from "../../../utils/httpStatusText.js";
import asyncWrapper from "../../../middlewares/asyncWrapper.js";
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
} from "../services/category.service.js";

// Admin controllers

// Create category controller
export const createCategory = asyncWrapper(async (req, res, next) => {
  const { name, description, parent } = req.body;
  const category = await createCategoryService(name, description, parent);

  res.status(201).json({ status: httpStatusText.SUCCESS, data: category });
});

// Update category controller
export const updateCategory = asyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;
  const updates = req.body;

  const updatedCategory = await updateCategoryService(categoryId, updates);
  res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: updatedCategory });
});

// Delete category controller { soft delete }
export const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;

  await deleteCategoryService(categoryId);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { message: "Category deleted successfully" },
  });
});

// Users controllers

// Get all categories controller
export const getAllCategories = asyncWrapper(async (req, res, next) => {
  const categories = await getAllCategoriesService();

  res.status(200).json({ status: httpStatusText.SUCCESS, data: categories });
});

// Get category by id controller
export const getCategoryById = asyncWrapper(async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await getCategoryByIdService(categoryId);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: category,
  });
});
