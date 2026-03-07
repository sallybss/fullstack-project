import { Router } from "express";
import { registerUser, loginUser, getAllUsers, verifyToken } from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", verifyToken, getAllUsers);

export default router;
