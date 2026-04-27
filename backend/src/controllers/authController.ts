import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi, { type ValidationResult } from "joi";
import crypto from "crypto";
import nodemailer from "nodemailer";

import { userModel } from "../models/userModel";
import { profileModel } from "../models/profileModel";
import { recipeModel } from "../models/recipeModel";
import { mealPlanModel } from "../models/mealPlanModel";
import { connect } from "../repository/database";
import { type IUser } from "../interfaces/user";
import { validateOptions } from "../validation/commonValidation";
import { sendInternalError } from "../util/httpResponses";

function isDbUnavailableError(error: any): boolean {
  const code = String(error?.code || "");
  const message = String(error?.message || error || "");
  return (
    code === "ECONNREFUSED" ||
    code === "ENOTFOUND" ||
    message.includes("querySrv") ||
    message.includes("MongoServerSelectionError")
  );
}

const USERNAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_RESET_WINDOW_MS = 1000 * 60 * 30;

let authTransporter: nodemailer.Transporter | null = null;

function getAuthTransporter() {
  if (!authTransporter) {
    authTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_APP_PASSWORD,
      },
    });
  }

  return authTransporter;
}

function buildResetLink(req: Request, token: string): string {
  const origin =
    process.env.FRONTEND_URL ||
    req.header("origin") ||
    "http://localhost:5173";

  const safeOrigin = origin.replace(/\/+$/, "");
  return `${safeOrigin}/reset-password?token=${encodeURIComponent(token)}`;
}

