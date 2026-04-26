# FoodFinder

A full-stack recipe platform where users can discover, create and manage recipes. Built with Vue 3 on the frontend and a TypeScript/Express/MongoDB REST API on the backend.

**Live Links**
- Frontend: https://fullstack-project-1-yqzc.onrender.com
- Backend API: https://fullstack-project-gghk.onrender.com
- API Docs (Swagger): https://fullstack-project-gghk.onrender.com/swagger

---

## Features

- **Authentication** — Register, log in and access protected actions via JWT
- **Recipes** — Browse, search, and filter by category (Breakfast, Lunch, Dinner, Dessert)
- **CRUD** — Create, edit and delete your own recipes with image upload support
- **Favorites** — Save and manage a personal collection of recipes
- **Ratings & Comments** — Rate recipes and leave comments
- **User Profiles** — View your recipes, follow other users and explore their saved content
- **Cooking Genie Chatbot** — A floating AI recipe assistant available across the app for meal ideas, substitutions, and quick cooking help

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vue 3, TypeScript, Vite, PrimeVue, Vue Router, SCSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Auth | JWT |
| AI | OpenAI Responses API (`gpt-5-nano`) |
| File Upload | Multer |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Testing | Vitest |

---

## Project Structure

```
fullstack-projectt/
├── frontend/          # Vue 3 app
│   └── src/
│       ├── pages/         # Route-level views
│       ├── components/    # Reusable UI components
│       ├── composables/   # Shared logic
│       ├── services/      # API calls
│       ├── interfaces/    # TypeScript types
│       └── router/        # Vue Router config
│
└── backend/           # Express REST API
    └── src/
        ├── controllers/   # Request handlers
        ├── routes/        # Route definitions
        ├── models/        # Mongoose schemas
        ├── middleware/    # Auth, file upload
        └── util/          # Swagger setup
```

---

## Getting Started

### Prerequisites

- Node.js v22+
- MongoDB instance (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/sallybss/fullstack-project.git
cd fullstack-project
```

### 2. Configure the backend

Create a `.env` file in the `backend/` directory:

```env
PORT=4000
DBHOST=<your-mongodb-connection-string>
TOKEN_SECRET=<your-jwt-secret>
OPENAI_API_KEY=<your-openai-api-key>
```

### 3. Install dependencies and run

**Backend**
```bash
cd backend
npm install
npm run start-dev
```

**Frontend** (in a separate terminal)
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:4000`.

### 4. Configure the AI chatbot

The app includes a global floating chatbot called **Cooking Genie**. It uses OpenAI's `gpt-5-nano` model through the backend, so the API key must stay server-side.

What it does:

- Suggests recipe ideas based on ingredients
- Recommends ingredient substitutions
- Answers simple cooking questions

Implementation notes:

- Frontend widget: available across normal app pages
- Backend endpoint: `POST /api/chat`
- Model: `gpt-5-nano`
- Cost controls: low verbosity, minimal reasoning, limited output tokens

---

## API Overview

All routes are prefixed with `/api`. Full interactive documentation is available at `/swagger`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Log in, returns JWT |

### Recipes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/recipes` | | List all recipes (supports filters) |
| GET | `/recipes/:id` | | Get a single recipe |
| POST | `/recipes` | ✓ | Create a recipe |
| PUT | `/recipes/:id` | ✓ | Update a recipe |
| DELETE | `/recipes/:id` | ✓ | Delete a recipe |
| POST | `/recipes/:id/favorite` | ✓ | Save to favorites |
| POST | `/recipes/:id/rating` | ✓ | Submit a rating (1–5) |
| GET/POST/PUT/DELETE | `/recipes/:id/comments` | ✓ | Manage comments |

### Profiles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/PUT | `/profiles/me` | ✓ | View/update your profile |
| GET | `/profiles/:userId` | | View a user's profile |
| POST/DELETE | `/profiles/:userId/follow` | ✓ | Follow/unfollow a user |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send a message to the Cooking Genie chatbot |

---

## Authentication

After a successful login, include the returned token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Scripts

**Backend**

| Command | Description |
|---------|-------------|
| `npm run start-dev` | Run with hot-reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run typecheck` | TypeScript type check only |

**Frontend**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm test` | Run Vitest tests |
