//Here are fake data until the API is ready
import type { Recipe } from '../types/recipe'

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    baseId: '1',
    title: 'Herb-Crusted Sea Bass',
    category: 'Desserts',
    timeMinutes: 30,
    rating: 4.5,
    ratingCount: 18,
    imageUrl: 'https://picsum.photos/seed/food1/600/600',
    saved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,

    author: { name: 'Jane Doe', email: 'john@example.com', initials: 'JD' },
    servings: 2,
    description: 'Delicate sea bass fillet with a fragrant herb crust...',
    ingredients: ['Sea bass fillets', 'Breadcrumbs', 'Herbs', 'Butter', 'Lemon'],
    instructions: [
      'Preheat oven to 200°C. Pat fish dry and season.',
      'Blend herbs with breadcrumbs and press onto fillets.',
      'Sear fillets skin-side down for 3 minutes.',
      'Transfer to oven and bake for 8–10 minutes.',
    ],
  },
  {
    id: '2',
    baseId: '2',
    title: 'Recipe title',
    category: 'Desserts',
    timeMinutes: 30,
    rating: 4.0,
    ratingCount: 18,
    imageUrl: 'https://picsum.photos/seed/food2/600/600',
    saved: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,

    author: { name: 'Jane Doe', email: 'john@example.com', initials: 'JD' },
    servings: 4,
    description: 'Short description...',
    ingredients: ['Ingredient 1', 'Ingredient 2'],
    instructions: ['Step 1', 'Step 2'],
  },
]