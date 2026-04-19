import { Schema, model } from "mongoose";

const profileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    bio: { type: String, default: "", trim: true, maxlength: 300 },
    avatarUrl: { type: String, default: "", trim: true, maxlength: 500 },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const profileModel = model("Profile", profileSchema);
