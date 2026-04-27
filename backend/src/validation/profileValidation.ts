import Joi from "joi";
import { httpUrlSchema, validateOptions } from "./commonValidation";

const USERNAME_MAX_LENGTH = 100;
const BIO_MAX_LENGTH = 300;
const AVATAR_URL_MAX_LENGTH = 500;
const EMAIL_MAX_LENGTH = 255;

const profileUpdateSchema = Joi.object({
  username: Joi.string().trim().min(2).max(USERNAME_MAX_LENGTH),
  bio: Joi.string().trim().max(BIO_MAX_LENGTH).allow(""),
  avatarUrl: httpUrlSchema(AVATAR_URL_MAX_LENGTH),
  email: Joi.string().trim().lowercase().email().max(EMAIL_MAX_LENGTH),
}).min(1);

export type ProfileUpdateInput = {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
};

export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.validate(data, validateOptions);
}
