import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import type { Application } from "express";
import path from "path";

export function setupDocs(app: Application) {
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Recipe Sharing API",
      version: "1.0.0",
      description:
        "MongoDB + Express + TypeScript REST API for sharing and managing recipes",
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "auth-token",
        },
      },
      schemas: {
        Recipe: {
          type: "object",
          properties: {
            title: { type: "string" },
            imageUrl: { type: "string", description: "Stored photo path/URL on server." },
            photo: { type: "string", format: "binary", description: "Optional uploaded image file." },
            description: { type: "string" },
            ingredients: {
              type: "array",
              items: { type: "string" },
            },
            instructions: {
              type: "array",
              items: { type: "string" },
            },
            prepTimeMinutes: { type: "number" },
            cookTimeMinutes: { type: "number" },
            servings: { type: "number" },
            cuisine: { type: "string" },
            isPublic: { type: "boolean" },
            owner: { type: "string" },
            ratings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: { type: "string" },
                  value: { type: "integer", minimum: 1, maximum: 5 },
                },
              },
            },
            ratingSummary: {
              type: "object",
              properties: {
                average: { type: "number", example: 4.5 },
                count: { type: "integer", example: 12 },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            username: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
          },
        },
        Profile: {
          type: "object",
          properties: {
            user: { type: "string" },
            username: { type: "string" },
            bio: { type: "string" },
            avatarUrl: { type: "string" },
            followers: {
              type: "array",
              items: { type: "string" },
            },
            following: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
        ProfileUpdateInput: {
          type: "object",
          properties: {
            username: { type: "string", example: "Sali B" },
            bio: { type: "string", example: "Home cook and recipe creator." },
            avatarUrl: {
              type: "string",
              example: "https://images.example.com/avatar.jpg",
            },
          },
        },
      },
    },
  };

  const options = {
    swaggerDefinition,
    apis: [
      path.join(process.cwd(), "src", "router.ts"),
      path.join(process.cwd(), "src", "routes", "*.ts"),
    ],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
