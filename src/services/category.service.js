import { Category } from "../models/category.model.js";
import { AppError } from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";
import cacheService from "../services/cache.service.js";

// Admin category services

// Service to create a new category
export const createCategoryService = async ({ name, description, parent }) => {
  if (!name)
    throw new AppError("Name field is required", 400, httpStatusText.FAIL);

  const slug = name.toLowerCase().replace(/\s+/g, "-");
  const isActive = true;

  const category = await Category.create({
    name,
    slug,
    description,
    parent: parent || null,
    isActive,
  });

  await cacheService.del("getAllCategories");

  return category;
};

// Service to update an existing category
export const updateCategoryService = async (categoryId, updates) => {
  const category = await Category.findById(categoryId);
  if (!category)
    throw new AppError("Category not found", 404, httpStatusText.FAIL);

  if (!updates || Object.keys(updates).length === 0)
    throw new AppError("There is no updates", 400, httpStatusText.FAIL);
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    updates,
    { new: true, runValidators: true }
  );

  await cacheService.del("getAllCategories");

  return updatedCategory;
};

// Service to delete a category (soft delete)
export const deleteCategoryService = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category)
    throw new AppError("Category not found", 404, httpStatusText.FAIL);

  category.isActive = false;
  await category.save();

  await cacheService.del("getAllCategories");
};

// User category services

// Service to get all active categories
export const getAllCategoriesService = async () => {
  const cacheKey = "getAllCategories";
  const cachedCategories = await cacheService.get(cacheKey);
  if (cachedCategories) return cachedCategories;

  const categories = await Category.find({ isActive: true }).populate(
    "parent",
    "name"
  );
  if (!categories || categories.length === 0)
    throw new AppError("Categories not found", 404, httpStatusText.FAIL);

  await cacheService.set(cacheKey, categories, 1800);

  return categories;
};

// Service to get a category by ID
export const getCategoryByIdService = async (categoryId) => {
  // Check cache
  const cacheKey = `getCategoryById_${categoryId}`;
  const cachedCategory = await cacheService.get(cacheKey);
  if (cachedCategory) return cachedCategory;

  // Query DB with soft delete check
  const category = await Category.findOne({ _id: categoryId, isActive: true });
  if (!category)
    throw new AppError("Category not found", 404, httpStatusText.FAIL);

  await cacheService.set(cacheKey, category, 600);

  return category;
};
