export interface User {
  id: number
  username: string
  email: string
  password: string
  createdAt: Date
}

export interface RifaNumber {
  id: number
  userId: number
  number: string
  description?: string
  createdAt: Date
}

export interface AuthPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  username: string
  password: string
}
