// Authentication Types

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: UserData;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: UserData;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string; // Only in development
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // Hashed
  avatar: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
}

export interface DecodedJWT {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthError {
  error: string;
  status: number;
}
