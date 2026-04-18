import { Router } from "express";

import { verifyAdmin, verifyToken } from "../controllers/authController";
import { getHeroSetting, updateHeroSetting } from "../controllers/siteSettingsController";

const router = Router();

router.get("/hero/:key", getHeroSetting);
router.put("/hero/:key", verifyToken, verifyAdmin, updateHeroSetting);

export default router;
