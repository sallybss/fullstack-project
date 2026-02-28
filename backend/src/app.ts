import express from "express";
import type { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";
import { testConnection } from "./repository/database";
import router from "./router";
import { setupDocs } from "./util/doc";

dotenvFlow.config();

const app: Application = express();

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Recipe API is running" });
  });

app.use(express.json());

 const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://recipe-sharing-app-1.onrender.com",
 ]);

const corsOptions: cors.CorsOptions = {
   origin: (origin, callback) => {
   if (!origin) return callback(null, true);
   if (allowedOrigins.has(origin)) return callback(null, true);
   return callback(null, false);
  },
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "auth-token"],
 };

 app.use(cors(corsOptions));

app.use("/api", router);
setupDocs(app);

export async function startServer() {
  const PORT: number = parseInt(process.env.PORT as string) || 4000;

  app.listen(PORT, function () {
    console.log("Server is up and running on port: " + PORT);
  });

  testConnection()
    .then(() => {
      console.log("Database connected");
    })
    .catch((error) => {
      console.log("Database connection failed. Error: " + error);
    });
}

export default app;
