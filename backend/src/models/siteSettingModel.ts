import { Schema, model } from "mongoose";

const siteSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const siteSettingModel = model("SiteSetting", siteSettingSchema);
