import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import type { Application } from "express";
import path from "path";

export function setupDocs(app: Application) {
  const isProd = process.env.NODE_ENV === "production";

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
        url: isProd
          ? "https://your-recipe-api.onrender.com/api"
          : "http://localhost:4000/api",
        description: isProd ? "Production server" : "Local development server",
      },
    ],
    components: {
      securitySchemes: {
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
            imageUrl: { type: "string" },
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
      },
    },
  };

  const options = {
    swaggerDefinition,
    apis: [
      isProd
        ? path.join(process.cwd(), "dist", "**", "*.js")
        : path.join(process.cwd(), "src", "**", "*.ts"),
    ],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
