import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 255 },
    password: { type: String, required: true },
    bio: { type: String, default: "", maxlength: 300 },
    avatarUrl: { type: String, default: "", maxlength: 500 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Recipe", default: [] }],
  },
  { timestamps: true }
);

export const userModel = model("User", userSchema);
