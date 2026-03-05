import { Schema, model } from "mongoose";

const recipeCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 500 },
  },
  { timestamps: true }
);

const recipeRatingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

const recipeSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    description: { type: String, default: "" },
    ingredients: [{ type: String, required: true }],
    instructions: [{ type: String, required: true }],
    prepTimeMinutes: { type: Number, min: 0 },
    cookTimeMinutes: { type: Number, min: 0 },
    servings: { type: Number, min: 1 },
    cuisine: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: { type: [recipeCommentSchema], default: [] },
    ratings: { type: [recipeRatingSchema], default: [] },
  },
  { timestamps: true }
);

export const recipeModel = model("Recipe", recipeSchema);
