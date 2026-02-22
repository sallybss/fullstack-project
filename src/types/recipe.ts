
export type RecipeCategory = 'Desserts' | 'Meat' | 'Vegan' | 'Vegetarian'
//Defines the fields a recipe must have
export interface Recipe {
  id: string
  baseId: string
  title: string
  category: RecipeCategory
  timeMinutes: number
  rating: number
  ratingCount: number
  imageUrl: string
  saved: boolean
  createdAt: number
}