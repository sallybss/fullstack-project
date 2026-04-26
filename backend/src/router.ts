import { Router, type Request, type Response } from "express";
import recipeRoutes from "./routes/recipeRoutes";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import profileRoutes from "./routes/profileRoutes";
import contactRoutes from "./routes/contactRoutes";
import siteSettingsRoutes from "./routes/siteSettingsRoutes";
import mealPlanRoutes from "./routes/mealPlanRoutes";

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
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Login and get a JWT token to use with protected endpoints.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "sali@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login success (token returned)
 *       400:
 *         description: Invalid credentials/validation error
 *
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     description: Sends a password reset email if the account exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "sali@test.com"
 *     responses:
 *       200:
 *         description: Reset request accepted
 *       400:
 *         description: Validation error
 *
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with token
 *     description: Resets a password using the token received from the forgot-password flow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset-token"
 *               password:
 *                 type: string
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired reset token
 *
 * /auth/users:
 *   get:
 *     tags: [Auth]
 *     summary: Get all users
 *     description: Returns all users (admin only).
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Admin access required
 *
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: Returns the authenticated user's account details.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Missing/invalid token
 *
 *   delete:
 *     tags: [Auth]
 *     summary: Delete my account
 *     description: Deletes the authenticated user account and related content.
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 *       401:
 *         description: Missing/invalid token
 *
 * /auth/me/password:
 *   put:
 *     tags: [Auth]
 *     summary: Change my password
 *     description: Updates the authenticated user's password.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid token
 *
 * /auth/users/{userId}/status:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user status
 *     description: Block or unblock a user account (admin only).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, blocked]
 *     responses:
 *       200:
 *         description: User status updated
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *
 * /auth/users/{userId}:
 *   delete:
 *     tags: [Auth]
 *     summary: Delete a user
 *     description: Deletes a user account and their related content (admin only).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.use("/auth", authRoutes);

/**
 * @swagger
 * /chat:
 *   post:
 *     tags: [AI Chat]
 *     summary: Send a message to Cooking Genie
 *     description: Sends a user message to the AI recipe assistant powered by OpenAI `gpt-5-nano`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "What can I use instead of eggs in pancakes?"
 *     responses:
 *       200:
 *         description: Assistant reply returned
 *         content:
 *           application/json:
 *             example:
 *               error: null
 *               data:
 *                 reply: "You can use mashed banana, applesauce, or a flax egg in pancakes."
 *       400:
 *         description: Validation error
 *       500:
 *         description: OpenAI API key is not configured or the AI request failed
 *       502:
 *         description: The assistant returned an empty response
 */
router.use("/chat", chatRoutes);
router.use("/profiles", profileRoutes);
router.use("/settings", siteSettingsRoutes);
router.use("/meal-plans", mealPlanRoutes);

/**
 * @swagger
 * /meal-plans:
 *   get:
 *     tags: [Meal Plans]
 *     summary: Get my meal plans
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of the authenticated user's meal plans
 *       401:
 *         description: Missing/invalid token
 *
 *   post:
 *     tags: [Meal Plans]
 *     summary: Create a meal plan
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MealPlanInput"
 *     responses:
 *       201:
 *         description: Meal plan created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid token
 *
 * /meal-plans/{id}:
 *   get:
 *     tags: [Meal Plans]
 *     summary: Get one meal plan
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan id
 *     responses:
 *       200:
 *         description: Meal plan found
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Meal plan not found
 *
 *   put:
 *     tags: [Meal Plans]
 *     summary: Update a meal plan
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MealPlanInput"
 *     responses:
 *       200:
 *         description: Meal plan updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Meal plan not found
 *
 *   delete:
 *     tags: [Meal Plans]
 *     summary: Delete a meal plan
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal plan id
 *     responses:
 *       200:
 *         description: Meal plan deleted
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Meal plan not found
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     tags: [Contact]
 *     summary: Send a contact form message
 *     description: Sends a contact message to the configured FoodFinder Gmail inbox.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *               subject:
 *                 type: string
 *                 example: "Recipe question"
 *               message:
 *                 type: string
 *                 example: "Hi, I would like help with posting my recipe."
 *     responses:
 *       200:
 *         description: Contact message sent
 *       400:
 *         description: Validation error
 *       500:
 *         description: Email transport not configured or send failure
 */
router.use("/contact", contactRoutes);

