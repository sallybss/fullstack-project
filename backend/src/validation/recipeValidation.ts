import Joi from "joi";
import { httpUrlSchema, validateOptions } from "./commonValidation";

const RECIPE_TITLE_MAX_LENGTH = 100;
const RECIPE_DESCRIPTION_MAX_LENGTH = 500;
const RECIPE_IMAGE_URL_MAX_LENGTH = 500;
const RECIPE_CUISINE_MAX_LENGTH = 40;
const RECIPE_INGREDIENT_MAX_LENGTH = 200;
const RECIPE_STEP_MAX_LENGTH = 2000;
const COMMENT_MAX_LENGTH = 500;

function parseStringArray(value: unknown, helpers: Joi.CustomHelpers): string[] {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value !== "string") {
    return helpers.error("array.base") as never;
  }

  const trimmed = value.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      return helpers.error("array.base") as never;
    }
  }

  return trimmed.split(",").map((entry) => entry.trim()).filter(Boolean);
}

const stringListSchema = (maxLength: number) =>
  Joi.any()
    .custom(parseStringArray)
    .custom((value: string[], helpers) => {
      if (value.length < 1) {
        return helpers.error("array.min", { limit: 1 });
      }
      if (value.some((entry) => entry.length > maxLength)) {
        return helpers.error("string.max", { limit: maxLength });
      }
      return value;
    })
    .messages({
      "array.base": "{{#label}} must be a list of text values",
      "array.min": "{{#label}} must contain at least {{#limit}} item",
      "string.max": "{{#label}} items must be at most {{#limit}} characters",
    });

const recipeFields = {
  title: Joi.string().trim().min(1).max(RECIPE_TITLE_MAX_LENGTH),
  description: Joi.string().trim().min(1).max(RECIPE_DESCRIPTION_MAX_LENGTH),
  ingredients: stringListSchema(RECIPE_INGREDIENT_MAX_LENGTH),
  instructions: stringListSchema(RECIPE_STEP_MAX_LENGTH),
  cuisine: Joi.string().trim().min(1).max(RECIPE_CUISINE_MAX_LENGTH),
  imageUrl: httpUrlSchema(RECIPE_IMAGE_URL_MAX_LENGTH),
  prepTimeMinutes: Joi.number().min(0),
  cookTimeMinutes: Joi.number().min(0),
  servings: Joi.number().min(1),
  isPublic: Joi.boolean(),
};

const createRecipeSchema = Joi.object({
  ...recipeFields,
  title: recipeFields.title.required(),
  description: recipeFields.description.required(),
  ingredients: recipeFields.ingredients.required(),
  instructions: recipeFields.instructions.required(),
  cuisine: recipeFields.cuisine.required(),
});

const updateRecipeSchema = Joi.object(recipeFields).min(1);

const commentSchema = Joi.object({
  text: Joi.string().trim().min(1).max(COMMENT_MAX_LENGTH).required(),
});

const ratingSchema = Joi.object({
  value: Joi.number().integer().min(1).max(5).required(),
});

export function validateCreateRecipe(data: unknown) {
  return createRecipeSchema.validate(data, validateOptions);
}

export function validateUpdateRecipe(data: unknown) {
  return updateRecipeSchema.validate(data, validateOptions);
}

export function validateRecipeComment(data: unknown) {
  return commentSchema.validate(data, validateOptions);
}

export function validateRecipeRating(data: unknown) {
  return ratingSchema.validate(data, validateOptions);
}
