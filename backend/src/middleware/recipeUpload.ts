import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads", "recipes");

const allowedMimeTypes = ["image/jpeg", "image/png"];
const allowedExtensions = [".jpg", ".jpeg", ".png"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = allowedExtensions.includes(ext) ? ext : ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("photo must be a JPG or PNG image"));
}

export const uploadRecipePhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});