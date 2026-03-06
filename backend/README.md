# FoodFinder Backend API

TypeScript + Express + MongoDB REST API for auth, profiles, recipes, comments, favorites and ratings.

## What this backend does

- Auth: register, login, token verification
- User profiles: view/update own profile, follow/unfollow, followers/following lists
- Recipes: CRUD, search/filter, image upload, comments, favorites, ratings
- API docs: Swagger UI at `/swagger`

## Tech stack

- Node.js + Express 5
- TypeScript
- MongoDB + Mongoose
- JWT auth
- Multer (recipe image upload)
- Swagger (`swagger-jsdoc` + `swagger-ui-express`)

## Project structure

```txt
src/
  app.ts                    # Express app setup, middleware, CORS, docs
  index.ts                  # Server entrypoint
  router.ts                 # Mounts /auth, /profiles, /recipes under /api
  controllers/              # Request handlers
  routes/                   # Route definitions
  models/                   # Mongoose schemas
  middleware/recipeUpload.ts
  repository/database.ts    # DB connect/disconnect helpers
  util/doc.ts               # Swagger setup
uploads/recipes/            # Uploaded recipe images
```

## Environment variables

Create `.env` in backend root:

```env
PORT=4000
DBHOST=<your-mongodb-connection-string>
TOKEN_SECRET=<your-jwt-secret>
```

Required:

- `DBHOST`: MongoDB URI
- `TOKEN_SECRET`: JWT signing secret
- `PORT`: optional (defaults to `4000`)

## Run locally

```bash
npm install
npm run start-dev
```

Useful scripts:

- `npm run start-dev` -> run with nodemon + ts-node
- `npm run start-dev:once` -> run once with ts-node
- `npm run build` -> compile TypeScript to `dist/`
- `npm start` -> run compiled server (`dist/index.js`)
- `npm run typecheck` -> TypeScript check only

## Base URLs

If running locally on default port:

- API base URL: `http://localhost:4000/api`
- Health check: `http://localhost:4000/`
- Swagger docs: `http://localhost:4000/swagger`
- Uploaded images: `http://localhost:4000/uploads/...`

## Auth for frontend

After login, backend returns:

```json
{
  "error": null,
  "data": {
    "userId": "...",
    "token": "..."
  }
}
```

Send token in either header:

- `Authorization: Bearer <token>`
- `auth-token: <token>`

## CORS (important for frontend)

Currently allowed origins are hardcoded in `src/app.ts`:

- `http://localhost:5173`
- `http://localhost:4000`

If frontend runs on another URL/port, add it to `allowedOrigins`.

## Main endpoints

All routes below are prefixed with `/api`.

### Auth

- `POST /auth/register` -> create account
- `POST /auth/login` -> login, returns JWT
- `GET /auth/users` -> list users (auth required)

### Profiles

- `GET /profiles/me` (auth)
- `PUT /profiles/me` (auth)
- `GET /profiles/me/saved` (auth)
- `GET /profiles/:userId`
- `GET /profiles/:userId/recipes`
- `GET /profiles/:userId/saved`
- `GET /profiles/:userId/followers`
- `GET /profiles/:userId/following`
- `POST /profiles/:userId/follow` (auth)
- `DELETE /profiles/:userId/follow` (auth)

### Recipes

- `GET /recipes` -> list recipes (supports query filters)
- `GET /recipes/query/:field/:value` -> generic field regex query
- `GET /recipes/:id`
- `POST /recipes` (auth) -> create recipe (JSON or multipart)
- `PUT /recipes/:id` (auth)
- `DELETE /recipes/:id` (auth)

Comments:

- `GET /recipes/:id/comments`
- `POST /recipes/:id/comments` (auth)
- `PUT /recipes/:id/comments/:commentId` (auth)
- `DELETE /recipes/:id/comments/:commentId` (auth)

Favorites:

- `GET /recipes/favorites` (auth)
- `GET /recipes/favorites/ids` (auth)
- `POST /recipes/:id/favorite` (auth)
- `DELETE /recipes/:id/favorite` (auth)

Ratings:

- `POST /recipes/:id/rating` (auth) with body `{ "value": 1..5 }`

## Recipe create/update payload

Supported fields:

- `title` (required)
- `description`
- `ingredients` (array OR comma-separated string OR JSON-array string)
- `instructions` (same parsing as ingredients)
- `prepTimeMinutes` (>= 0)
- `cookTimeMinutes` (>= 0)
- `servings` (>= 1)
- `cuisine`
- `isPublic`
- `imageUrl` (http/https URL)

For image upload, use `multipart/form-data` with field name `photo`.

Limits:

- file must be an image MIME type
- max file size: 5 MB

When uploaded, backend stores file in `uploads/recipes` and saves `imageUrl` like `/uploads/recipes/<filename>`.

## Example frontend requests

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sali@test.com","password":"123456"}'
```

Get my profile:

```bash
curl http://localhost:4000/api/profiles/me \
  -H "Authorization: Bearer <token>"
```

Create recipe with photo:

```bash
curl -X POST http://localhost:4000/api/recipes \
  -H "Authorization: Bearer <token>" \
  -F "title=Pasta Carbonara" \
  -F "ingredients=[\"Pasta\",\"Eggs\",\"Parmesan\"]" \
  -F "instructions=[\"Boil pasta\",\"Mix\"]" \
  -F "photo=@/absolute/path/pasta.jpg"
```

## Notes / current behavior

- Server connects/disconnects to MongoDB per request (as implemented in controllers).
- Recipe update/delete routes require auth but currently do not enforce owner-only checks.
- There are no automated tests yet (`npm test` is placeholder).

## Swagger

Open `http://localhost:4000/swagger` for interactive API docs.

