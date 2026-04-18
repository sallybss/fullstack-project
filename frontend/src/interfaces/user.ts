export type UserRole = "user" | "admin";
export type UserStatus = "active" | "blocked";

export type RegisterUser = {
  username: string
  email: string
  password: string
}

export type LoginUser = {
  email: string
  password: string
}

export type User = {
  _id: string
  username: string
  email: string
  bio?: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  createdAt?: string
  updatedAt?: string
}

export type Profile = {
  user: string
  username: string
  bio?: string
  avatarUrl?: string
  followers: string[]
  following: string[]
  createdAt?: string
  updatedAt?: string
}
