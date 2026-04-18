export type RecipeComment = {
  _id: string;
  user: string;
  username: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Recipe = {
  _id: string;
  title: string;
  imageUrl?: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: string;
  mealType?: "breakfast" | "lunch" | "dinner";
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
  ratingSummary?: {
    average: number;
    count: number;
  };
  comments?: RecipeComment[];
  saved?: boolean;
  
  owner?: {
    _id: string;
    username: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export type NewRecipe = Omit<
  Recipe,
  "_id" | "createdAt" | "updatedAt" | "ratingSummary" | "saved"
> & {
  imageFile?: File | null;
};
