import { Router, type Request, type Response } from "express";
import recipeRoutes from "./routes/recipeRoutes";
import authRoutes from "./routes/authRoutes";

const router: Router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: API status
 *     description: Quick check that the Recipe Sharing API is alive.
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             example:
 *               message: Welcome to the recipe-sharing API
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the recipe-sharing API" });
});

/**
 * AUTH
 * We mount /auth routes here.
 * Actual endpoints live inside authRoutes (ex: /auth/register, /auth/login).
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create an account
 *     description: Register a new user so you can use protected endpoints (create/update/delete).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/User"
 *           example:
 *             username: "Sali Bseso"
 *             email: "sali@test.com"
 *             password: "123456"
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: "Validation error (for example: email already exists)"
 */
router.use("/auth", authRoutes);

/**
 * RECIPES
 * We mount /recipes routes here.
 * Actual endpoints live inside recipeRoutes.
 */

/**
 * @swagger
 * /recipes:
 *   get:
 *     tags: [Recipes]
 *     summary: Get all recipes
 *     description: Returns all recipes in the collection.
 *     responses:
 *       200:
 *         description: List of recipes
 *
 *   post:
 *     tags: [Recipes]
 *     summary: Add a recipe
 *     description: Add a new recipe (requires login).
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Recipe"
 *           example:
 *             title: "Pasta Carbonara"
 *             description: "Classic creamy pasta recipe"
 *             ingredients: ["Pasta", "Eggs", "Parmesan", "Pancetta"]
 *             instructions: ["Boil pasta", "Cook pancetta", "Mix all together"]
 *             prepTimeMinutes: 10
 *             cookTimeMinutes: 15
 *             servings: 2
 *             cuisine: "Italian"
 *             isPublic: true
 *             owner: "test-user-1"
 *     responses:
 *       201:
 *         description: Recipe created
 *       401:
 *         description: Missing/invalid token
 */
router.use("/recipes", recipeRoutes);

/**
 * @swagger
 * /recipes/{id}:
 *   get:
 *     tags: [Recipes]
 *     summary: Get one recipe
 *     description: Fetch a single recipe by its MongoDB id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     responses:
 *       200:
 *         description: Recipe found
 *       404:
 *         description: Recipe not found
 *
 *   put:
 *     tags: [Recipes]
 *     summary: Update a recipe
 *     description: Update an existing recipe (requires login).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Recipe"
 *     responses:
 *       200:
 *         description: Recipe updated
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Recipe not found
 *
 *   delete:
 *     tags: [Recipes]
 *     summary: Delete a recipe
 *     description: Remove a recipe from the collection (requires login).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     responses:
 *       200:
 *         description: Recipe deleted
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes/query/{field}/{value}:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Filter recipes
 *     description: Filter by a field/value pair.
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *         description: Field to filter by (title, cuisine, owner, etc.)
 *       - in: path
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Value to match (case-insensitive).
 *     responses:
 *       200:
 *         description: Matching recipes
 */

/**
 * FAVORITES
 * These routes must exist in recipeRoutes, otherwise swagger will show them but they won't work.
 */

/**
 * @swagger
 * /recipes/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Get favorite recipes
 *     description: Returns full recipe objects that the logged-in user marked as favorite.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Favorite recipes
 *       401:
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /recipes/favorites/ids:
 *   get:
 *     tags: [Favorites]
 *     summary: Get favorite ids
 *     description: Returns only recipe ids for the logged-in user's favorites.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Favorite recipe ids
 *       401:
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /recipes/{id}/favorite:
 *   post:
 *     tags: [Favorites]
 *     summary: Add to favorites
 *     description: Mark a recipe as favorite for the logged-in user.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     responses:
 *       200:
 *         description: Updated favorites list
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Recipe not found
 *
 *   delete:
 *     tags: [Favorites]
 *     summary: Remove from favorites
 *     description: Unfavorite a recipe for the logged-in user.
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     responses:
 *       200:
 *         description: Updated favorites list
 *       401:
 *         description: Missing/invalid token
 */

export default router;
