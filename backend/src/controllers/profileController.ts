import { type Request, type Response } from "express";
import { Types } from "mongoose";

import { connect } from "../repository/database";
import { profileModel } from "../models/profileModel";
import { userModel } from "../models/userModel";
import { recipeModel } from "../models/recipeModel";
import { validationMessage } from "../validation/commonValidation";
import { type ProfileUpdateInput, validateProfileUpdate } from "../validation/profileValidation";
import { sendInternalError } from "../util/httpResponses";

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

function profileSelect() {
  return "user username bio avatarUrl followers following createdAt updatedAt";
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
    { upsert: true, returnDocument: "after" }
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
    sendInternalError(res, "getMyProfile failed:", err);
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

    const { error, value } = validateProfileUpdate(req.body);
    if (error) {
      res.status(400).json({ error: validationMessage(error) });
      return;
    }

    const update = value as ProfileUpdateInput;

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
      .findByIdAndUpdate(profile._id, { $set: update }, { returnDocument: "after" })
      .select(profileSelect());

    res.status(200).json({ error: null, data: updatedProfile });
  } catch (err: any) {
    sendInternalError(res, "updateMyProfile failed:", err);
  }
}

export async function uploadMyAvatar(req: Request, res: Response) {
  try {
    await connect();

    const authUser = getAuthUser(req);
    if (!authUser) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file?.filename) {
      res.status(400).json({ error: "Avatar image file is required" });
      return;
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const profile = await ensureProfileForUser(authUser.id, authUser.username);

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    await userModel.findByIdAndUpdate(authUser.id, { $set: { avatarUrl } });

    const updatedProfile = await profileModel
      .findByIdAndUpdate(
        profile._id,
        { $set: { avatarUrl } },
        { returnDocument: "after" }
      )
      .select(profileSelect());

    res.status(200).json({ error: null, data: updatedProfile });
  } catch (err: any) {
    const message = String(err?.message || err);
    if (message.includes("Avatar")) {
      res.status(400).json({ error: message });
      return;
    }
    sendInternalError(res, "uploadMyAvatar failed:", err);
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
    sendInternalError(res, "getProfileByUserId failed:", err);
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
        { returnDocument: "after" }
      ),
      profileModel.findOneAndUpdate(
        { user: targetUserId },
        { $addToSet: { followers: authUser.id } },
        { returnDocument: "after" }
      ),
    ]);

    const updatedMine = await profileModel.findOne({ user: authUser.id }).select(profileSelect());
    res.status(200).json({ error: null, data: updatedMine });
  } catch (err) {
    sendInternalError(res, "followUserProfile failed:", err);
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
        { returnDocument: "after" }
      ),
      profileModel.findOneAndUpdate(
        { user: targetUserId },
        { $pull: { followers: authUser.id } },
        { returnDocument: "after" }
      ),
    ]);

    const updatedMine = await profileModel.findOne({ user: authUser.id }).select(profileSelect());
    res.status(200).json({ error: null, data: updatedMine });
  } catch (err) {
    sendInternalError(res, "unfollowUserProfile failed:", err);
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
    sendInternalError(res, "getProfileFollowers failed:", err);
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
    sendInternalError(res, "getProfileFollowing failed:", err);
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
    sendInternalError(res, "getMySavedRecipes failed:", err);
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
    sendInternalError(res, "getSavedRecipesByUserId failed:", err);
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
    sendInternalError(res, "getRecipesByUserId failed:", err);
  }
}
