import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi, { type ValidationResult } from "joi";

import { userModel } from "../models/userModel";
import { profileModel } from "../models/profileModel";
import { connect, disconnect } from "../repository/database";
import { type IUser } from "../interfaces/user";

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

export async function registerUser(req: Request, res: Response) {
  try {
    const { error } = validateUserRegistrationInfo(req.body);
    if (error) return res.status(400).json({ error: error.details[0]?.message });

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const username = String(req.body.username || "").trim();

    await connect();

    const emailExists = await userModel.findOne({ email });
    if (emailExists) return res.status(400).json({ error: "Email already exists." });

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(req.body.password, salt);

    const userObject = new userModel({
      username,
      email,
      password: passwordHashed,
      role: "user",
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
      { upsert: true, new: true }
    );

    return res.status(201).json({ error: null, data: { userId: savedUser._id } });
  } catch (error: any) {
    console.error("registerUser failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Database unavailable. Check DBHOST/Atlas network access." });
    }
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error?.keyPattern || {})[0] || "field";
      if (duplicateField === "email") {
        return res.status(400).json({ error: "Email already exists." });
      }
      return res.status(400).json({ error: `${duplicateField} already exists.` });
    }
    return res.status(500).send("Error registering user. Error: " + error);
  } finally {
    await disconnect();
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { error } = validateUserLoginInfo(req.body);
    if (error) return res.status(400).json({ error: error.details[0]?.message });

    await connect();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const user: IUser | null = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "Password or email is wrong." });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Password or email is wrong." });

    const TOKEN_SECRET = process.env.TOKEN_SECRET;
    if (!TOKEN_SECRET) return res.status(500).json({ error: "Missing TOKEN_SECRET in env." });

    const userId = String(user._id);

    const token = jwt.sign(
      { id: userId, username: user.username, email: user.email },
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
      return res.status(503).json({ error: "Database unavailable. Check DBHOST/Atlas network access." });
    }
    return res.status(500).send("Error logging in user. Error: " + error);
  } finally {
    await disconnect();
  }
}

export async function getAllUsers(_req: Request, res: Response) {
  try {
    await connect();

    const users = await userModel
      .find({})
      .select("_id username email bio avatarUrl role favorites createdAt updatedAt");

    return res.status(200).json({ error: null, data: users });
  } catch (error: any) {
    console.error("getAllUsers failed:", error);
    if (isDbUnavailableError(error)) {
      return res.status(503).json({ error: "Database unavailable. Check DBHOST/Atlas network access." });
    }
    return res.status(500).send("Error retrieving users. Error: " + error);
  } finally {
    await disconnect();
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const bearer = req.header("Authorization");
  const legacy = req.header("auth-token");

  const token =
    (bearer && bearer.startsWith("Bearer ") ? bearer.slice(7).trim() : null) ||
    legacy ||
    null;

  if (!token) return res.status(401).json({ error: "Access Denied. Missing token." });

  try {
    const TOKEN_SECRET = process.env.TOKEN_SECRET;
    if (!TOKEN_SECRET) return res.status(500).json({ error: "Missing TOKEN_SECRET in env." });

    const decoded = jwt.verify(token, TOKEN_SECRET);
    (req as any).user = decoded;

    return next();
  } catch {
    return res.status(401).json({ error: "Invalid Token" });
  }
}

export function validateUserRegistrationInfo(data: IUser): ValidationResult {
  const schema = Joi.object({
    username: Joi.string().min(2).max(255).required(),
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(64).required(),
  });

  return schema.validate(data);
}

export function validateUserLoginInfo(data: IUser): ValidationResult {
  const schema = Joi.object({
    email: Joi.string().email().min(6).max(255).required(),
    password: Joi.string().min(6).max(64).required(),
  });

  return schema.validate(data);
}
