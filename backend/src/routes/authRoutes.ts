import { Router } from "express";
import {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPasswordWithToken,
  getAllUsers,
  getCurrentUser,
  changeMyPassword,
  deleteMyAccount,
  updateUserStatus,
  deleteUserByAdmin,
  verifyAdmin,
  verifyToken,
} from "../controllers/authController";
import { createLoginRateLimiter } from "../middleware/rateLimit";

const router = Router();

const loginRateLimiter = createLoginRateLimiter({
  keyPrefix: "auth-login",
  windowMs: 5 * 60 * 1000,
  maxRequests: 2,
  message: "Too many login attempts. Please wait 5 minutes before trying again.",
});

router.post("/register", registerUser);
router.post("/login", loginRateLimiter, loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithToken);
router.get("/me", verifyToken, getCurrentUser);
router.put("/me/password", verifyToken, changeMyPassword);
router.delete("/me", verifyToken, deleteMyAccount);
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/users/:userId/status", verifyToken, verifyAdmin, updateUserStatus);
router.delete("/users/:userId", verifyToken, verifyAdmin, deleteUserByAdmin);

export default router;
