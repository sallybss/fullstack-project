import type { IUserPublicProfile } from "./user";
import type { Document } from "mongoose";

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
}
