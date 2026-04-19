export type UserRole = "user" | "admin";
export type UserStatus = "active" | "blocked";

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRegisterUserInput {
  username: string;
  email: string;
  password: string;
}

export interface ILoginUserInput {
  email: string;
  password: string;
}

export interface IUpdateUserInput {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface IUserPublicProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}
