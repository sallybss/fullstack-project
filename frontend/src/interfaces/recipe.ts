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
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
  ratingSummary?: {
    average: number;
    count: number;
  };
}