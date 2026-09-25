import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 90000,

});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Let TanStack Query handle errors in its error state
    return Promise.reject(err);
  }
);

export async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await apiClient.get<T>(path, { params });
  return res.data;
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await apiClient.post<T>(path, body);
  return res.data;
}