/**
 * @swagger
 * /settings/hero/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get a hero cover setting
 *     description: Returns the configured image URL for a named hero cover key.
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hero setting loaded
 *       400:
 *         description: Missing key
 *   put:
 *     tags: [Settings]
 *     summary: Update a hero cover setting
 *     description: Updates the image URL for a named hero cover key (admin only).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [imageUrl]
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: "https://images.example.com/hero.jpg"
 *     responses:
 *       200:
 *         description: Hero setting updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Admin access required
 *
 * /settings/hero/{key}/upload:
 *   post:
 *     tags: [Settings]
 *     summary: Upload a hero cover image
 *     description: Uploads an image file for a named hero cover key and stores the saved image path (admin only).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cover]
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Hero cover uploaded
 *       400:
 *         description: Missing key or invalid file
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Admin access required
 */

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
 *     description: Add a new recipe (requires login). Photo is optional via imageUrl (or photo alias).
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *               description:
 *                 type: string
 *               ingredients:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *                     description: JSON array string or comma-separated values
 *               instructions:
 *                 oneOf:
 *                   - type: array
 *                     items:
 *                       type: string
 *                   - type: string
 *                     description: JSON array string or comma-separated values
 *               prepTimeMinutes:
 *                 type: number
 *               cookTimeMinutes:
 *                 type: number
 *               servings:
 *                 type: number
 *               cuisine:
 *                 type: string
 *               isPublic:
 *                 type: boolean
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
 * COMMENTS
 * Comment endpoints for recipes.
 */

/**
 * @swagger
 * /recipes/{id}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get comments for a recipe
 *     description: Returns all comments attached to a recipe.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *     responses:
 *       200:
 *         description: Recipe comments
 *       404:
 *         description: Recipe not found
 *
 *   post:
 *     tags: [Comments]
 *     summary: Add comment to recipe
 *     description: Add a new comment to a recipe (requires login).
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
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "This recipe was amazing."
 *     responses:
 *       201:
 *         description: Comment created
 *       400:
 *         description: Invalid comment body
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /recipes/{id}/comments/{commentId}:
 *   put:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update your own comment on a recipe (requires login).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Updated comment text"
 *     responses:
 *       200:
 *         description: Comment updated
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Not allowed to update this comment
 *       404:
 *         description: Recipe or comment not found
 *
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete your own comment from a recipe (requires login).
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipe id
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment id
 *     responses:
 *       200:
 *         description: Comment deleted
 *       401:
 *         description: Missing/invalid token
 *       403:
 *         description: Not allowed to delete this comment
 *       404:
 *         description: Recipe or comment not found
 */

/**
 * FAVORITES
 * These routes must exist in recipeRoutes, otherwise swagger will show them but they won't work.
 */

/**
 * @swagger
 * /recipes/{id}/rating:
 *   post:
 *     tags: [Recipes]
 *     summary: Rate a recipe (1-5)
 *     description: Add or update your rating for a recipe.
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
 *             type: object
 *             required: [value]
 *             properties:
 *               value:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *     responses:
 *       200:
 *         description: Updated rating summary
 *       400:
 *         description: Invalid rating value
 *       401:
 *         description: Missing/invalid token
 *       404:
 *         description: Recipe not found
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

/**
 * PROFILES
 */

/**
 * @swagger
 * /profiles/me:
 *   get:
 *     tags: [Profiles]
 *     summary: Get my profile
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
 *       401:
 *         description: Missing/invalid token
 *
 *   put:
 *     tags: [Profiles]
 *     summary: Update my profile
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProfileUpdateInput"
 *     responses:
 *       200:
 *         description: Updated profile
 *       400:
 *         description: Validation error
 *       401:
 *         description: Missing/invalid token
 *
 * /profiles/me/avatar:
 *   post:
 *     tags: [Profiles]
 *     summary: Upload my avatar
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [avatar]
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated profile with avatar image
 *       400:
 *         description: Invalid file or missing avatar
 *       401:
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /profiles/{userId}:
 *   get:
 *     tags: [Profiles]
 *     summary: Get profile by user id
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       200:
 *         description: Profile data
 *       404:
 *         description: User/profile not found
 */

/**
 * @swagger
 * /profiles/{userId}/follow:
 *   post:
 *     tags: [Profiles]
 *     summary: Follow user profile
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id to follow
 *     responses:
 *       200:
 *         description: Updated current profile
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Missing/invalid token
 *
 *   delete:
 *     tags: [Profiles]
 *     summary: Unfollow user profile
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User id to unfollow
 *     responses:
 *       200:
 *         description: Updated current profile
 *       401:
 *         description: Missing/invalid token
 */

/**
 * @swagger
 * /profiles/{userId}/followers:
 *   get:
 *     tags: [Profiles]
 *     summary: List profile followers
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followers list
 *       404:
 *         description: Profile not found
 *
 * /profiles/{userId}/following:
 *   get:
 *     tags: [Profiles]
 *     summary: List profiles this user follows
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Following list
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /profiles/{userId}/recipes:
 *   get:
 *     tags: [Profiles]
 *     summary: Get all recipes created by a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Author user id
 *     responses:
 *       200:
 *         description: List of authored recipes
 *       400:
 *         description: Invalid user id
 */

/**
 * @swagger
 * /profiles/me/saved:
 *   get:
 *     tags: [Profiles]
 *     summary: Get my saved recipes
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Saved recipes
 *       401:
 *         description: Missing/invalid token
 *
 * /profiles/{userId}/saved:
 *   get:
 *     tags: [Profiles]
 *     summary: Get a user's saved recipes
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved recipes
 *       404:
 *         description: User not found
 */

export default router;
