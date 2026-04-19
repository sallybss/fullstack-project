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
        MealPlanDay: {
          type: "object",
          properties: {
            breakfast: { type: "string", example: "69e40556de162e6f5c49ad30" },
            lunch: { type: "string", example: "" },
            dinner: { type: "string", example: "69e40556de162e6f5c49ad31" },
          },
        },
        MealPlanInput: {
          type: "object",
          required: ["name", "days"],
          properties: {
            name: { type: "string", example: "Week 18" },
            weekLabel: { type: "string", example: "Apr 20 - Apr 26" },
            days: {
              type: "object",
              properties: {
                monday: { $ref: "#/components/schemas/MealPlanDay" },
                tuesday: { $ref: "#/components/schemas/MealPlanDay" },
                wednesday: { $ref: "#/components/schemas/MealPlanDay" },
                thursday: { $ref: "#/components/schemas/MealPlanDay" },
                friday: { $ref: "#/components/schemas/MealPlanDay" },
                saturday: { $ref: "#/components/schemas/MealPlanDay" },
                sunday: { $ref: "#/components/schemas/MealPlanDay" },
              },
            },
          },
        },
        MealPlan: {
          allOf: [
            { $ref: "#/components/schemas/MealPlanInput" },
            {
              type: "object",
              properties: {
                id: { type: "string", example: "6803d6d6a92296296a0a0c11" },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
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
