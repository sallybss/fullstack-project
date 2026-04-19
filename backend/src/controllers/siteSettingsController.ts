import { type Request, type Response } from "express";
import Joi from "joi";

import { connect } from "../repository/database";
import { siteSettingModel } from "../models/siteSettingModel";

const updateHeroSchema = Joi.object({
  imageUrl: Joi.string().trim().uri({ scheme: ["http", "https"] }).max(2000).required(),
});


function getSettingKey(req: Request) {
  return String(req.params.key || "").trim();
}

export async function getHeroSetting(req: Request, res: Response) {
  try {
    await connect();

    const key = getSettingKey(req);
    if (!key) {
      return res.status(400).json({ error: "Missing setting key" });
    }

    const setting = await siteSettingModel.findOne({ key }).select("key value");
    return res.status(200).json({
      error: null,
      data: {
        key,
        imageUrl: setting?.value || null,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to load hero setting." });
  }
}

export async function uploadHeroCover(req: Request, res: Response) {
  try {
    await connect();

    const key = getSettingKey(req);
    if (!key) {
      return res.status(400).json({ error: "Missing setting key" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = `/uploads/covers/${req.file.filename}`;

    const setting = await siteSettingModel.findOneAndUpdate(
      { key },
      { $set: { value: imageUrl } },
      { upsert: true, returnDocument: "after" }
    ).select("key value");

    return res.status(200).json({
      error: null,
      data: {
        key: setting?.key || key,
        imageUrl: setting?.value || imageUrl,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to upload cover image." });
  }
}

export async function updateHeroSetting(req: Request, res: Response) {
  try {
    await connect();

    const key = getSettingKey(req);
    if (!key) {
      return res.status(400).json({ error: "Missing setting key" });
    }

    const { error, value } = updateHeroSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0]?.message || "Invalid image URL" });
    }

    const setting = await siteSettingModel.findOneAndUpdate(
      { key },
      { $set: { value: value.imageUrl } },
      { upsert: true, returnDocument: "after" }
    ).select("key value");

    return res.status(200).json({
      error: null,
      data: {
        key: setting?.key || key,
        imageUrl: setting?.value || value.imageUrl,
      },
    });
  } catch {
    return res.status(500).json({ error: "Failed to update hero setting." });
  }
}