function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { error, value } = validateUserRegistrationInfo(req.body);
    if (error) return res.status(400).json({ error: error.details[0]?.message });

    const email = value.email;
    const username = value.username;

    await connect();

    const emailExists = await userModel.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already exists." });

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(value.password, salt);

    const userObject = new userModel({
      username,
      email,
      password: passwordHashed,
      role: "user",
      status: "active",
    });

    const savedUser = await userObject.save();
    await profileModel.findOneAndUpdate(
      { user: savedUser._id },
      {
        $setOnInsert: {
          user: savedUser._id,
          username: savedUser.username,
          bio: "",
          avatarUrl: "",
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    return res.status(201).json({ error: null, data: { userId: savedUser._id } });
  } catch (error: any) {
    console.error("registerUser failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error?.keyPattern || {})[0] || "field";
      if (duplicateField === "email") {
        return res.status(400).json({ error: "Email already exists." });
      }
      return res.status(400).json({ error: `${duplicateField} already exists.` });
    }
    return sendInternalError(res, "registerUser failed:", error);
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { error, value } = validateUserLoginInfo(req.body);
    if (error) return res.status(400).json({ error: error.details[0]?.message });

    await connect();

    const email = value.email;

    const user: IUser | null = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "Password or email is wrong." });

    const validPassword = await bcrypt.compare(value.password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Password or email is wrong." });

    const TOKEN_SECRET = process.env.TOKEN_SECRET;
    if (!TOKEN_SECRET) {
      console.error("loginUser failed: TOKEN_SECRET is not configured.");
      return res.status(500).json({ error: "Something went wrong. Please try again later." });
    }

    const userId = String(user._id);

    if (user.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked." });
    }

    const token = jwt.sign(
      { id: userId, username: user.username, email: user.email, role: user.role },
      TOKEN_SECRET,
      { expiresIn: "2h" }
    );

    return res
      .status(200)
      .header("auth-token", token)
      .json({ error: null, data: { userId, token } });
  } catch (error: any) {
    console.error("loginUser failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }
    return sendInternalError(res, "loginUser failed:", error);
  }
}

export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    let devResetLink = "";

    if (!email || email.length > EMAIL_MAX_LENGTH) {
      return res.status(400).json({ error: "A valid email is required." });
    }

    await connect();

    const user = await userModel.findOne({ email }).select("_id username email status");
    const recipient = process.env.CONTACT_EMAIL;
    const appPassword = process.env.CONTACT_EMAIL_APP_PASSWORD;

    if (user && user.status === "active" && recipient && appPassword) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashResetToken(resetToken);
      const passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_WINDOW_MS);

      await userModel.findByIdAndUpdate(user._id, {
        $set: {
          passwordResetTokenHash: resetTokenHash,
          passwordResetExpiresAt,
        },
      });

      const resetLink = buildResetLink(req, resetToken);
      devResetLink = resetLink;

      await getAuthTransporter().sendMail({
        from: `"FoodFinder" <${recipient}>`,
        to: user.email,
        subject: "Reset your FoodFinder password",
        text: [
          `Hi ${user.username},`,
          "",
          "We received a request to reset your FoodFinder password.",
          `Use this link to set a new password: ${resetLink}`,
          "",
          "This link will expire in 30 minutes.",
          "If you did not request this, you can ignore this email.",
        ].join("\n"),
        html: `
          <div style="font-family: Arial, sans-serif; color: #1f1a16; line-height: 1.6;">
            <h2 style="margin-bottom: 12px;">Reset your FoodFinder password</h2>
            <p>Hi ${escapeHtml(user.username)},</p>
            <p>We received a request to reset your password.</p>
            <p>
              <a
                href="${resetLink}"
                style="display: inline-block; padding: 12px 18px; border-radius: 999px; background: #ff724c; color: #fff; text-decoration: none; font-weight: 700;"
              >
                Reset password
              </a>
            </p>
            <p>This link will expire in 30 minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else if (user && user.status === "active") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashResetToken(resetToken);
      const passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_WINDOW_MS);

      await userModel.findByIdAndUpdate(user._id, {
        $set: {
          passwordResetTokenHash: resetTokenHash,
          passwordResetExpiresAt,
        },
      });

      devResetLink = buildResetLink(req, resetToken);
      console.warn("Password reset email config missing. Using dev reset link fallback.");
    }

    return res.status(200).json({
      error: null,
      data: {
        success: true,
        message: "If that email exists, a reset link has been sent.",
        resetLink: process.env.NODE_ENV === "production" ? undefined : devResetLink || undefined,
      },
    });
  } catch (error: any) {
    console.error("requestPasswordReset failed:", error);
    return res.status(500).json({ error: "Failed to send reset email." });
  }
}

export async function resetPasswordWithToken(req: Request, res: Response) {
  try {
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "");

    if (!token) {
      return res.status(400).json({ error: "Reset token is required." });
    }

    if (newPassword.length < 6 || newPassword.length > PASSWORD_MAX_LENGTH) {
      return res.status(400).json({ error: `New password must be 6-${PASSWORD_MAX_LENGTH} characters.` });
    }

    await connect();

    const user = await userModel.findOne({
      passwordResetTokenHash: hashResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetTokenHash = "";
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.status(200).json({ error: null, data: { success: true } });
  } catch (error: any) {
    console.error("resetPasswordWithToken failed:", error);
    return res.status(500).json({ error: "Failed to reset password." });
  }
}

export async function getAllUsers(_req: Request, res: Response) {
  try {
    await connect();

    const users = await userModel
      .find({})
      .select("_id username email bio avatarUrl role status favorites createdAt updatedAt");

    return res.status(200).json({ error: null, data: users });
  } catch (error: any) {
    console.error("getAllUsers failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }
    return sendInternalError(res, "getAllUsers failed:", error);
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    await connect();

    const authUserId = (req as any).user?.id;
    if (typeof authUserId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await userModel
      .findById(authUserId)
      .select("_id username email bio avatarUrl role status createdAt updatedAt");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ error: null, data: user });
  } catch (error: any) {
    console.error("getCurrentUser failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }
    return sendInternalError(res, "getCurrentUser failed:", error);
  }
}

export async function changeMyPassword(req: Request, res: Response) {
  try {
    await connect();

    const authUserId = (req as any).user?.id;
    if (typeof authUserId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (
      !currentPassword ||
      !newPassword ||
      newPassword.length < 6 ||
      currentPassword.length > PASSWORD_MAX_LENGTH ||
      newPassword.length > PASSWORD_MAX_LENGTH
    ) {
      return res.status(400).json({ error: `currentPassword and newPassword (6-${PASSWORD_MAX_LENGTH} chars) are required.` });
    }

    const user = await userModel.findById(authUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ error: null, data: { success: true } });
  } catch (error: any) {
    console.error("changeMyPassword failed:", error);
    return sendInternalError(res, "changeMyPassword failed:", error);
  }
}

export async function deleteMyAccount(req: Request, res: Response) {
  try {
    await connect();

    const authUserId = (req as any).user?.id;
    if (typeof authUserId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await Promise.all([
      recipeModel.deleteMany({ owner: authUserId }),
      mealPlanModel.deleteMany({ owner: authUserId }),
      profileModel.deleteOne({ user: authUserId }),
      profileModel.updateMany({}, {
        $pull: {
          followers: authUserId,
          following: authUserId,
        },
      }),
      userModel.findByIdAndDelete(authUserId),
    ]);

    return res.status(200).json({ error: null, data: { success: true } });
  } catch (error: any) {
    console.error("deleteMyAccount failed:", error);
    return sendInternalError(res, "deleteMyAccount failed:", error);
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    await connect();

    const userId = String(req.params.userId || "");
    const authUserId = String((req as any).user?.id || "");
    const status = String(req.body?.status || "");

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (userId === authUserId) {
      return res.status(400).json({ error: "Admins cannot change their own status from this endpoint." });
    }

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ error: "status must be active or blocked" });
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { returnDocument: "after" }
    ).select("_id username email bio avatarUrl role status favorites createdAt updatedAt");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ error: null, data: user });
  } catch (error: any) {
    console.error("updateUserStatus failed:", error);
    return sendInternalError(res, "updateUserStatus failed:", error);
  }
}

export async function deleteUserByAdmin(req: Request, res: Response) {
  try {
    await connect();

    const userId = String(req.params.userId || "");
    const authUserId = String((req as any).user?.id || "");

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (userId === authUserId) {
      return res.status(400).json({ error: "Admins cannot delete themselves from this endpoint." });
    }

    await Promise.all([
      recipeModel.deleteMany({ owner: userId }),
      mealPlanModel.deleteMany({ owner: userId }),
      profileModel.deleteOne({ user: userId }),
      profileModel.updateMany({}, {
        $pull: {
          followers: userId,
          following: userId,
        },
      }),
      userModel.findByIdAndDelete(userId),
    ]);

    return res.status(200).json({ error: null, data: { userId } });
  } catch (error: any) {
    console.error("deleteUserByAdmin failed:", error);
    return sendInternalError(res, "deleteUserByAdmin failed:", error);
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const bearer = req.header("Authorization");
  const legacy = req.header("auth-token");

  const token =
    (bearer && bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : null) ||
    legacy ||
    null;

  if (!token) return res.status(401).json({ error: "Access Denied. Missing token." });

  try {
    const TOKEN_SECRET = process.env.TOKEN_SECRET;
    if (!TOKEN_SECRET) {
      console.error("verifyToken failed: TOKEN_SECRET is not configured.");
      return res.status(500).json({ error: "Something went wrong. Please try again later." });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);
    const authUserId = (decoded as any)?.id;
    if (typeof authUserId !== "string") {
      return res.status(401).json({ error: "Invalid Token" });
    }

    await connect();

    const user = await userModel.findById(authUserId).select("_id username email role status");
    if (!user) {
      return res.status(401).json({ error: "Invalid Token" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Account is blocked." });
    }

    (req as any).user = {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid Token" });
  }
}

export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authUserId = (req as any).user?.id;
    if (typeof authUserId !== "string") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connect();

    const user = await userModel.findById(authUserId).select("role status");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Blocked users cannot access this resource." });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    return next();
  } catch (error: any) {
    return sendInternalError(res, "verifyAdmin failed:", error);
  }
}

export function validateUserRegistrationInfo(data: IUser): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(USERNAME_MAX_LENGTH).required(),
    email: Joi.string().trim().lowercase().email().min(6).max(EMAIL_MAX_LENGTH).required(),
    password: Joi.string().min(6).max(PASSWORD_MAX_LENGTH).required(),
  });

  return schema.validate(data, validateOptions);
}

export function validateUserLoginInfo(data: IUser): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().trim().lowercase().email().min(6).max(EMAIL_MAX_LENGTH).required(),
    password: Joi.string().min(6).max(PASSWORD_MAX_LENGTH).required(),
  });

  return schema.validate(data, validateOptions);
}
