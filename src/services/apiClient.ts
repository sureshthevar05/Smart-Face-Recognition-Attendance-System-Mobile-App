import axios, { AxiosError, AxiosHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Replace with your local IP address for device testing
export const API_BASE_URL = "http://172.20.10.2:8000";

const FACULTY_STORAGE_KEY = "hsfas_faculty_identity";
const JWT_ACCESS_KEY = "hsfas_jwt_access";
const JWT_REFRESH_KEY = "hsfas_jwt_refresh";

export async function storeTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(JWT_ACCESS_KEY, access);
  await SecureStore.setItemAsync(JWT_REFRESH_KEY, refresh);
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync(JWT_ACCESS_KEY);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(JWT_REFRESH_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(JWT_ACCESS_KEY);
  await SecureStore.deleteItemAsync(JWT_REFRESH_KEY);
}

export interface StoredFacultyIdentity {
  facultyId: string;
  fullName: string;
  department: string;
  gender?: string | null;
  isAdmin?: boolean;
}

export async function getStoredFacultyIdentity(): Promise<StoredFacultyIdentity | null> {
  const raw = await AsyncStorage.getItem(FACULTY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredFacultyIdentity;
  } catch {
    return null;
  }
}

export async function storeFacultyIdentity(
  identity: StoredFacultyIdentity
): Promise<void> {
  const raw = JSON.stringify(identity);
  await AsyncStorage.setItem(FACULTY_STORAGE_KEY, raw);
}

export async function clearStoredFacultyIdentity(): Promise<void> {
  await AsyncStorage.removeItem(FACULTY_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number | null;
  isNetworkError: boolean;
  isTimeout: boolean;
  original: unknown;

  constructor(params: {
    message: string;
    status: number | null;
    isNetworkError: boolean;
    isTimeout: boolean;
    original: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.isNetworkError = params.isNetworkError;
    this.isTimeout = params.isTimeout;
    this.original = params.original;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, 
});

apiClient.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData && config.headers) {
    config.headers.delete("Content-Type"); 
  }
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; detail?: string }>) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new ApiError({
          message: "The server took too long to respond.",
          status: null,
          isNetworkError: false,
          isTimeout: true,
          original: error,
        })
      );
    }

    if (!error.response) {
      return Promise.reject(
        new ApiError({
          message: "Could not reach the server. Check your connection.",
          status: null,
          isNetworkError: true,
          isTimeout: false,
          original: error,
        })
      );
    }

    const status = error.response.status;
    const backendMessage =
      error.response.data?.error ?? error.response.data?.detail;

    let message = backendMessage ?? `Request failed with status ${status}.`;
    if (!backendMessage) {
      if (status === 401) message = "Your session has expired.";
      else if (status === 403) message = "You don't have permission to do that.";
      else if (status >= 500) message = "The server ran into a problem.";
    }

    return Promise.reject(
      new ApiError({
        message,
        status,
        isNetworkError: false,
        isTimeout: false,
        original: error,
      })
    );
  }
);


