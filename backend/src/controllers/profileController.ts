import { type Request, type Response } from "express";
import { Types } from "mongoose";

import { connect } from "../repository/database";
import { profileModel } from "../models/profileModel";
import { userModel } from "../models/userModel";
import { recipeModel } from "../models/recipeModel";

function getAuthUser(req: Request): { id: string; username?: string } | null {
  const user = (req as any).user as { id?: string; username?: string } | undefined;
  if (typeof user?.id !== "string") return null;
  return {
    id: user.id,
    username: typeof user.username === "string" ? user.username : "",
  };
}

function isValidObjectId(value: string): boolean {
  return Types.ObjectId.isValid(value);
}

function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function profileSelect() {
  return "user username bio avatarUrl followers following createdAt updatedAt";
}

function sanitizeProfileUpdate(body: any): { username?: string; bio?: string; avatarUrl?: string; email?: string } {
  const update: { username?: string; bio?: string; avatarUrl?: string; email?: string } = {};

  if (body.username !== undefined) {
    if (typeof body.username !== "string" || body.username.trim().length < 2) {
      throw new Error("username must be at least 2 characters");
    }
    update.username = body.username.trim();
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== "string") throw new Error("bio must be a string");
    if (body.bio.length > 300) throw new Error("bio must be at most 300 characters");
    update.bio = body.bio.trim();
  }

  if (body.avatarUrl !== undefined) {
    if (body.avatarUrl && !isValidUrl(body.avatarUrl)) {
      throw new Error("avatarUrl must be a valid http/https URL");
    }
    update.avatarUrl = String(body.avatarUrl ?? "").trim();
  }

  if (body.email !== undefined) {
    const email = String(body.email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("email must be a valid email address");
    }
    update.email = email;
  }

  return update;
}

async function ensureProfileForUser(userId: string, username?: string) {
  return profileModel.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: {
        user: userId,
        username: username || "User",
      },
    },
    { new: true, upsert: true }
  );
}

export async function getMyProfile(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = await ensureProfileForUser(authUser.id, authUser.username);
    res.status(200).json({ error: null, data: profile });
  } catch (err) {
    res.status(500).send("Error retrieving my profile. Error: " + err);
  }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const update = sanitizeProfileUpdate(req.body);

    const profile = await ensureProfileForUser(authUser.id, authUser.username);
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    if (update.username) {
      await userModel.findByIdAndUpdate(authUser.id, { $set: { username: update.username } });
    }
    if (update.email) {
      const existing = await userModel.findOne({
        email: update.email,
        _id: { $ne: authUser.id },
      }).select("_id");

      if (existing) {
        res.status(400).json({ error: "Email already exists." });
        return;
      }

      await userModel.findByIdAndUpdate(authUser.id, { $set: { email: update.email } });
    }

    const updatedProfile = await profileModel
      .findByIdAndUpdate(profile._id, { $set: update }, { new: true })
      .select(profileSelect());

    res.status(200).json({ error: null, data: updatedProfile });
  } catch (err: any) {
    const message = String(err?.message || err);
    const isValidationError =
      message.includes("username") || message.includes("bio") || message.includes("avatarUrl") || message.includes("email");
    res.status(isValidationError ? 400 : 500).send(message);
  }
}

