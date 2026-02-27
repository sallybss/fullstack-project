import { Schema, model } from "mongoose";

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
  },
  { timestamps: true }
);

export const recipeModel = model("Recipe", recipeSchema);
