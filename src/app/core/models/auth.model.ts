export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  email: string;
  fullName: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  lastLogin: string;
  isActive: boolean;
  createdAt: string;
}

export interface ErrorResponse {
  error: string;
}