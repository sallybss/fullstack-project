import type { IUserPublicProfile } from "./user";
import type { Document } from "mongoose";

export interface IRecipeComment {
  _id: string;
  user: IUserPublicProfile["_id"];
  username: string;
  avatarUrl?: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecipe extends Document {
  title: string;
  imageUrl?: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  cuisine?: string;
  isPublic: boolean;
  owner: IUserPublicProfile["_id"];
  comments: IRecipeComment[];
}
