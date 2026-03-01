import express, { type Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";

import router from "./router";
import { setupDocs } from "./util/doc";
import { connect } from "./repository/database";

dotenvFlow.config();

const app: Application = express();

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Recipe API is running" });
});

app.use(express.json());

const allowedOrigins = new Set<string>([
  "http://localhost:5173",
  // Add Render frontend later:
  // "https://your-frontend.onrender.com",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman/curl
      if (allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "auth-token", "Authorization"],
    credentials: true,
  })
);

app.use("/api", router);
setupDocs(app);

export async function startServer() {
  const PORT = Number(process.env.PORT) || 4000;

  console.log("Starting server...");
  console.log("PORT =", PORT);
  console.log("DBHOST exists? =", Boolean(process.env.DBHOST));

  await connect();
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`Server is up and running on port: ${PORT}`);
  });
}

export default app;