import dotenvFlow from "dotenv-flow";
import mongoose, { type Types } from "mongoose";
import { connect, disconnect } from "../repository/database";
import { recipeModel } from "../models/recipeModel";
import { userModel } from "../models/userModel";

dotenvFlow.config();

type SeedRecipe = {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  cuisine: "Breakfast" | "Lunch" | "Dinner" | "Dessert";
  imageUrl: string;
};

const seedRecipes: SeedRecipe[] = [
  {
    title: "Berry Yogurt Parfait",
    description: "Layers of Greek yogurt, berries, and granola for a fresh and bright breakfast.",
    ingredients: [
      "2 cups Greek yogurt",
      "1 cup strawberries",
      "1 cup blueberries",
      "1 cup granola",
      "2 tbsp honey",
      "Fresh mint leaves",
    ],
    instructions: [
      "Slice the strawberries and rinse the blueberries.",
      "Spoon yogurt into serving glasses.",
      "Add berries and granola in alternating layers.",
      "Drizzle honey on top and finish with mint leaves.",
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    servings: 2,
    cuisine: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Avocado Toast with Poached Egg",
    description: "Creamy avocado, chili flakes, and a silky poached egg on toasted sourdough.",
    ingredients: [
      "2 slices sourdough bread",
      "1 ripe avocado",
      "2 eggs",
      "1 tbsp lemon juice",
      "Chili flakes",
      "Sea salt",
      "Black pepper",
    ],
    instructions: [
      "Toast the sourdough until crisp and golden.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Poach the eggs in gently simmering water.",
      "Spread avocado on toast, top with eggs, and finish with chili flakes.",
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 2,
    cuisine: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Banana Pancake Stack",
    description: "Fluffy banana pancakes finished with maple syrup and sliced fruit.",
    ingredients: [
      "1 1/2 cups flour",
      "2 tbsp sugar",
      "1 tbsp baking powder",
      "1 banana",
      "1 egg",
      "1 1/4 cups milk",
      "2 tbsp melted butter",
      "Maple syrup",
    ],
    instructions: [
      "Whisk flour, sugar, and baking powder in a bowl.",
      "Mash the banana and mix with egg, milk, and melted butter.",
      "Fold the wet mixture into the dry ingredients.",
      "Cook pancakes on a buttered skillet until golden on both sides.",
      "Serve stacked with maple syrup.",
    ],
    prepTimeMinutes: 12,
    cookTimeMinutes: 15,
    servings: 4,
    cuisine: "Breakfast",
    imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Chicken Caesar Wrap",
    description: "Grilled chicken, romaine, parmesan, and Caesar dressing wrapped for an easy lunch.",
    ingredients: [
      "2 flour tortillas",
      "2 grilled chicken breasts",
      "2 cups romaine lettuce",
      "1/4 cup parmesan",
      "3 tbsp Caesar dressing",
      "Black pepper",
    ],
    instructions: [
      "Slice the grilled chicken into strips.",
      "Toss romaine with Caesar dressing and parmesan.",
      "Layer the chicken and salad over tortillas.",
      "Roll tightly, slice in half, and serve.",
    ],
    prepTimeMinutes: 12,
    cookTimeMinutes: 5,
    servings: 2,
    cuisine: "Lunch",
    imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Mediterranean Grain Bowl",
    description: "A colorful bowl with quinoa, roasted vegetables, cucumber, feta, and lemon dressing.",
    ingredients: [
      "2 cups cooked quinoa",
      "1 zucchini",
      "1 red bell pepper",
      "1 cup cherry tomatoes",
      "1 cucumber",
      "1/2 cup feta cheese",
      "2 tbsp olive oil",
      "1 lemon",
    ],
    instructions: [
      "Roast chopped zucchini and bell pepper until tender.",
      "Arrange quinoa in bowls with roasted vegetables, tomatoes, and cucumber.",
      "Top with feta.",
      "Whisk olive oil with lemon juice and drizzle over the bowls.",
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    cuisine: "Lunch",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Tomato Basil Panini",
    description: "Crisp toasted bread filled with mozzarella, tomato, basil, and pesto.",
    ingredients: [
      "4 slices ciabatta",
      "2 tomatoes",
      "150 g mozzarella",
      "Fresh basil leaves",
      "2 tbsp pesto",
      "1 tbsp olive oil",
    ],
    instructions: [
      "Spread pesto over the bread slices.",
      "Layer mozzarella, tomato slices, and basil.",
      "Brush the outside lightly with olive oil.",
      "Press in a panini maker until crisp and melted.",
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 8,
    servings: 2,
    cuisine: "Lunch",
    imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Creamy Tuscan Chicken Pasta",
    description: "A rich and cozy pasta with seared chicken, garlic, spinach, and parmesan cream sauce.",
    ingredients: [
      "2 chicken breasts",
      "250 g pasta",
      "3 garlic cloves",
      "1 cup heavy cream",
      "1/2 cup parmesan",
      "2 cups spinach",
      "1 tbsp olive oil",
      "Salt and black pepper",
    ],
    instructions: [
      "Boil the pasta until al dente.",
      "Season and sear the chicken until golden and cooked through.",
      "Saute garlic in olive oil.",
      "Add cream and parmesan, then simmer until smooth.",
      "Stir in spinach until wilted.",
      "Slice the chicken and toss everything with the pasta.",
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 20,
    servings: 4,
    cuisine: "Dinner",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Garlic Butter Salmon",
    description: "Pan-seared salmon with lemony garlic butter and herbs.",
    ingredients: [
      "4 salmon fillets",
      "3 tbsp butter",
      "3 garlic cloves",
      "1 lemon",
      "Fresh parsley",
      "Salt",
      "Black pepper",
    ],
    instructions: [
      "Season salmon with salt and pepper.",
      "Sear skin-side down until crisp, then flip.",
      "Add butter, garlic, and lemon slices to the pan.",
      "Spoon the butter over the salmon and finish with parsley.",
    ],
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    cuisine: "Dinner",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Smash Burger with Crispy Potatoes",
    description: "Juicy smashed beef patties with melted cheese and golden roasted potatoes.",
    ingredients: [
      "500 g ground beef",
      "4 burger buns",
      "4 cheddar slices",
      "1 onion",
      "4 potatoes",
      "2 tbsp olive oil",
      "Salt and pepper",
    ],
    instructions: [
      "Roast potato wedges with olive oil, salt, and pepper.",
      "Shape beef into loose balls and smash on a hot griddle.",
      "Season, flip, and melt cheddar on top.",
      "Serve in toasted buns with onions and crispy potatoes.",
    ],
    prepTimeMinutes: 15,
    cookTimeMinutes: 25,
    servings: 4,
    cuisine: "Dinner",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Chocolate Lava Cakes",
    description: "Warm individual chocolate cakes with molten centers.",
    ingredients: [
      "120 g dark chocolate",
      "1/2 cup butter",
      "2 eggs",
      "2 egg yolks",
      "1/4 cup sugar",
      "2 tbsp flour",
      "Cocoa powder",
    ],
    instructions: [
      "Melt chocolate and butter together.",
      "Whisk eggs, yolks, and sugar until pale.",
      "Fold in the melted chocolate and flour.",
      "Bake in greased ramekins until edges are set and centers stay soft.",
    ],
    prepTimeMinutes: 12,
    cookTimeMinutes: 11,
    servings: 4,
    cuisine: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1617305855058-336d24456869?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Strawberry Cheesecake Cups",
    description: "No-bake cheesecake cream layered with crushed biscuits and fresh strawberries.",
    ingredients: [
      "200 g cream cheese",
      "1 cup whipping cream",
      "1/4 cup powdered sugar",
      "1 tsp vanilla extract",
      "1 cup crushed biscuits",
      "1 cup strawberries",
    ],
    instructions: [
      "Whip the cream until soft peaks form.",
      "Beat cream cheese with sugar and vanilla until smooth.",
      "Fold whipped cream into the cream cheese mixture.",
      "Layer biscuits, cheesecake cream, and strawberries in cups.",
      "Chill before serving.",
    ],
    prepTimeMinutes: 20,
    cookTimeMinutes: 0,
    servings: 4,
    cuisine: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Lemon Tart Slices",
    description: "Buttery tart crust filled with smooth lemon cream and finished with zest.",
    ingredients: [
      "1 tart crust",
      "3 lemons",
      "3 eggs",
      "3/4 cup sugar",
      "1/2 cup butter",
      "Powdered sugar",
    ],
    instructions: [
      "Bake the tart crust until golden and let cool.",
      "Cook lemon juice, zest, eggs, and sugar gently until thickened.",
      "Whisk in butter until glossy.",
      "Pour into the crust and chill until set.",
      "Slice and dust with powdered sugar.",
    ],
    prepTimeMinutes: 18,
    cookTimeMinutes: 22,
    servings: 8,
    cuisine: "Dessert",
    imageUrl: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=1200&q=80",
  },
];

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

async function resolveOwnerId(): Promise<Types.ObjectId> {
  const ownerEmail = readArg("owner-email");
  const ownerUsername = readArg("owner-username");

  const query = ownerEmail
    ? { email: ownerEmail.toLowerCase() }
    : ownerUsername
      ? { username: ownerUsername }
      : { status: "active" };

  const owner = await userModel.findOne(query).sort({ createdAt: 1 }).select("_id username email");

  if (!owner?._id) {
    throw new Error(
      "No owner user found. Create a user first, or run with --owner-email=<email> or --owner-username=<username>.",
    );
  }

  console.log(`Using recipe owner: ${owner.username} <${owner.email}>`);
  return owner._id as Types.ObjectId;
}

async function seed(): Promise<void> {
  await connect();

  const ownerId = await resolveOwnerId();

  const operations = seedRecipes.map((recipe) => ({
    updateOne: {
      filter: { owner: ownerId, title: recipe.title },
      update: {
        $set: {
          ...recipe,
          isPublic: true,
          owner: ownerId,
        },
      },
      upsert: true,
    },
  }));

  const result = await recipeModel.bulkWrite(operations);
  const totalRecipes = await recipeModel.countDocuments({ owner: ownerId });

  console.log(`Seeded ${seedRecipes.length} recipes.`);
  console.log(
    `Inserted: ${result.upsertedCount}, updated: ${result.modifiedCount}, total recipes for owner: ${totalRecipes}.`,
  );
}

void (async () => {
  try {
    await seed();
  } catch (error) {
    console.error("Recipe seed failed:", error);
    process.exitCode = 1;
  } finally {
    await disconnect();
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
})();
