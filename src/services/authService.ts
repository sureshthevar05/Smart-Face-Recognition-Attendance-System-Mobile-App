import { apiClient } from "./apiClient";
import type { LoginCredentials, LoginResponse } from "../types/auth";

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login/", {
    username: credentials.username,
    password: credentials.password,
  });
  return response.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{message: string}> {
  const response = await apiClient.post<{message: string}>("/api/auth/change-password/", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
}