export async function getProfileByUserId(req: Request, res: Response) {
  try {
    await connect();

    const userId = String(req.params.userId ?? "");
    if (!isValidObjectId(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const user = await userModel.findById(userId).select("username");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const profile = await ensureProfileForUser(userId, user.username);
    res.status(200).json({ error: null, data: profile });
  } catch (err) {
    res.status(500).send("Error retrieving profile. Error: " + err);
  }
}

export async function followUserProfile(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const targetUserId = String(req.params.userId ?? "");
    if (!isValidObjectId(targetUserId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    if (targetUserId === authUser.id) {
      res.status(400).json({ error: "You cannot follow yourself" });
      return;
    }

    const [meUser, targetUser] = await Promise.all([
      userModel.findById(authUser.id).select("username"),
      userModel.findById(targetUserId).select("username"),
    ]);

    if (!meUser || !targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await Promise.all([
      ensureProfileForUser(authUser.id, meUser.username),
      ensureProfileForUser(targetUserId, targetUser.username),
    ]);

    await Promise.all([
      profileModel.findOneAndUpdate(
        { user: authUser.id },
        { $addToSet: { following: targetUserId } },
        { new: true }
      ),
      profileModel.findOneAndUpdate(
        { user: targetUserId },
        { $addToSet: { followers: authUser.id } },
        { new: true }
      ),
    ]);

    const updatedMine = await profileModel.findOne({ user: authUser.id }).select(profileSelect());
    res.status(200).json({ error: null, data: updatedMine });
  } catch (err) {
    res.status(500).send("Error following profile. Error: " + err);
  }
}

export async function unfollowUserProfile(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const targetUserId = String(req.params.userId ?? "");
    if (!isValidObjectId(targetUserId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }
    if (targetUserId === authUser.id) {
      res.status(400).json({ error: "You cannot unfollow yourself" });
      return;
    }

    await Promise.all([
      profileModel.findOneAndUpdate(
        { user: authUser.id },
        { $pull: { following: targetUserId } },
        { new: true }
      ),
      profileModel.findOneAndUpdate(
        { user: targetUserId },
        { $pull: { followers: authUser.id } },
        { new: true }
      ),
    ]);

    const updatedMine = await profileModel.findOne({ user: authUser.id }).select(profileSelect());
    res.status(200).json({ error: null, data: updatedMine });
  } catch (err) {
    res.status(500).send("Error unfollowing profile. Error: " + err);
  }
}

export async function getProfileFollowers(req: Request, res: Response) {
  try {
    await connect();

    const targetUserId = String(req.params.userId ?? "");
    if (!isValidObjectId(targetUserId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const profile = await profileModel.findOne({ user: targetUserId }).select("followers");
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const followers = await userModel
      .find({ _id: { $in: profile.followers || [] } })
      .select("_id username email avatarUrl bio");

    res.status(200).json({ error: null, data: followers });
  } catch (err) {
    res.status(500).send("Error retrieving followers. Error: " + err);
  }
}

export async function getProfileFollowing(req: Request, res: Response) {
  try {
    await connect();

    const targetUserId = String(req.params.userId ?? "");
    if (!isValidObjectId(targetUserId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const profile = await profileModel.findOne({ user: targetUserId }).select("following");
    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const following = await userModel
      .find({ _id: { $in: profile.following || [] } })
      .select("_id username email avatarUrl bio");

    res.status(200).json({ error: null, data: following });
  } catch (err) {
    res.status(500).send("Error retrieving following profiles. Error: " + err);
  }
}

export async function getMySavedRecipes(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await userModel.findById(authUser.id).select("favorites");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    const recipes = await recipeModel.find({ _id: { $in: favorites } }).sort({ createdAt: -1 });
    res.status(200).json({ error: null, data: recipes });
  } catch (err) {
    res.status(500).send("Error retrieving saved recipes. Error: " + err);
  }
}

export async function getSavedRecipesByUserId(req: Request, res: Response) {
  try {
    await connect();

    const userId = String(req.params.userId ?? "");
    if (!isValidObjectId(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const user = await userModel.findById(userId).select("favorites");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    const recipes = await recipeModel.find({ _id: { $in: favorites } }).sort({ createdAt: -1 });
    res.status(200).json({ error: null, data: recipes });
  } catch (err) {
    res.status(500).send("Error retrieving saved recipes. Error: " + err);
  }
}

export async function getRecipesByUserId(req: Request, res: Response) {
  try {
    await connect();

    const userId = String(req.params.userId ?? "");
    if (!isValidObjectId(userId)) {
      res.status(400).json({ error: "Invalid userId" });
      return;
    }

    const recipes = await recipeModel
      .find({ owner: userId })
      .sort({ createdAt: -1 })
      .populate("owner", "username bio avatarUrl");
    res.status(200).json({ error: null, data: recipes });
  } catch (err) {
    res.status(500).send("Error retrieving user recipes. Error: " + err);
  }
}
