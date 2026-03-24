import { api } from "./client";
import type { ResourceResponse, MessageResponse } from "@/types/api";
import type {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  VerifyResetCodePayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from "@/types/auth";

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ResourceResponse<AuthResponse>>("/auth/login", data),

  register: (data: RegisterPayload) =>
    api.post<ResourceResponse<AuthResponse>>("/auth/register", data),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post<ResourceResponse<MessageResponse>>("/auth/forgot-password", data),

  verifyResetCode: (data: VerifyResetCodePayload) =>
    api.post<{ resetToken: string }>("/auth/verify-reset-code", data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post<ResourceResponse<MessageResponse>>("/auth/reset-password", data),

  changePassword: (data: ChangePasswordPayload) =>
    api.put<ResourceResponse<MessageResponse>>("/auth/password", data),

  logout: () => api.post<ResourceResponse<MessageResponse>>("/auth/logout"),

  getCurrentUser: () => api.get<ResourceResponse<User>>("/auth/user"),
};
