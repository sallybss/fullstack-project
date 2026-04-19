import { Router } from "express";
import { submitContactMessage } from "../controllers/contactController";
import { createIpRateLimiter } from "../middleware/rateLimit";

const router = Router();

const contactRateLimiter = createIpRateLimiter({
  keyPrefix: "contact-submit",
  windowMs: 60 * 60 * 1000,
  maxRequests: 2,
  message: "Too many contact requests from this address. Please try again later.",
});

router.post("/", contactRateLimiter, submitContactMessage);

export default router;
