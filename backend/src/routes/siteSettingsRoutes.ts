import { Router } from "express";

import { verifyAdmin, verifyToken } from "../controllers/authController";
import { getHeroSetting, updateHeroSetting, uploadHeroCover } from "../controllers/siteSettingsController";
import { uploadCoverPhoto } from "../middleware/coverUpload";

const router = Router();

router.get("/hero/:key", getHeroSetting);
router.put("/hero/:key", verifyToken, verifyAdmin, updateHeroSetting);
router.post("/hero/:key/upload", verifyToken, verifyAdmin, uploadCoverPhoto.single("cover"), uploadHeroCover);

export default router;
