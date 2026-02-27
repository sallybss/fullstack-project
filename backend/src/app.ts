import express from "express";
import type { Application } from "express";
import dotenvFlow from "dotenv-flow";
// TODO: enable when installed
// import cors from "cors";
// TODO: enable when implemented
// import { testConnection } from "./repository/database";
// TODO: enable when route index exists
// import routes from "./routes";
// TODO: enable when docs utility exists
// import { setupDocs } from "./util/doc";

dotenvFlow.config();

const app: Application = express();

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Recipe API is running" });
  });

app.use(express.json());

// TODO: enable CORS setup when `cors` package is installed
// const allowedOrigins = new Set([
//   "http://localhost:5173",
//   "https://recipe-sharing-app-1.onrender.com",
// ]);
//
// const corsOptions: cors.CorsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.has(origin)) return callback(null, true);
//     return callback(null, false);
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "auth-token"],
// };
//
// app.use(cors(corsOptions));

// TODO: enable when routes are wired
// app.use("/api", routes);
// TODO: enable when swagger docs helper is ready
// setupDocs(app);

export async function startServer() {
  // TODO: enable when database connection helper is implemented
  // await testConnection();

  const PORT: number = parseInt(process.env.PORT as string) || 4000;

  app.listen(PORT, function () {
    console.log("Server is up and running on port: " + PORT);
  });
}

export default app;
