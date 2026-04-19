import { Schema, model } from "mongoose";

const recipeCommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true, trim: true, maxlength: 100 },
    avatarUrl: { type: String, default: "", maxlength: 500 },
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
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 100 },
    imageUrl: { type: String, default: "", maxlength: 500 },
    description: { type: String, default: "", maxlength: 500 },
    ingredients: [{ type: String, required: true, maxlength: 200 }],
    instructions: [{ type: String, required: true, maxlength: 2000 }],
    prepTimeMinutes: { type: Number, min: 0 },
    cookTimeMinutes: { type: Number, min: 0 },
    servings: { type: Number, min: 1 },
    cuisine: { type: String, default: "", maxlength: 40 },
    isPublic: { type: Boolean, default: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comments: { type: [recipeCommentSchema], default: [] },
    ratings: { type: [recipeRatingSchema], default: [] },
  },
  { timestamps: true }
);

export const recipeModel = model("Recipe", recipeSchema);
