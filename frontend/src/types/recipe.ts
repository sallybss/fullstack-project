
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
  
  servings?: number
  description?: string
  author?: RecipeAuthor
  ingredients?: string[]
  instructions?: string[]
}

export type RecipeAuthor = {
  name: string
  email: string
  initials: string
}
