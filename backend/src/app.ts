import express, { type Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import path from "path";
import multer from "multer";

import router from "./router";
import { setupDocs } from "./util/doc";
import { connect } from "./repository/database";

dotenvFlow.config();

const app: Application = express();

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Recipe API is running" });
});

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const allowedOrigins = new Set<string>([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:4000",
  // Add Render frontend later:
  // "https://your-frontend.onrender.com",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); 
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "auth-token", "Authorization"],
    credentials: true,
  })
);

app.use("/api", router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (typeof err?.message === "string" && err.message.startsWith("CORS blocked for origin:")) {
    return res.status(403).json({ error: err.message });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "photo file is too large (max 5MB)" });
    }
    return res.status(400).json({ error: err.message });
  }
  if (typeof err?.message === "string" && err.message.includes("photo must be a JPG or PNG image")) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
  return res.status(500).json({ error: "Internal server error" });
});

export async function startServer() {
  const PORT = Number(process.env.PORT) || 4000;

  console.log("Starting server...");
  console.log("PORT =", PORT);
  console.log("DBHOST exists? =", Boolean(process.env.DBHOST));

  app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);

    void connect()
      .then(() => {
        console.log("Database connected");
      })
      .catch((error) => {
        console.error("Initial database connection failed:", error);
      });

    setImmediate(() => {
      try {
        setupDocs(app);
        console.log("Swagger docs ready at /swagger");
      } catch (error) {
        console.error("Failed to initialize Swagger docs:", error);
      }
    });
  });
}

export default app;
