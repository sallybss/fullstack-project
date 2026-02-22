//Here are fake data until the API is ready

import type { Recipe } from '../types/recipe'

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    baseId: '1',
    title: 'Recipe title',
    category: 'Desserts',
    timeMinutes: 30,
    rating: 4.5,
    ratingCount: 18,
    imageUrl: 'https://picsum.photos/seed/food1/600/600',
    saved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
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
  },
]