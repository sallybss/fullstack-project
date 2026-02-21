export type RecipeCategory = 'Desserts' | 'Meat' | 'Vegan' | 'Vegetarian'

export interface Recipe {
  id: string
  title: string
  category: RecipeCategory
  timeMinutes: number
  rating: number
  ratingCount: number
  imageUrl: string
  saved: boolean
  createdAt: number
}