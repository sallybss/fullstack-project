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
  createdAt?: string
}